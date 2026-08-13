"use client";

import Image from "next/image";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";
import { useSupportSessionDetail } from "@/features/support/hooks/useSupport";
import { ProductMessageMetadata } from "@/features/support/types/support.types";
import { InventoryItemDto } from "@/features/stock/types/stock.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ProductAttachmentPopover } from "./components/product-attachment-popover";

export interface SupportSession {
  id: string;
  status: "OPEN" | "ACTIVE" | "CLOSED";
  customerUserId: string;
  customerName?: string | null;
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
  senderRole: "CUSTOMER" | "STAFF" | "SYSTEM";
  content: string;
  metadata?: Record<string, unknown> | null;
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

  const activeSessionId = activeSession?.id;

  // Real-time detail query for active session
  const { data: sessionDetail } = useSupportSessionDetail(
    activeSessionId || "",
  );
  const currentSession = sessionDetail || activeSession;
  const isClosed = currentSession?.status === "CLOSED";

  // Close reason modal state
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("Đã giải quyết");

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
      setFilterTab("ACTIVE");
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

  // Read Receipt Mutation (TC-STF-08 Step 6: POST /support/sessions/:id/read { lastReadSeq })
  const readReceiptMutation = useMutation({
    mutationFn: ({ id, lastReadSeq }: { id: string; lastReadSeq: number }) =>
      apiClient.post(`${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/read`, {
        lastReadSeq,
      }),
  });

  // Close Session Mutation (TC-STF-08 Step 7: POST /support/sessions/:id/close { reason })
  const closeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/close`, {
        reason,
      }),
    onSuccess: () => {
      toast.success("Đã đóng phiên hỗ trợ khách hàng!");
      queryClient.invalidateQueries({ queryKey: ["support-sessions-queue"] });
      setActiveSession(null);
      setMessagesList([]);
      setCloseModalOpen(false);
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

  // Send Message Mutation (TC-STF-08 Step 5: POST /support/sessions/:id/messages { content })
  const sendMessageMutation = useMutation({
    mutationFn: ({
      id,
      content,
      metadata,
    }: {
      id: string;
      content: string;
      metadata?: Record<string, unknown>;
    }) =>
      apiClient.post<ChatMessage>(
        `${API_ENDPOINTS.SUPPORT.SESSIONS}/${id}/messages`,
        { content, metadata },
      ),
    onSuccess: (res) => {
      setMessageInput("");
      setMessagesList((prev) => [...prev, res.data]);
      if (res.data.seq > lastSeqRef.current) {
        lastSeqRef.current = res.data.seq;
        // Emit read receipt after sending
        if (activeSession?.id) {
          readReceiptMutation.mutate({
            id: activeSession.id,
            lastReadSeq: res.data.seq,
          });
        }
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

            // Emit read receipt for new incoming messages (TC-STF-08 Step 6)
            void apiClient
              .post(
                `${API_ENDPOINTS.SUPPORT.SESSIONS}/${activeSessionId}/read`,
                { lastReadSeq: maxSeq },
              )
              .catch(() => undefined);

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

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    closeMutation.mutate({
      id: activeSession.id,
      reason: closeReason.trim() || "Đã giải quyết",
    });
  };

  const handleAttachProduct = (product: InventoryItemDto) => {
    if (!activeSession) return;
    sendMessageMutation.mutate({
      id: activeSession.id,
      content: `[Sản phẩm đính kèm] ${product.productName}`,
      metadata: {
        type: "product",
        productId: product.productId,
        productVariantId: product.productVariantId,
        productName: product.productName,
        priceVnd: product.priceVnd,
        imageUrl: product.imageUrl,
      },
    });
  };

  const sessions = queueData?.items || [];

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        className="shrink-0"
        icon={MessageSquare}
        title="Tổng Đài Chat Hỗ Trợ Khách Hàng 1-1 (Support Center)"
        description="Tiếp nhận phiên chat hỗ trợ tư vấn đơn hàng, sản phẩm và tư vấn trực tiếp cho khách hàng."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchQueue()}
            className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Làm mới hàng đợi
          </Button>
        }
      />

      {/* 2-Column Chat Desk Layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
        {/* Left Column: Queue List (4 cols) */}
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm lg:col-span-4">
          <div className="scrollbar-hide flex w-full gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterTab("OPEN")}
              className={`min-w-0 flex-1 shrink-0 rounded-2xl px-2 text-[11px] font-bold whitespace-nowrap transition-all xl:text-xs ${
                filterTab === "OPEN"
                  ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                  : "text-slate-600 hover:bg-slate-200 dark:text-slate-300"
              }`}
            >
              <span className="truncate">Chờ Tiếp Nhận</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterTab("ACTIVE")}
              className={`min-w-0 flex-1 shrink-0 rounded-2xl px-2 text-[11px] font-bold whitespace-nowrap transition-all xl:text-xs ${
                filterTab === "ACTIVE"
                  ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                  : "text-slate-600 hover:bg-slate-200 dark:text-slate-300"
              }`}
            >
              <span className="truncate">Phiên Chat Đang Mở</span>
            </Button>
          </div>

          {/* List Content */}
          <CardContent className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto p-2 dark:divide-slate-800">
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
                        ? "border border-[#2C3E35]/20 bg-[#E2EBE6]/60 dark:bg-emerald-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {session.customerName ||
                          `Khách #${session.customerUserId.slice(0, 8).toUpperCase()}`}
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
                      <span className="truncate text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
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
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm lg:col-span-8 dark:border-slate-800 dark:bg-slate-900">
          {activeSession ? (
            <>
              {/* Active Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 ${isClosed ? "bg-slate-400" : "animate-pulse bg-emerald-500"} rounded-full`}
                  ></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Phiên hỗ trợ #
                      {currentSession!.id.slice(0, 8).toUpperCase()}
                      {isClosed && (
                        <span className="ml-2 text-rose-600">(Đã đóng)</span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Khách hàng:{" "}
                      {currentSession!.customerName ||
                        `#${currentSession!.customerUserId.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseModalOpen(true)}
                  className="rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Đóng phiên chat
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messagesList.map((msg) => {
                  const isStaff = msg.senderRole === "STAFF";
                  const isSystem = msg.senderRole === "SYSTEM";

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
                            : "rounded-bl-none bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {msg.metadata?.type === "product"
                          ? (() => {
                              const pm =
                                msg.metadata as unknown as ProductMessageMetadata;
                              return (
                                <div className="flex items-center gap-3">
                                  {pm.imageUrl ? (
                                    <Image
                                      src={pm.imageUrl}
                                      alt=""
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded bg-white object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded bg-slate-200" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-semibold">
                                      {pm.productName}
                                    </p>
                                    <p className="text-[10px] opacity-80">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(pm.priceVnd)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()
                          : msg.content}
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

              {/* Input Area */}
              <div className="shrink-0 border-t border-slate-100 bg-white p-4">
                {isClosed ? (
                  <div className="flex items-center justify-center rounded-2xl bg-slate-50 py-4 text-sm text-slate-500">
                    Phiên trò chuyện đã được đóng.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-3"
                  >
                    <ProductAttachmentPopover onAttach={handleAttachProduct} />
                    <div className="relative flex-1">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Nhập tin nhắn phản hồi khách hàng..."
                        disabled={sendMessageMutation.isPending}
                        className="min-h-[44px] rounded-2xl border-slate-200 pr-12 text-sm focus-visible:ring-[#2C3E35]"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={
                        !messageInput.trim() || sendMessageMutation.isPending
                      }
                      className="h-[44px] w-[44px] shrink-0 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-200" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
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

      {/* Close Ticket Modal with Reason (TC-STF-08 Step 7) */}
      {closeModalOpen && activeSession && (
        <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
                <XCircle className="h-5 w-5" />
                Xác Nhận Đóng Phiên Hỗ Trợ
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Nhập lý do đóng phiên hỗ trợ #
                {activeSession.id.slice(0, 8).toUpperCase()}.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleConfirmClose}
              className="flex flex-col gap-4 py-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="close-reason"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Lý do đóng phiên (Reason) *:
                </Label>
                <Input
                  id="close-reason"
                  required
                  placeholder="VD: Đã giải quyết, Khách hàng không phản hồi..."
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCloseModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={closeMutation.isPending || !closeReason.trim()}
                  className="rounded-xl bg-rose-600 px-6 text-xs font-bold text-white hover:bg-rose-700"
                >
                  {closeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Đóng Phiên Chat"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
