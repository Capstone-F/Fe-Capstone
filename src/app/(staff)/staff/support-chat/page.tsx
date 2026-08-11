"use client";

import React, { useState } from "react";
import { SupportChatRoom } from "@/features/support/components/support-chat-room";
import { SupportQueueSidebar } from "@/features/support/components/support-queue-sidebar";
import { SupportSessionResponseDto } from "@/features/support/types/support.types";
import { useSession } from "@/features/auth/hooks/useSession";

export default function SupportChatPage() {
  const { data: sessionUser } = useSession();
  const [selectedSession, setSelectedSession] =
    useState<SupportSessionResponseDto | null>(null);

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-3rem)] flex-col space-y-3">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Tổng Đài Hỗ Trợ Khách Hàng
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Tiếp nhận phiên chat hỗ trợ 1-1, nhắn tin tư vấn trực tiếp và hoàn tất
          phiên hỗ trợ.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-12">
        {/* Left Sidebar Queue (4 cols) */}
        <div className="h-full min-h-0 md:col-span-4">
          <SupportQueueSidebar
            selectedSessionId={selectedSession?.id || null}
            onSelectSession={(session) => setSelectedSession(session)}
          />
        </div>

        {/* Right Chat Room Canvas (8 cols) */}
        <div className="h-full min-h-0 md:col-span-8">
          <SupportChatRoom
            session={selectedSession}
            currentUserId={sessionUser?.id}
            onSessionUpdated={(updatedSession) =>
              setSelectedSession(updatedSession)
            }
          />
        </div>
      </div>
    </div>
  );
}
