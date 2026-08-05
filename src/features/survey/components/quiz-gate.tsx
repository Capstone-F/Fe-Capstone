"use client";

import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

/**
 * Shown when DOB or gender is missing. The global ProfileOnboardingGuard already
 * redirects such users to /profile; this is the second net for direct links.
 */
export function QuizGate() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
        <UserRound className="h-7 w-7 text-amber-600" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-slate-900">
          Cần bổ sung thông tin hồ sơ
        </h2>
        <p className="max-w-md text-xs text-slate-600">
          Bài test loại da cần ngày sinh và giới tính để đánh giá chính xác theo
          độ tuổi. Hãy bổ sung hai thông tin này trước khi bắt đầu.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => router.push("/profile?tab=profile")}
        className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
      >
        Bổ sung hồ sơ
      </Button>
    </div>
  );
}
