"use client";

import React from "react";
import { Headphones } from "lucide-react";
import {
  SupportMessageResponseDto,
  SupportMessageSenderRole,
} from "../types/support.types";

interface SupportMessageBubbleProps {
  message: SupportMessageResponseDto;
  customerName?: string | null;
  assignedStaffName?: string | null;
}

export function SupportMessageBubble({
  message,
  assignedStaffName,
}: SupportMessageBubbleProps) {
  const isCustomer = message.senderRole === SupportMessageSenderRole.CUSTOMER;
  const isSystem = message.senderRole === SupportMessageSenderRole.SYSTEM;

  if (isSystem) {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {message.content}
        </span>
      </div>
    );
  }

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full flex-col ${
        isCustomer ? "items-end" : "items-start"
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
        {!isCustomer && (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Headphones className="h-2.5 w-2.5" />
          </div>
        )}
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {isCustomer
            ? "Bạn"
            : assignedStaffName || "Nhân viên hỗ trợ GlowScan"}
        </span>
        <span>•</span>
        <span>{formattedTime}</span>
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
          isCustomer
            ? "rounded-br-xs bg-emerald-600 font-normal text-white"
            : "rounded-bl-xs border border-slate-200/90 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        }`}
      >
        <p className="leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
