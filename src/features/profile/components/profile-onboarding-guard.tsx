"use client";

import React, { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  UserRound,
  CalendarDays,
  ArrowRight,
  Loader2,
  ScanFace,
  Beaker,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";

const SURVEY_GUIDE_DISMISSED_KEY = "glowscan_survey_guide_dismissed";

type OnboardingStep = "profile" | "survey-guide";

/**
 * Computes whether the profile needs onboarding.
 */
function needsOnboarding(
  profile: { gender?: string | null; dateOfBirth?: string | null } | null,
): boolean {
  if (!profile) return false;
  return !profile.gender || !profile.dateOfBirth;
}

/**
 * Global onboarding guard that checks if the logged-in user has completed
 * their base profile (gender + dateOfBirth). If not, redirects to /profile first,
 * then shows the mandatory profile onboarding popup.
 */
export function ProfileOnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // Don't render while loading or if not logged in
  if (isSessionLoading || isProfileLoading) return null;
  if (!session || !profile) return null;

  // Only trigger if profile needs onboarding
  if (!needsOnboarding(profile)) return null;

  // Redirect to /profile first if currently on another page
  if (pathname !== "/profile") {
    if (typeof window !== "undefined") {
      router.replace("/profile");
    }
    return null;
  }

  return <OnboardingDialogs profile={profile} />;
}

/**
 * Inner component that only mounts when profile needs onboarding.
 * This avoids lint issues with setState-in-effects or ref access during render
 * because the initial step is determined by the parent gating logic.
 */
function OnboardingDialogs({
  profile,
}: {
  profile: { gender?: string | null; dateOfBirth?: string | null };
}) {
  const router = useRouter();
  const updateProfileMutation = useUpdateProfile();

  const [step, setStep] = useState<OnboardingStep>("profile");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">(
    () => (profile.gender as "MALE" | "FEMALE" | "OTHER") || "FEMALE",
  );
  const [dateOfBirth, setDateOfBirth] = useState(() =>
    profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
  );

  const handleProfileSubmit = useCallback(() => {
    if (!dateOfBirth) {
      toast.error("Vui lòng nhập ngày sinh.");
      return;
    }

    // Validate reasonable date
    const dob = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    if (age < 13 || age > 120) {
      toast.error("Ngày sinh không hợp lệ (tuổi phải từ 13 đến 120).");
      return;
    }

    updateProfileMutation.mutate(
      {
        gender,
        dateOfBirth,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật hồ sơ thành công! 🎉");
          // Check if survey guide was previously dismissed
          const dismissed =
            typeof window !== "undefined" &&
            sessionStorage.getItem(SURVEY_GUIDE_DISMISSED_KEY) === "true";

          if (dismissed) {
            // Force window reload to re-evaluate the guard (profile now has data)
            window.location.reload();
          } else {
            setStep("survey-guide");
          }
        },
        onError: (error) => {
          console.error("Failed to update profile:", error);
          toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
        },
      },
    );
  }, [gender, dateOfBirth, updateProfileMutation]);

  const handleStartSurvey = useCallback(() => {
    router.push("/scan");
  }, [router]);

  const handleDismissSurveyGuide = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SURVEY_GUIDE_DISMISSED_KEY, "true");
    }
    // Force reload to unmount (profile is now complete)
    window.location.reload();
  }, []);

  return (
    <>
      {/* ── Popup 1: Mandatory Profile Completion ── */}
      <Dialog
        open={step === "profile"}
        onOpenChange={() => {
          /* Cannot dismiss */
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <UserRound className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Hoàn Tất Hồ Sơ Của Bạn
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Chúng tôi cần thêm vài thông tin cơ bản để cá nhân hóa trải nghiệm
              chăm sóc da tốt nhất cho bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Gender */}
            <div className="space-y-1.5">
              <Label
                htmlFor="onboard-gender"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
              >
                <UserRound className="h-3.5 w-3.5 text-emerald-600" />
                Giới tính <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "FEMALE", label: "Nữ", emoji: "👩" },
                    { value: "MALE", label: "Nam", emoji: "👨" },
                    { value: "OTHER", label: "Khác", emoji: "🧑" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(option.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-xs font-bold transition-all ${
                      gender === option.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label
                htmlFor="onboard-dob"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
              >
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                Ngày sinh <span className="text-red-500">*</span>
              </Label>
              <Input
                id="onboard-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="rounded-xl border-slate-200 text-xs"
                placeholder="dd/mm/yyyy"
              />
              <p className="text-[10px] text-slate-400">
                Thông tin này giúp hệ thống đánh giá tình trạng da chính xác
                theo độ tuổi.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleProfileSubmit}
              disabled={updateProfileMutation.isPending || !dateOfBirth}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-xs font-bold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  Lưu & Tiếp Tục
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Popup 2: Survey Guide ── */}
      <Dialog
        open={step === "survey-guide"}
        onOpenChange={(open) => {
          if (!open) handleDismissSurveyGuide();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Bắt Đầu Hành Trình Chăm Sóc Da!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Hồ sơ của bạn đã sẵn sàng. Hãy thực hiện bài khảo sát da để nhận
              phác đồ điều trị cá nhân hóa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {[
              {
                icon: ScanFace,
                color: "text-violet-600 bg-violet-100",
                title: "Phân tích da AI",
                desc: "Hệ thống AI đánh giá loại da Baumann 16 nhóm chỉ trong 2 phút.",
              },
              {
                icon: Beaker,
                color: "text-indigo-600 bg-indigo-100",
                title: "Phác đồ hoạt chất",
                desc: "Nhận gợi ý sản phẩm được chọn lọc theo tình trạng da của bạn.",
              },
              {
                icon: ShieldCheck,
                color: "text-emerald-600 bg-emerald-100",
                title: "Combo giảm 10%",
                desc: "Mua đủ bộ sản phẩm phác đồ để nhận ưu đãi Combo Survey 10%.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleStartSurvey}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-8 text-xs font-bold text-white shadow-md transition-all hover:from-violet-600 hover:to-indigo-600 hover:shadow-lg"
            >
              <ScanFace className="mr-2 h-4 w-4" />
              Bắt Đầu Khảo Sát Da Ngay
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismissSurveyGuide}
              className="w-full text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Để Sau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
