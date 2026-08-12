"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Headphones,
  MessageSquarePlus,
  Send,
  XCircle,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { POPULAR_SUPPORT_TOPICS } from "@/features/support/components/start-support-modal";
import { SupportMessageBubble } from "@/features/support/components/support-message-bubble";
import {
  useCloseSupportSession,
  useCreateSupportSession,
  useMarkSupportRead,
  useMyLiveSupportSession,
  useSendSupportMessage,
  useSupportMessagesPolling,
} from "@/features/support/hooks/useSupport";
import { SupportSessionStatus } from "@/features/support/types/support.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function CustomerSupportPage() {
  const { data: sessionUser, isLoading: authLoading } = useSession();
  const isLoggedIn = Boolean(sessionUser);

  const [inputText, setInputText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>(
    POPULAR_SUPPORT_TOPICS[0],
  );
  const [customSubject, setCustomSubject] = useState("");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch live session
  const {
    data: liveSession,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useMyLiveSupportSession(isLoggedIn);

  const activeSessionId = liveSession?.id || "";
  const isLive =
    Boolean(liveSession) && liveSession?.status !== SupportSessionStatus.CLOSED;

  // Poll messages
  const { data: messagesData, isLoading: messagesLoading } =
    useSupportMessagesPolling(activeSessionId, isLive);

  // Mutations
  const createSessionMutation = useCreateSupportSession();
  const sendMessageMutation = useSendSupportMessage();
  const markReadMutation = useMarkSupportRead();
  const closeSessionMutation = useCloseSupportSession();

  const messages = messagesData?.items || [];
  const lastSeq = messagesData?.lastSeq || 0;

  // Auto mark read
  const lastReadSeqRef = useRef<number>(0);
  useEffect(() => {
    if (
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
  }, [isLive, liveSession, lastSeq, markReadMutation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    const subject =
      selectedTopic === "Khác"
        ? customSubject.trim() || "Thắc mắc tư vấn chung"
        : selectedTopic;

    createSessionMutation.mutate(
      { subject },
      {
        onSuccess: () => {
          toast.success("Đã tạo phiên tư vấn thành công!");
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeSessionId || !isLive) return;

    if (text.length > 4000) {
      toast.error("Tin nhắn vượt quá giới hạn 4000 ký tự");
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
            toast.error("Phiên tư vấn đã bị đóng từ máy chủ.");
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

  const handleCloseSession = () => {
    if (!liveSession) return;
    closeSessionMutation.mutate(
      {
        id: liveSession.id,
        data: { reason: "Khách hàng kết thúc phiên" },
      },
      {
        onSuccess: () => {
          toast.info("Đã đóng phiên tư vấn");
          setConfirmCloseOpen(false);
          refetchSession();
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Không thể đóng phiên",
          );
        },
      },
    );
  };

  if (authLoading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center p-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Headphones className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Tổng Đài Tư Vấn GlowScan 1-1
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Vui lòng đăng nhập tài khoản khách hàng để nhắn tin trực tiếp với
            đội ngũ hỗ trợ & dược sĩ da liễu.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Top Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Hỗ Trợ Khách Hàng 1-1
            </h1>
            <p className="text-xs text-slate-500">
              Trực tiếp giải đáp thắc mắc về đơn hàng, sản phẩm và tư vấn liệu
              trình
            </p>
          </div>
        </div>

        {isLive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmCloseOpen(true)}
            className="border-rose-200 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:bg-rose-950/30"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Đóng phiên hỗ trợ
          </Button>
        )}
      </div>

      {/* Main Container */}
      <Card className="flex h-[620px] max-h-[calc(100vh-12rem)] flex-col overflow-hidden border-slate-200/90 shadow-md dark:border-slate-800">
        {/* Chat Status Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Headphones className="h-5 w-5" />
              </div>
              {isLive && (
                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Tổng Đài Hỗ Trợ GlowScan
                </span>
                {liveSession?.status === SupportSessionStatus.OPEN && (
                  <Badge
                    variant="outline"
                    className="border-amber-400 bg-amber-50 text-[10px] text-amber-700"
                  >
                    ● Chờ nhân viên tiếp nhận
                  </Badge>
                )}
                {liveSession?.status === SupportSessionStatus.ACTIVE && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500 bg-emerald-50 text-[10px] text-emerald-700"
                  >
                    ● Đang tư vấn ({liveSession.assignedStaffName || "Staff"})
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {liveSession?.subject || "Tư vấn & giải đáp trực tiếp"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {sessionLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-3 p-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
        ) : !isLive ? (
          /* Start New Session Form */
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <Headphones className="h-10 w-10" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bắt Đầu Yêu Cầu Tư Vấn 1-1
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Đội ngũ nhân viên vận hành & dược sĩ da liễu sẵn sàng giải đáp mọi
              thắc mắc của bạn nhanh chóng.
            </p>

            <form
              onSubmit={handleStartSession}
              className="mt-6 w-full max-w-sm space-y-4"
            >
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Vui lòng chọn chủ đề cần tư vấn:
                </label>
                {POPULAR_SUPPORT_TOPICS.map((topic) => {
                  const isSelected = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-all ${
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

                {selectedTopic === "Khác" && (
                  <Input
                    placeholder="Nhập nội dung/chủ đề cụ thể..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="mt-2 text-xs"
                  />
                )}
              </div>

              <Button
                type="submit"
                disabled={createSessionMutation.isPending}
                className="w-full gap-2 bg-emerald-600 py-3 text-xs text-white shadow-md hover:bg-emerald-700"
              >
                {createSessionMutation.isPending ? (
                  "Đang khởi tạo..."
                ) : (
                  <>
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>Gửi Yêu Cầu Tư Vấn</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          /* Live Chat Screen */
          <div className="flex flex-1 flex-col overflow-hidden">
            {liveSession?.status === SupportSessionStatus.OPEN && (
              <div className="border-b border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                💬 Yêu cầu của bạn đã được tiếp nhận và xếp vào hàng đợi. Nhân
                viên tư vấn sẽ phản hồi bạn trong ít phút...
              </div>
            )}

            {/* Message List */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-5 dark:bg-slate-950/30">
              {messagesLoading && messages.length === 0 ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="ml-auto h-12 w-64" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Chưa có tin nhắn nào trong phiên hỗ trợ này.
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

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
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
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                <span>Gửi</span>
              </Button>
            </form>
          </div>
        )}
      </Card>

      {/* Confirm Close Session Modal */}
      {confirmCloseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-sm p-6 text-center shadow-xl">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Kết thúc phiên hỗ trợ?
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại không?
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmCloseOpen(false)}
                className="flex-1 text-xs"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCloseSession}
                disabled={closeSessionMutation.isPending}
                className="flex-1 bg-rose-600 text-xs text-white hover:bg-rose-700"
              >
                {closeSessionMutation.isPending
                  ? "Đang đóng..."
                  : "Xác nhận đóng"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
