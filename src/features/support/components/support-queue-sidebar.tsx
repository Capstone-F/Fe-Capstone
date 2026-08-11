"use client";

import React, { useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSupportSessions } from "../hooks/useSupport";
import {
  SupportSessionResponseDto,
  SupportSessionStatus,
} from "../types/support.types";

interface SupportQueueSidebarProps {
  selectedSessionId: string | null;
  onSelectSession: (session: SupportSessionResponseDto) => void;
}

export function SupportQueueSidebar({
  selectedSessionId,
  onSelectSession,
}: SupportQueueSidebarProps) {
  const [filterTab, setFilterTab] = useState<
    "ALL" | "UNASSIGNED" | "MINE" | "CLOSED"
  >("UNASSIGNED");

  const queryParams = {
    status: filterTab === "CLOSED" ? SupportSessionStatus.CLOSED : undefined,
    assigned:
      filterTab === "UNASSIGNED"
        ? ("unassigned" as const)
        : filterTab === "MINE"
          ? ("me" as const)
          : ("any" as const),
    limit: 50,
  };

  const { data, isLoading, refetch, isRefetching } =
    useSupportSessions(queryParams);

  const renderStatusBadge = (session: SupportSessionResponseDto) => {
    if (session.status === SupportSessionStatus.OPEN) {
      return (
        <Badge
          variant="outline"
          className="animate-pulse border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        >
          Chờ tiếp nhận
        </Badge>
      );
    }
    if (session.status === SupportSessionStatus.ACTIVE) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Đang hỗ trợ
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-slate-300 bg-slate-100 px-1.5 py-0 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        Đã đóng
      </Badge>
    );
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Hàng đợi Support
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          title="Tải lại hàng đợi"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 p-2 dark:border-slate-800">
        <Tabs
          value={filterTab}
          onValueChange={(v) =>
            setFilterTab(v as "ALL" | "UNASSIGNED" | "MINE" | "CLOSED")
          }
          className="w-full"
        >
          <TabsList className="grid h-8 grid-cols-4 p-0.5 text-[11px]">
            <TabsTrigger value="UNASSIGNED" className="px-1">
              Chờ nhận
            </TabsTrigger>
            <TabsTrigger value="MINE" className="px-1">
              Của tôi
            </TabsTrigger>
            <TabsTrigger value="ALL" className="px-1">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="CLOSED" className="px-1">
              Đã đóng
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List Content */}
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800/60">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          ))
        ) : !data || data.items.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-xs">
            Không có phiên hỗ trợ nào phù hợp.
          </div>
        ) : (
          data.items.map((session) => {
            const isSelected = session.id === selectedSessionId;
            const hasUnread = session.messageCount > session.staffLastReadSeq;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelectSession(session)}
                className={`flex w-full flex-col gap-1.5 p-3 text-left transition-colors ${
                  isSelected
                    ? "border-l-4 border-l-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex max-w-[170px] items-center gap-1.5 truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {session.customerName ||
                      `Khách #${session.customerUserId.substring(0, 6)}`}
                  </div>
                  {renderStatusBadge(session)}
                </div>

                <div className="truncate text-[11px] text-slate-600 dark:text-slate-400">
                  {session.subject || "Yêu cầu tư vấn/hỗ trợ đơn hàng"}
                </div>

                <div className="text-muted-foreground flex items-center justify-between pt-0.5 text-[10px]">
                  <span className="max-w-[180px] truncate italic">
                    {session.lastMessagePreview || "Chưa có tin nhắn"}
                  </span>
                  {hasUnread && (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
