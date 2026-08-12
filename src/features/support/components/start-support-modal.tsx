"use client";

import React, { useState } from "react";
import { CheckCircle2, Headphones, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

interface StartSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (subject: string) => void;
  isSubmitting: boolean;
}

export const POPULAR_SUPPORT_TOPICS = [
  "Tư vấn sản phẩm & Routine",
  "Hỗ trợ thắc mắc đơn hàng",
  "Tư vấn đặt lịch hẹn chuyên gia",
  "Khác",
] as const;

export function StartSupportModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: StartSupportModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    POPULAR_SUPPORT_TOPICS[0],
  );
  const [customSubject, setCustomSubject] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject =
      selectedTopic === "Khác"
        ? customSubject.trim() || "Thắc mắc tư vấn chung"
        : selectedTopic;
    onSubmit(finalSubject);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Bắt Đầu Tư Vấn Hỗ Trợ 1-1
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-slate-500">
                Chọn chủ đề cần hỗ trợ để nhân viên tư vấn tiếp nhận nhanh
                chóng.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            {POPULAR_SUPPORT_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
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
                placeholder="Nhập nội dung/chủ đề cần hỗ trợ..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="text-xs"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                "Đang khởi tạo..."
              ) : (
                <>
                  <span>Gửi Yêu Cầu</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
