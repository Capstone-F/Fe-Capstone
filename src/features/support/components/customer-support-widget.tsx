"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  ChevronDown,
  Headphones,
  MessageCircle,
  MessageSquarePlus,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  useCloseSupportSession,
  useCreateSupportSession,
  useMarkSupportRead,
  useMyLiveSupportSession,
  useSendSupportMessage,
  useSupportMessagesPolling,
} from "../hooks/useSupport";
import { POPULAR_SUPPORT_TOPICS } from "./start-support-modal";
import { SupportMessageBubble } from "./support-message-bubble";
import { SupportSessionStatus } from "../types/support.types";

export function CustomerSupportWidget() {
  const { data: sessionUser } = useSession();
  const isLoggedIn = Boolean(sessionUser);

  // Widget visibility
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>(
    POPULAR_SUPPORT_TOPICS[0],
  );
  const [customSubject, setCustomSubject] = useState("");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch live session for customer
  const {
    data: liveSession,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useMyLiveSupportSession(isLoggedIn);

  const activeSessionId = liveSession?.id || "";
  const isLive =
    Boolean(liveSession) && liveSession?.status !== SupportSessionStatus.CLOSED;

  // 2. Poll messages when live
  const { data: messagesData, isLoading: messagesLoading } =
    useSupportMessagesPolling(activeSessionId, isLive && isOpen);

  // Mutations
  const createSessionMutation = useCreateSupportSession();
  const sendMessageMutation = useSendSupportMessage();
  const markReadMutation = useMarkSupportRead();
  const closeSessionMutation = useCloseSupportSession();

  const messages = messagesData?.items || [];
  const lastSeq = messagesData?.lastSeq || 0;

  // Calculate unread badge count when widget is closed
  const hasUnread =
    isLive &&
    messagesData?.lastSeq !== undefined &&
    liveSession?.customerLastReadSeq !== undefined &&
    messagesData.lastSeq > liveSession.customerLastReadSeq;

  // Auto mark read when widget is OPEN and new messages arrive
  const lastReadSeqRef = useRef<number>(0);
  useEffect(() => {
    if (
      isOpen &&
      isLive &&
      liveSession &&
      lastSeq > liveSession.customerLastReadSeq &&
      lastSeq > lastReadSeqRef.current
    ) {
      lastReadSeqRef.current = lastSeq;
      markReadMutation.mutate({
        id: liveSession.id,
        data: { lastReadSeq: lastSeq },
      });
    }
  }, [isOpen, isLive, liveSession, lastSeq, markReadMutation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen, messages.length]);

  if (!isLoggedIn) {
    return null; // Support widget is available for authenticated customers
  }

  // Handle starting a new session
  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    const subject =
      selectedTopic === "Khác"
        ? customSubject.trim() || "Thắc mắc tư vấn chung"
        : selectedTopic;

    createSessionMutation.mutate(
      { subject },
      {
        onSuccess: (sessionData) => {
          toast.success("Đã khởi tạo yêu cầu hỗ trợ thành công!");

          // Tự động gửi subject (vấn đề khách hàng chọn) thành tin nhắn đầu tiên
          if (sessionData && sessionData.id) {
            sendMessageMutation.mutate({
              id: sessionData.id,
              data: { content: subject },
            });
          }

          refetchSession();
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Không thể tạo phiên hỗ trợ",
          );
        },
      },
    );
  };

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeSessionId || !isLive) return;

    if (text.length > 4000) {
      toast.error("Tin nhắn tối đa 4000 ký tự");
      return;
    }

    sendMessageMutation.mutate(
      { id: activeSessionId, data: { content: text } },
      {
        onSuccess: () => {
          setInputText("");
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          if (axiosErr.response?.status === 409) {
            toast.error("Phiên tư vấn đã kết thúc.");
            refetchSession();
            return;
          }
          toast.error(
            axiosErr.response?.data?.message || "Không thể gửi tin nhắn",
          );
        },
      },
    );
  };

  // Handle closing current session
  const handleCloseSession = () => {
    if (!liveSession) return;
    closeSessionMutation.mutate(
      {
        id: liveSession.id,
        data: { reason: "Khách hàng yêu cầu kết thúc" },
      },
      {
        onSuccess: () => {
          toast.info("Đã kết thúc phiên hỗ trợ");
          setConfirmCloseOpen(false);
          refetchSession();
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Lỗi khi đóng phiên tư vấn",
          );
        },
      },
    );
  };

  return (
    <>
      {/* Floating Action Toggle Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative h-13 w-13 rounded-full shadow-xl transition-all duration-300 ${
            isOpen
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : isLive
                ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <Headphones className="h-6 w-6" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                  !
                </span>
              )}
              {isLive && !hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 animate-pulse rounded-full bg-emerald-400 ring-2 ring-white" />
              )}
            </>
          )}
        </Button>
      </div>

      {/* Floating Support Window */}
      {isOpen && (
        <Card className="animate-in fade-in slide-in-from-bottom-5 fixed right-6 bottom-22 z-50 flex h-[530px] max-h-[calc(100vh-7rem)] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-slate-200/90 shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-emerald-700 to-teal-700 p-3.5 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-xs">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                {isLive && (
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-800" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold tracking-wide">
                  Tổng Đài Hỗ Trợ GlowScan
                </h4>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-100">
                  {sessionLoading ? (
                    <span>Đang kiểm tra...</span>
                  ) : liveSession?.status === SupportSessionStatus.OPEN ? (
                    <span className="text-amber-200">
                      ● Đang chờ tiếp nhận...
                    </span>
                  ) : liveSession?.status === SupportSessionStatus.ACTIVE ? (
                    <span className="text-emerald-200">
                      ● Đang tư vấn ({liveSession.assignedStaffName || "Staff"})
                    </span>
                  ) : (
                    <span className="text-emerald-100/80">Sẵn sàng 1-1</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isLive && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmCloseOpen(true)}
                  className="h-7 px-2 text-[11px] text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Đóng phiên
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Confirm Close Session Overlay inside Widget */}
          {confirmCloseOpen && (
            <div className="bg-background/95 absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs">
              <XCircle className="mb-2 h-10 w-10 text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Kết thúc phiên tư vấn?
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Bạn có chắc chắn muốn kết thúc phiên hỗ trợ hiện tại không?
              </p>
              <div className="mt-4 flex w-full max-w-xs gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmCloseOpen(false)}
                  className="flex-1 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleCloseSession}
                  disabled={closeSessionMutation.isPending}
                  className="flex-1 bg-rose-600 text-xs text-white hover:bg-rose-700"
                >
                  {closeSessionMutation.isPending
                    ? "Đang đóng..."
                    : "Đóng phiên"}
                </Button>
              </div>
            </div>
          )}

          {/* Window Body */}
          {sessionLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3 p-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ) : !isLive ? (
            /* Topic Selection State */
            <div className="flex flex-1 flex-col overflow-y-auto p-5">
              <div className="mb-4 flex flex-col items-center text-center">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <MessageSquarePlus className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tư Vấn Hỗ Trợ 1-1
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Đội ngũ dược sĩ da liễu và chuyên viên vận hành sẵn sàng hỗ
                  trợ thắc mắc của bạn.
                </p>
              </div>

              <form onSubmit={handleStartSession} className="flex-1 space-y-3">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Chọn chủ đề cần hỗ trợ:
                </label>
                <div className="space-y-2">
                  {POPULAR_SUPPORT_TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <span>{topic}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedTopic === "Khác" && (
                  <div className="pt-1">
                    <Input
                      placeholder="Nhập nội dung/chủ đề cụ thể..."
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                )}

                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={createSessionMutation.isPending}
                    className="w-full gap-2 bg-emerald-600 py-2.5 text-xs text-white shadow-md hover:bg-emerald-700"
                  >
                    {createSessionMutation.isPending ? (
                      "Đang kết nối..."
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        <span>Bắt Đầu Yêu Cầu Tư Vấn</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Live Chat Message Area */
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Waiting status notice banner */}
              {liveSession?.status === SupportSessionStatus.OPEN && (
                <div className="border-b border-amber-200 bg-amber-50 p-2.5 text-center text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  💬 Yêu cầu của bạn đã được gửi. Nhân viên tư vấn sẽ tiếp nhận
                  trong giây lát...
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3.5 dark:bg-slate-950/30">
                {messagesLoading && messages.length === 0 ? (
                  <div className="space-y-3 p-2">
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="ml-auto h-10 w-48" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-center text-xs text-slate-400">
                    Chưa có tin nhắn nào trong phiên tư vấn này.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <SupportMessageBubble
                      key={msg.id}
                      message={msg}
                      customerName={liveSession?.customerName}
                      assignedStaffName={liveSession?.assignedStaffName}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900"
              >
                <Input
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 text-xs"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputText.trim() || sendMessageMutation.isPending}
                  className="h-9 w-9 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
