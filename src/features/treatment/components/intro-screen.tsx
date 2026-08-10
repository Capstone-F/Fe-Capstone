"use client";

import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Loader2,
  Sparkles,
  Target,
  ShieldCheck,
  Dna,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { useRouter } from "next/navigation";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getRequiredSurveyProfileFields } from "@/features/treatment/lib/survey-flow";
import { useSession } from "@/features/auth/hooks/useSession";
import { GuestSurveyProfileForm } from "@/features/survey/components/guest-survey-profile-form";
import type { GuestSurveyBaseProfile } from "@/features/survey/lib/guest-survey-storage";

export function IntroScreen() {
  const { state, setFlowState, startDynamicSurvey } = useTreatment();
  const router = useRouter();
  const sessionQuery = useSession();
  const isAuthenticated = Boolean(sessionQuery.data);
  const profileQuery = useProfile(isAuthenticated);
  const [isStartingGuest, setIsStartingGuest] = useState(false);

  const missingProfileFields = getRequiredSurveyProfileFields(
    profileQuery.data,
  );
  const needsProfileUpdate = isAuthenticated && missingProfileFields.length > 0;

  const handleGuestStart = async (profile: GuestSurveyBaseProfile) => {
    setIsStartingGuest(true);
    try {
      const started = await startDynamicSurvey(profile);
      if (started) setFlowState("baumann");
    } finally {
      setIsStartingGuest(false);
    }
  };

  return (
    <div className="animate-in fade-in flex flex-1 flex-col justify-between px-4 py-6 duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="border-border/40 hover:bg-secondary/40 h-10 w-10 shrink-0 rounded-2xl border"
        >
          <ArrowLeft className="h-5 w-5 text-[#131336]" />
        </Button>
        <span className="rounded-full bg-[#6b5cf6]/10 px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#6b5cf6] uppercase">
          Khảo Sát Phân Tích Da AI
        </span>
        <div className="h-10 w-10 shrink-0" />
      </div>

      {/* 2-Column Desktop Grid Layout */}
      <div className="mx-auto my-auto grid w-full max-w-5xl gap-8 py-6 md:grid-cols-12 md:items-center">
        {/* Left Column: AI Value Proposition & Benefit Chips (Matching Mobile StartScreen spec) */}
        <div className="space-y-6 text-left md:col-span-5 md:pr-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6b5cf6]/20 bg-[#f6f4ff] px-3.5 py-1.5 text-xs font-bold text-[#6b5cf6]">
            <Sparkles className="h-4 w-4" />
            <span>Thuật toán chuẩn Y khoa Baumann</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-3xl leading-tight font-extrabold tracking-tight text-[#131336] sm:text-4xl">
              Nhận Phác Đồ Cá Nhân Hóa Từ AI GlowScan
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Hệ thống AI sẽ phân tích đặc tính da của bạn theo 4 trục lý thuyết
              Baumann, sàng lọc thành phần dị ứng và xây dựng lộ trình hoạt chất
              tối ưu nhất.
            </p>
          </div>

          {/* 3 Benefit Badges (Matching Mobile spec) */}
          <div className="grid gap-3 pt-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6b5cf6]/10 text-[#6b5cf6]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#131336]">
                  1. Khảo Sát Tình Trạng Da
                </h4>
                <p className="text-[11px] text-slate-500">
                  Trả lời câu hỏi thông minh thích ứng theo vấn đề da của bạn.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Dna className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#131336]">
                  2. Chẩn Đoán 16 Loại Da Baumann
                </h4>
                <p className="text-[11px] text-slate-500">
                  Đánh giá 4 trục đặc tính: Dầu/Khô, Nhạy cảm, Sắc tố & Lão hóa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#131336]">
                  3. Phác Đồ Hoạt Chất Kê Đơn
                </h4>
                <p className="text-[11px] text-slate-500">
                  Gợi ý sản phẩm phù hợp nồng độ %, hướng dẫn sử dụng AM/PM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Input Form or Logged-in Start Action */}
        <div className="md:col-span-7">
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            {!sessionQuery.isLoading && !isAuthenticated ? (
              <div className="space-y-4">
                <GuestSurveyProfileForm
                  isSubmitting={isStartingGuest}
                  onSubmit={handleGuestStart}
                />
                {state.dynamicError && (
                  <Alert variant="destructive" className="text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Chưa thể bắt đầu khảo sát</AlertTitle>
                    <AlertDescription>{state.dynamicError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6b5cf6]/10 text-[#6b5cf6]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-[#131336]">
                    Hồ Sơ Đã Được Xác Thực
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Bạn đã đăng nhập. Kết quả khảo sát và phác đồ AI sẽ được tự
                    động đồng bộ trực tiếp vào tài khoản cá nhân của bạn.
                  </p>
                </div>

                {needsProfileUpdate && !profileQuery.isLoading && (
                  <div className="mx-auto mb-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
                    <p className="font-semibold">
                      Cần cập nhật hồ sơ trước khi khảo sát.
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      GlowScan cần{" "}
                      {missingProfileFields.includes("dateOfBirth")
                        ? "ngày sinh"
                        : ""}
                      {missingProfileFields.length === 2 ? " và " : ""}
                      {missingProfileFields.includes("gender")
                        ? "giới tính"
                        : ""}{" "}
                      để tạo hồ sơ da chính xác.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3 rounded-full border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-100"
                      onClick={() => router.push("/profile")}
                    >
                      Cập nhật hồ sơ
                    </Button>
                  </div>
                )}

                <Button
                  onClick={async () => {
                    const started = await startDynamicSurvey();
                    if (started) setFlowState("baumann");
                  }}
                  disabled={
                    sessionQuery.isLoading ||
                    profileQuery.isLoading ||
                    needsProfileUpdate
                  }
                  className="group relative h-14 w-full rounded-[100px] bg-[#6b5cf6] px-8 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-[#5a4ae5] active:scale-[0.98]"
                >
                  {sessionQuery.isLoading || profileQuery.isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang kiểm tra hồ sơ...
                    </span>
                  ) : (
                    <span>Bắt Đầu Khảo Sát Da</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
