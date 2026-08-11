"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Hand, Lock, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  useClaimSupportSession,
  useMarkSupportRead,
  useSendSupportMessage,
  useSupportMessagesPolling,
  useSupportSessionDetail,
} from "../hooks/useSupport";
import {
  SupportMessageSenderRole,
  SupportSessionResponseDto,
  SupportSessionStatus,
} from "../types/support.types";
import { CloseSessionModal } from "./close-session-modal";

interface SupportChatRoomProps {
  session: SupportSessionResponseDto | null;
  currentUserId?: string;
  onSessionClosed?: () => void;
  onSessionUpdated?: (session: SupportSessionResponseDto) => void;
}

export function SupportChatRoom({
  session: initialSession,
  currentUserId,
  onSessionUpdated,
}: SupportChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time detail query to ensure instantaneous updates upon claim/close
  const { data: sessionDetail } = useSupportSessionDetail(
    initialSession?.id || "",
  );
  const session = sessionDetail || initialSession;

  const isClosed = session?.status === SupportSessionStatus.CLOSED;
  const isClaimedByMe =
    session?.status === SupportSessionStatus.ACTIVE &&
    session?.assignedStaffUserId === currentUserId;
  const canClaim = session?.status === SupportSessionStatus.OPEN;

  // Hooks
  const { data: messagesData, isLoading: messagesLoading } =
    useSupportMessagesPolling(session?.id || "", Boolean(session) && !isClosed);

  const claimMutation = useClaimSupportSession();
  const sendMutation = useSendSupportMessage();
  const markReadMutation = useMarkSupportRead();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.items?.length]);

  // Auto mark read
  const lastReadSeqRef = useRef<number>(0);
  useEffect(() => {
    if (
      session &&
      messagesData?.lastSeq &&
      messagesData.lastSeq > session.staffLastReadSeq &&
      messagesData.lastSeq > lastReadSeqRef.current
    ) {
      lastReadSeqRef.current = messagesData.lastSeq;
      markReadMutation.mutate({
        id: session.id,
        data: { lastReadSeq: messagesData.lastSeq },
      });
    }
  }, [session, messagesData?.lastSeq, markReadMutation]);

  if (!session) {
    return (
      <Card className="flex h-full flex-col items-center justify-center border-slate-200/80 p-8 text-center shadow-sm dark:border-slate-800">
        <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <Hand className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">
          Chưa chọn phiên hỗ trợ
        </h3>
        <p className="text-muted-foreground mt-1 max-w-xs text-xs">
          Vui lòng chọn một phiên cần hỗ trợ ở danh sách hàng đợi bên trái để
          xem nội dung trò chuyện.
        </p>
      </Card>
    );
  }

  const handleClaim = () => {
    claimMutation.mutate(session.id, {
      onSuccess: (updatedSession) => {
        toast.success("Bạn đã tiếp nhận phiên hỗ trợ này!");
        onSessionUpdated?.(updatedSession);
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        toast.error(
          axiosErr.response?.status === 409
            ? "Phiên đã được tiếp nhận bởi nhân viên khác!"
            : "Không thể tiếp nhận phiên",
        );
      },
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content) return;

    if (content.length > 4000) {
      toast.error("Tin nhắn vượt quá giới hạn 4000 ký tự");
      return;
    }

    sendMutation.mutate(
      { id: session.id, data: { content } },
      {
        onSuccess: () => {
          setInputText("");
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Gửi tin nhắn thất bại",
          );
        },
      },
    );
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {session.customerName
              ? session.customerName.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              {session.customerName ||
                `Khách hàng #${session.customerUserId.substring(0, 8)}`}
              {session.status === SupportSessionStatus.OPEN && (
                <Badge
                  variant="outline"
                  className="border-amber-400 bg-amber-50 text-[10px] text-amber-700"
                >
                  Chờ nhận
                </Badge>
              )}
              {session.status === SupportSessionStatus.ACTIVE && (
                <Badge
                  variant="outline"
                  className="border-emerald-500 bg-emerald-50 text-[10px] text-emerald-700"
                >
                  Đang tư vấn ({session.assignedStaffName || "Nhân viên"})
                </Badge>
              )}
              {session.status === SupportSessionStatus.CLOSED && (
                <Badge
                  variant="outline"
                  className="border-slate-300 text-[10px] text-slate-500"
                >
                  Đã đóng
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {session.subject || "Yêu cầu tư vấn/hỗ trợ chung"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canClaim && (
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={claimMutation.isPending}
              className="gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              <ShieldCheck className="h-4 w-4" />
              Tiếp nhận phiên
            </Button>
          )}

          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseModalOpen(true)}
              className="text-xs text-slate-700 dark:text-slate-200"
            >
              Hoàn tất & Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Claim Banner alert if OPEN */}
      {canClaim && (
        <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 p-2.5 text-center text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <span>
            ⚠️ Phiên này đang trong hàng đợi chung. Bạn cần{" "}
            <strong>Tiếp nhận phiên</strong> để phản hồi tin nhắn cho khách
            hàng.
          </span>
        </div>
      )}

      {/* Messages Canvas */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/30">
        {messagesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="ml-auto h-12 w-64" />
            <Skeleton className="h-10 w-52" />
          </div>
        ) : !messagesData || messagesData.items.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Chưa có tin nhắn nào trong phiên hỗ trợ này.
          </div>
        ) : (
          messagesData.items.map((msg) => {
            const isStaff = msg.senderRole === SupportMessageSenderRole.STAFF;
            const isSystem = msg.senderRole === SupportMessageSenderRole.SYSTEM;

            if (isSystem) {
              return (
                <div key={msg.id} className="my-2 flex justify-center">
                  <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
              >
                <div className="mb-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
                  <span>
                    {isStaff
                      ? "Nhân viên hỗ trợ"
                      : session.customerName || "Khách hàng"}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    isStaff
                      ? "rounded-br-none bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                      : "rounded-bl-none border border-slate-200/80 bg-white text-slate-900 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Area */}
      <div className="border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {isClosed ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 rounded-md bg-slate-100 p-2 text-xs dark:bg-slate-800">
            <Lock className="h-3.5 w-3.5" /> Phiên hỗ trợ này đã kết thúc (
            {session.closeReason || "Đã đóng"}).
          </div>
        ) : !canClaim && !isClaimedByMe && session.assignedStaffUserId ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/30">
            <Lock className="h-3.5 w-3.5" /> Phiên đang được tiếp nhận bởi nhân
            viên khác ({session.assignedStaffName || "Staff"}).
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              placeholder={
                canClaim
                  ? "Nhấn 'Tiếp nhận phiên' ở trên để bắt đầu nhắn tin..."
                  : "Nhập tin nhắn hỗ trợ khách hàng (tối đa 4000 ký tự)..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={canClaim || sendMutation.isPending}
              className="flex-1 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={canClaim || !inputText.trim() || sendMutation.isPending}
              className="gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi
            </Button>
          </form>
        )}
      </div>

      {/* Close Session Modal */}
      <CloseSessionModal
        session={session}
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        onSessionUpdated={onSessionUpdated}
      />
    </Card>
  );
}
