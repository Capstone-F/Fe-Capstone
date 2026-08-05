"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { Button } from "@/shared/components/ui/button";
import { BaumannResultCard } from "../components/baumann-result-card";
import { mapBaumannResult } from "../mapper/baumann.mapper";

export function SkinQuizResultPage() {
  const router = useRouter();
  const { data: profile, isLoading, isFetching, refetch } = useProfile();
  const result = mapBaumannResult(profile?.skinType, profile?.baumannScores);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {result ? (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <BaumannResultCard result={result} />
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              onClick={() => router.push("/profile?tab=baumann")}
              className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
            >
              Về hồ sơ của tôi
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/skin-quiz")}
              className="rounded-xl border-slate-300 px-6 text-xs font-bold text-slate-700"
            >
              Làm lại bài test
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-base font-bold text-slate-900">
            Chưa xác định được loại da
          </h1>
          <p className="max-w-md text-xs text-slate-600">
            Hồ sơ của bạn chưa có kết quả Baumann. Nếu bạn vừa hoàn tất bài
            test, hãy tải lại sau vài giây.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="rounded-xl border-slate-300 px-6 text-xs font-bold text-slate-700"
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Tải lại
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/skin-quiz")}
              className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
            >
              Làm bài test ngay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
