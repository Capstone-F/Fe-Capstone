"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface QuizIntroProps {
  hasPendingSurvey: boolean;
  isBusy: boolean;
  onStart: () => void;
  onResume: () => void;
}

export function QuizIntro({
  hasPendingSurvey,
  isBusy,
  onStart,
  onResume,
}: QuizIntroProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900">
          Bài test loại da Baumann
        </h1>
        <p className="max-w-lg text-xs leading-relaxed text-slate-600">
          Trả lời một vài câu hỏi về tình trạng và thói quen chăm sóc da. Hệ
          thống sẽ tự xác định loại da của bạn trong 16 nhóm Baumann — bạn không
          cần tự chọn mã loại da.
        </p>
      </div>

      {hasPendingSurvey && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-[11px] font-medium text-amber-700">
          Bạn có một bài test đang làm dở. Tiếp tục để giữ lại các câu đã trả
          lời.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasPendingSurvey && (
          <Button
            type="button"
            disabled={isBusy}
            onClick={onResume}
            className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Tiếp tục bài đang làm"
            )}
          </Button>
        )}
        <Button
          type="button"
          variant={hasPendingSurvey ? "outline" : "default"}
          disabled={isBusy}
          onClick={onStart}
          className={
            hasPendingSurvey
              ? "rounded-xl border-slate-300 px-6 text-xs font-bold text-slate-700"
              : "rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
          }
        >
          {isBusy && !hasPendingSurvey ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : hasPendingSurvey ? (
            "Làm bài mới"
          ) : (
            "Bắt đầu bài test"
          )}
        </Button>
      </div>
    </div>
  );
}
