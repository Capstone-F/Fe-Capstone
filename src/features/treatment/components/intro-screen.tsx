"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getRequiredSurveyProfileFields } from "@/features/treatment/lib/survey-flow";

export function IntroScreen() {
  const { setFlowState } = useTreatment();
  const router = useRouter();
  const profileQuery = useProfile();

  const missingProfileFields = getRequiredSurveyProfileFields(
    profileQuery.data,
  );
  const needsProfileUpdate = missingProfileFields.length > 0;

  return (
    <div className="animate-in fade-in flex flex-1 flex-col justify-center px-4 py-8 duration-500">
      <div className="mb-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="h-10 w-10 shrink-0 rounded-full text-[#131336] hover:bg-black/5"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="mx-auto mt-8 max-w-xl space-y-12 text-center">
        <div className="space-y-6">
          <h1 className="font-heading text-[2.5rem] leading-tight font-bold tracking-tight text-[#131336] sm:text-5xl">
            Nhận công thức cá nhân hóa từ chuyên gia AI GlowScan
          </h1>
          <p className="mx-auto max-w-md text-lg text-[#131336]/70">
            Đầu tiên, hãy cho chúng tôi biết về tình trạng da của bạn.
          </p>
        </div>

        <div className="pt-8">
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
                {missingProfileFields.includes("gender") ? "giới tính" : ""} để
                tạo hồ sơ da chính xác.
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
            onClick={() => setFlowState("survey")}
            disabled={profileQuery.isLoading || needsProfileUpdate}
            className="group relative h-14 w-full rounded-[100px] bg-[#6b5cf6] px-8 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-[#5a4ae5] active:scale-[0.98] sm:w-auto sm:min-w-[300px]"
          >
            {profileQuery.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang kiểm tra hồ sơ
              </span>
            ) : (
              <span>Bắt Đầu Khảo Sát</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
