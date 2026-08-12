"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  UserCheck,
  XCircle,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";

export interface SupportSession {
  id: string;
  status: "OPEN" | "ACTIVE" | "CLOSED";
  customerUserId: string;
  assignedStaffUserId?: string | null;
  lastMessageText?: string;
  messageCount: number;
  lastReadSeq?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderUserId: string;
  senderRole: "customer" | "staff" | "system";
  content: string;
  seq: number;
  createdAt: string;
}

export function SupportChatView() {
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<"OPEN" | "ACTIVE">("OPEN");
  const [activeSession, setActiveSession] = useState<SupportSession | null>(
    null,
  );

  const [messageInput, setMessageInput] = useState("");
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const lastSeqRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Queue query: OPEN (unassigned) vs ACTIVE (me)
  const {
    data: queueData,
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ["support-sessions-queue", filterTab],
    queryFn: async () => {
      const params: Record<string, string> = {
        status: filterTab,
      };
      if (filterTab === "OPEN") {
        params.assigned = "unassigned";
      } else {
        params.assigned = "me";
      }
      const res = await apiClient.get<{
        items: SupportSession[];
        total: number;
      }>(API_ENDPOINTS.SUPPORT.SESSIONS, { params });
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Claim Session Mutation
  const claimMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SupportSession>(
        `${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/claim`,
      ),
    onSuccess: (res) => {
      toast.success("Tiếp nhận phiên hỗ trợ thành công!");
      queryClient.invalidateQueries({ queryKey: ["support-sessions-queue"] });
      setActiveSession(res.data);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Phiên tư vấn này đã được nhân viên khác tiếp nhận!");
        refetchQueue();
      } else {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể tiếp nhận phiên";
        toast.error(msg);
      }
    },
  });

  // Close Session Mutation
  const closeMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/close`),
    onSuccess: () => {
      toast.success("Đã đóng phiên hỗ trợ khách hàng!");
      queryClient.invalidateQueries({ queryKey: ["support-sessions-queue"] });
      setActiveSession(null);
      setMessagesList([]);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể đóng phiên";
      toast.error(msg);
    },
  });

  const scrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiClient.post<ChatMessage>(
        `${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/messages`,
        { content },
      ),
    onSuccess: (res) => {
      setMessageInput("");
      setMessagesList((prev) => [...prev, res.data]);
      if (res.data.seq > lastSeqRef.current) {
        lastSeqRef.current = res.data.seq;
      }
      scrollToBottom();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể gửi tin nhắn";
      toast.error(msg);
    },
  });

  const activeSessionId = activeSession?.id;

  // Initial Messages Fetch & Polling Loop
  useEffect(() => {
    if (!activeSessionId) return;

    let isMounted = true;
    lastSeqRef.current = 0;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get<{ items: ChatMessage[] }>(
          `${API_ENDPOINTS.SUPPORT.SESSIONS}/${activeSessionId}/messages`,
          { params: { afterSeq: lastSeqRef.current } },
        );
        if (isMounted && res.data?.items?.length) {
          setMessagesList((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = res.data.items.filter(
              (m) => !existingIds.has(m.id),
            );
            if (newMsgs.length === 0) return prev;
            const updated = [...prev, ...newMsgs];
            const maxSeq = Math.max(...updated.map((m) => m.seq || 0));
            lastSeqRef.current = maxSeq;
            return updated;
          });
          scrollToBottom();
        }
      } catch {
        // Silent poll error
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeSessionId, scrollToBottom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSession) return;
    sendMessageMutation.mutate({
      id: activeSession.id,
      content: messageInput.trim(),
    });
  };

  const sessions = queueData?.items || [];

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-6 p-6">
      {/* Header Banner */}
      <div className="flex shrink-0 items-center justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tổng Đài Chat Hỗ Trợ Khách Hàng 1-1 (Support Center)
            </h2>
            <p className="text-xs text-slate-500">
              Tiếp nhận phiên chat hỗ trợ tư vấn đơn hàng, sản phẩm và tư vấn
              trực tiếp cho khách hàng.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetchQueue()}
          className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Làm mới hàng đợi
        </Button>
      </div>

      {/* 2-Column Chat Desk Layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
        {/* Left Column: Queue List (4 cols) */}
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm lg:col-span-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-100 bg-slate-50/50 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterTab("OPEN")}
              className={`flex-1 rounded-2xl text-xs font-bold transition-all ${
                filterTab === "OPEN"
                  ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chờ Tiếp Nhận (OPEN)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterTab("ACTIVE")}
              className={`flex-1 rounded-2xl text-xs font-bold transition-all ${
                filterTab === "ACTIVE"
                  ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Đang Chat Của Tôi (ACTIVE)
            </Button>
          </div>

          {/* List Content */}
          <CardContent className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto p-2">
            {isQueueLoading ? (
              <div className="flex items-center justify-center p-8 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />{" "}
                Đang tải hàng đợi...
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 p-8 text-center text-xs text-slate-400">
                <MessageSquare className="h-8 w-8 text-slate-300" />
                <span>Không có phiên chat nào ở mục này</span>
              </div>
            ) : (
              sessions.map((session) => {
                const isSelected = activeSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (session.status === "ACTIVE") {
                        setActiveSession(session);
                        setMessagesList([]);
                      }
                    }}
                    className={`flex cursor-pointer flex-col gap-2 rounded-2xl p-3 transition-all ${
                      isSelected
                        ? "border border-[#2C3E35]/20 bg-[#E2EBE6]/60"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Khách #
                        {session.customerUserId.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(session.createdAt).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>

                    {session.status === "OPEN" ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          claimMutation.mutate(session.id);
                        }}
                        disabled={claimMutation.isPending}
                        className="mt-1 h-7 rounded-xl bg-[#2C3E35] text-[11px] font-bold text-white hover:bg-[#3A5246]"
                      >
                        <UserCheck className="mr-1 h-3.5 w-3.5" /> Tiếp nhận
                        phiên chat ➔
                      </Button>
                    ) : (
                      <span className="truncate text-[11px] font-semibold text-emerald-800">
                        Đang trò chuyện ({session.messageCount} tin nhắn)
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Column: Chat Conversation Pane (8 cols) */}
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm lg:col-span-8">
          {activeSession ? (
            <>
              {/* Active Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Phiên hỗ trợ #{activeSession.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      User ID Khách hàng: {activeSession.customerUserId}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => closeMutation.mutate(activeSession.id)}
                  disabled={closeMutation.isPending}
                  className="rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Đóng phiên chat
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messagesList.map((msg) => {
                  const isStaff = msg.senderRole === "staff";
                  const isSystem = msg.senderRole === "system";

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="my-1 text-center text-[11px] font-semibold text-slate-400"
                      >
                        — {msg.content} —
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isStaff
                            ? "rounded-br-none bg-[#2C3E35] text-white"
                            : "rounded-bl-none bg-slate-100 text-slate-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="mt-1 px-1 text-[9px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-slate-50/50 p-3"
              >
                <Input
                  placeholder="Nhập tin nhắn phản hồi khách hàng..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 rounded-xl border-slate-200 bg-white text-xs"
                />
                <Button
                  type="submit"
                  disabled={
                    !messageInput.trim() || sendMessageMutation.isPending
                  }
                  className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white hover:bg-[#3A5246]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-200" />
              <span className="text-sm font-bold text-slate-600">
                Chọn một phiên chat từ danh sách bên trái
              </span>
              <p className="max-w-xs text-slate-400">
                Hoặc nhấn &quot;Tiếp nhận phiên chat&quot; ở tab Chờ Tiếp Nhận
                để bắt đầu trao đổi với khách hàng.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
