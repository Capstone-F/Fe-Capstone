"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, RefreshCw, Send } from "lucide-react";
import type { ZIM, ZIMMessage, ZIMTextMessage } from "zego-zim-web";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { consultationApi } from "../api/consultation.api";

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

export function ZegoChatPanel({ bookingId }: ZegoChatPanelProps) {
  const zimRef = useRef<ZIM | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    let disposed = false;
    let instance: ZIM | null = null;

    async function connect() {
      setStatus("loading");
      setError(null);

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
          if (incoming.length) {
            setMessages((current) => mergeMessages(current, incoming));
          }
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
            count: 50,
            reverse: true,
            mode: zimModule.ZIMMessageQueryMode.General,
          },
        );
        const historyMessages = history.messageList
          .map(toChatMessage)
          .filter((message): message is ChatMessage => message !== null);
        setMessages(historyMessages.sort((a, b) => a.timestamp - b.timestamp));
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
      if (instance) {
        instance.off("messageReceived");
        instance.off("messageSentStatusChanged");
        instance.off("tokenWillExpire");
        instance.logout();
        instance.destroy();
      }
    };
  }, [attempt, bookingId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = messageText.trim();
    const zim = zimRef.current;
    if (!text || !zim || !peerUserID || sending) return;

    setSending(true);
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

  if (status === "loading") {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải cuộc trò chuyện...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
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
    );
  }

  return (
    <div className="flex min-h-[520px] flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{peerName}</p>
        <p className="text-xs text-emerald-700">Đã kết nối</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">
            Chưa có tin nhắn trong cuộc trò chuyện này.
          </div>
        )}
        {messages.map((message) => {
          const outgoing = message.senderUserID === currentUserID;
          return (
            <div
              key={message.id}
              className={`flex ${outgoing ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${
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
                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && status === "ready" && (
        <p className="border-t bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
        <Input
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Nhập tin nhắn"
          maxLength={2000}
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Gửi tin nhắn</span>
        </Button>
      </form>
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
