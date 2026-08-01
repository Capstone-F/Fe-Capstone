"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  History,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import type { ZIM, ZIMMessage, ZIMTextMessage } from "zego-zim-web";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { consultationApi } from "../api/consultation.api";

const HISTORY_PAGE_SIZE = 50;
const BOTTOM_THRESHOLD_PX = 48;

interface ChatMessage {
  id: string;
  text: string;
  senderUserID: string;
  timestamp: number;
  sentStatus?: number;
}

interface ZegoChatPanelProps {
  bookingId: string;
}

interface ScrollRestore {
  scrollHeight: number;
  scrollTop: number;
}

function toChatMessage(message: ZIMMessage): ChatMessage | null {
  if (!("message" in message) || typeof message.message !== "string") {
    return null;
  }
  return {
    id:
      message.messageID ??
      message.localMessageID ??
      `${message.senderUserID}-${message.timestamp}-${message.message}`,
    text: message.message,
    senderUserID: message.senderUserID ?? "",
    timestamp: message.timestamp ?? Date.now(),
    sentStatus: message.sentStatus,
  };
}

function getZimErrorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof Error && reason.message) return reason.message;
  if (reason && typeof reason === "object") {
    const zimError = reason as { code?: unknown; message?: unknown };
    if (typeof zimError.message === "string" && zimError.message) {
      return typeof zimError.code === "number"
        ? `${zimError.message} (ZIM ${zimError.code})`
        : zimError.message;
    }
  }
  return fallback;
}

function sortRawMessages(messages: ZIMMessage[]): ZIMMessage[] {
  return [...messages].sort((left, right) => {
    const leftTimestamp = left.timestamp ?? 0;
    const rightTimestamp = right.timestamp ?? 0;
    return leftTimestamp - rightTimestamp;
  });
}

function getDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (getDayKey(timestamp) === getDayKey(today.getTime())) return "Hôm nay";
  if (getDayKey(timestamp) === getDayKey(yesterday.getTime())) {
    return "Hôm qua";
  }

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ZegoChatPanel({ bookingId }: ZegoChatPanelProps) {
  const zimRef = useRef<ZIM | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const oldestMessageRef = useRef<ZIMMessage | null>(null);
  const shouldFollowLatestRef = useRef(true);
  const scrollRestoreRef = useRef<ScrollRestore | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserID, setCurrentUserID] = useState("");
  const [peerUserID, setPeerUserID] = useState("");
  const [peerName, setPeerName] = useState("Người tư vấn");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isNearBottom = useCallback(() => {
    const element = messageListRef.current;
    if (!element) return true;
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      BOTTOM_THRESHOLD_PX
    );
  }, []);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    const element = messageListRef.current;
    if (!element) return;
    shouldFollowLatestRef.current = true;
    setUnreadCount(0);
    element.scrollTo({ top: element.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    let disposed = false;
    let instance: ZIM | null = null;

    async function connect() {
      setStatus("loading");
      setError(null);
      setMessages([]);
      setUnreadCount(0);
      setHasOlderMessages(true);
      oldestMessageRef.current = null;
      shouldFollowLatestRef.current = true;

      try {
        const [{ data }, zimModule] = await Promise.all([
          consultationApi.getChatToken(bookingId),
          import("zego-zim-web"),
        ]);
        if (disposed) return;

        instance =
          zimModule.ZIM.create({ appID: data.appID }) ??
          zimModule.ZIM.getInstance();
        if (!instance) throw new Error("Không thể tạo kết nối ZIM.");

        setCurrentUserID(data.userID);
        setPeerUserID(data.peerUserID);
        setPeerName(data.peerUserName);

        instance.on("messageReceived", (_zim, result) => {
          const incoming = result.messageList
            .filter(
              (message) =>
                message.conversationID === data.peerUserID ||
                message.senderUserID === data.peerUserID,
            )
            .map(toChatMessage)
            .filter((message): message is ChatMessage => message !== null);
          if (!incoming.length) return;

          const followLatest = isNearBottom();
          shouldFollowLatestRef.current = followLatest;
          if (!followLatest) {
            setUnreadCount((current) => current + incoming.length);
          }
          setMessages((current) => mergeMessages(current, incoming));
        });

        instance.on("messageSentStatusChanged", (_zim, result) => {
          const changed = result.infos
            .map((info) => toChatMessage(info.message))
            .filter((message): message is ChatMessage => message !== null);
          if (changed.length) {
            setMessages((current) => mergeMessages(current, changed));
          }
        });

        instance.on("tokenWillExpire", (zim) => {
          void consultationApi
            .getChatToken(bookingId)
            .then((response) => zim.renewToken(response.data.token))
            .catch(() => setError("Không thể gia hạn phiên trò chuyện."));
        });

        await instance.login(data.userID, {
          userName: data.userName,
          token: data.token,
          isOfflineLogin: false,
          customStatus: "",
          customStatusDuration: 0,
        });
        if (disposed) return;

        const history = await instance.queryHistoryMessage(
          data.peerUserID,
          zimModule.ZIMConversationType.Peer,
          {
            count: HISTORY_PAGE_SIZE,
            reverse: true,
            mode: zimModule.ZIMMessageQueryMode.General,
          },
        );
        const rawHistory = sortRawMessages(history.messageList);
        const historyMessages = rawHistory
          .map(toChatMessage)
          .filter((message): message is ChatMessage => message !== null);

        oldestMessageRef.current = rawHistory[0] ?? null;
        setHasOlderMessages(rawHistory.length === HISTORY_PAGE_SIZE);
        setMessages((current) => mergeMessages(current, historyMessages));
        zimRef.current = instance;
        setStatus("ready");
      } catch (reason) {
        if (disposed) return;
        instance?.destroy();
        setError(getZimErrorMessage(reason, "Không thể mở cuộc trò chuyện."));
        setStatus("error");
      }
    }

    void connect();

    return () => {
      disposed = true;
      zimRef.current = null;
      oldestMessageRef.current = null;
      if (instance) {
        instance.off("messageReceived");
        instance.off("messageSentStatusChanged");
        instance.off("tokenWillExpire");
        instance.logout();
        instance.destroy();
      }
    };
  }, [attempt, bookingId, isNearBottom]);

  useLayoutEffect(() => {
    const element = messageListRef.current;
    if (!element || status !== "ready") return;

    const restore = scrollRestoreRef.current;
    if (restore) {
      element.scrollTop =
        restore.scrollTop + (element.scrollHeight - restore.scrollHeight);
      scrollRestoreRef.current = null;
      return;
    }

    if (shouldFollowLatestRef.current) {
      element.scrollTop = element.scrollHeight;
      setUnreadCount(0);
    }
  }, [messages, status]);

  async function loadOlderMessages() {
    const zim = zimRef.current;
    const anchor = oldestMessageRef.current;
    if (!zim || !anchor || !peerUserID || loadingOlder || !hasOlderMessages) {
      return;
    }

    const element = messageListRef.current;
    if (element) {
      scrollRestoreRef.current = {
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop,
      };
    }

    setLoadingOlder(true);
    try {
      const zimModule = await import("zego-zim-web");
      const history = await zim.queryHistoryMessage(
        peerUserID,
        zimModule.ZIMConversationType.Peer,
        {
          count: HISTORY_PAGE_SIZE,
          reverse: true,
          mode: zimModule.ZIMMessageQueryMode.General,
          nextMessage: anchor,
        },
      );
      const rawHistory = sortRawMessages(history.messageList);
      const olderMessages = rawHistory
        .map(toChatMessage)
        .filter((message): message is ChatMessage => message !== null);
      const oldestTimestamp = anchor.timestamp ?? 0;
      const olderThanAnchor = rawHistory.filter(
        (message) => (message.timestamp ?? 0) < oldestTimestamp,
      );

      if (olderThanAnchor.length) {
        oldestMessageRef.current = olderThanAnchor[0];
      }
      setHasOlderMessages(
        olderThanAnchor.length > 0 && rawHistory.length === HISTORY_PAGE_SIZE,
      );
      setMessages((current) => mergeMessages(current, olderMessages));
    } catch (reason) {
      scrollRestoreRef.current = null;
      setError(getZimErrorMessage(reason, "Không thể tải tin nhắn cũ."));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = messageText.trim();
    const zim = zimRef.current;
    if (!text || !zim || !peerUserID || sending) return;

    setSending(true);
    setError(null);
    shouldFollowLatestRef.current = true;
    try {
      const zimModule = await import("zego-zim-web");
      const message: ZIMTextMessage = {
        type: zimModule.ZIMMessageType.Text,
        message: text,
      };
      const result = await zim.sendMessage(
        message,
        peerUserID,
        zimModule.ZIMConversationType.Peer,
        { priority: zimModule.ZIMMessagePriority.Low },
      );
      const sent = toChatMessage(result.message);
      if (sent) setMessages((current) => mergeMessages(current, [sent]));
      setMessageText("");
    } catch (reason) {
      setError(getZimErrorMessage(reason, "Gửi tin nhắn lỗi."));
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function handleMessageListScroll() {
    const atBottom = isNearBottom();
    shouldFollowLatestRef.current = atBottom;
    if (atBottom) setUnreadCount(0);
  }

  if (status === "loading") {
    return (
      <ChatFrame>
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải cuộc trò chuyện...
        </div>
      </ChatFrame>
    );
  }

  if (status === "error") {
    return (
      <ChatFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageSquare className="h-8 w-8 text-slate-400" />
          <p className="max-w-md text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Kết nối lại
          </Button>
        </div>
      </ChatFrame>
    );
  }

  return (
    <ChatFrame>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {peerName}
          </p>
          <p className="text-xs text-emerald-700">Đã kết nối</p>
        </div>
        <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={messageListRef}
          className="h-full overflow-y-auto bg-slate-50 px-4 py-4"
          onScroll={handleMessageListScroll}
        >
          {hasOlderMessages && (
            <div className="mb-4 flex justify-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={loadingOlder}
                onClick={() => void loadOlderMessages()}
              >
                {loadingOlder ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <History className="mr-2 h-3.5 w-3.5" />
                )}
                Tải tin nhắn cũ
              </Button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-500">
              Chưa có tin nhắn trong cuộc trò chuyện này.
            </div>
          )}

          <div className="space-y-3">
            {messages.map((message, index) => {
              const outgoing = message.senderUserID === currentUserID;
              const previousMessage = messages[index - 1];
              const showDayLabel =
                !previousMessage ||
                getDayKey(previousMessage.timestamp) !==
                  getDayKey(message.timestamp);

              return (
                <div key={message.id}>
                  {showDayLabel && (
                    <div className="my-5 flex items-center gap-3 text-xs text-slate-400 first:mt-0">
                      <span className="h-px flex-1 bg-slate-200" />
                      <span>{formatDayLabel(message.timestamp)}</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}
                  <div
                    className={`flex ${outgoing ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-lg px-3 py-2 text-sm sm:max-w-[72%] ${
                        outgoing
                          ? "bg-emerald-700 text-white"
                          : "border bg-white text-slate-800"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p
                        className={`mt-1 text-[10px] ${outgoing ? "text-emerald-100" : "text-slate-400"}`}
                      >
                        {message.sentStatus === 2 ? "Gửi thất bại · " : ""}
                        {new Date(message.timestamp).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            size="sm"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-sm"
            onClick={() => scrollToLatest()}
          >
            <ChevronDown className="mr-1.5 h-4 w-4" />
            {unreadCount} tin nhắn mới
          </Button>
        )}
      </div>

      {error && (
        <p className="shrink-0 border-t bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <form
        ref={formRef}
        onSubmit={handleSend}
        className="flex shrink-0 items-end gap-2 border-t bg-white p-3"
      >
        <div className="min-w-0 flex-1">
          <Textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Nhập tin nhắn"
            maxLength={2000}
            rows={1}
            disabled={sending}
            className="max-h-28 min-h-10 resize-none"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {messageText.length}/2000
          </p>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!messageText.trim() || sending}
          aria-label="Gửi tin nhắn"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </ChatFrame>
  );
}

function ChatFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[clamp(22rem,calc(100dvh-13rem),42rem)] flex-col sm:h-[clamp(28rem,calc(100dvh-15rem),42rem)]">
      {children}
    </div>
  );
}

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp);
}
