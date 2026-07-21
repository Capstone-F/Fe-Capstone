"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

import { useSession } from "@/features/auth/hooks/use-session";
import { ApiError } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { useTreatment } from "@/features/treatment/components/treatment-context";

export function SurveyQuestions() {
  const {
    state,
    updateAnswers,
    setSurveyStep,
    setFlowState,
    startDynamicSurvey,
    setDynamicAnswer,
    submitDynamicAnswersAndNext,
    completeDynamicSurvey,
  } = useTreatment();

  const step = state.surveyStep;
  const sessionQuery = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);

  // Start dynamic survey if not initialized
  useEffect(() => {
    if (
      !state.surveySessionId &&
      !state.isLoadingDynamic &&
      state.dynamicQuestions.length === 0 &&
      !state.dynamicError
    ) {
      startDynamicSurvey();
    }
  }, [
    state.surveySessionId,
    state.isLoadingDynamic,
    state.dynamicQuestions.length,
    state.dynamicError,
    startDynamicSurvey,
  ]);

  // Handle route protection client side
  useEffect(() => {
    if (!appConfig.devBypassAuth) {
      if (
        sessionQuery.error instanceof ApiError &&
        sessionQuery.error.status === 401
      ) {
        const loginTarget = `/login?redirectTo=${encodeURIComponent(pathname || "/scan")}`;
        window.location.href = loginTarget;
      }
    }
  }, [sessionQuery.error, router, pathname]);

  const questionsCount = state.dynamicQuestions.length;
  const currentQ =
    step <= questionsCount ? state.dynamicQuestions[step - 1] : null;

  // Sync answers with legacy Baumann/health fields for fallback routine generator
  const syncToLegacyAnswers = (qCode: string, labelCode: string) => {
    const code = labelCode.toUpperCase();
    if (code === "O" || code === "D")
      updateAnswers({ baumannOilyDry: code as "O" | "D" });
    if (code === "S" || code === "R")
      updateAnswers({ baumannSensitiveResistant: code as "S" | "R" });
    if (code === "P" || code === "N")
      updateAnswers({ baumannPigmentNon: code as "P" | "N" });
    if (code === "W" || code === "T")
      updateAnswers({ baumannWrinkleTight: code as "W" | "T" });
    if (code.includes("PREG")) updateAnswers({ pregnancy: "yes" });
  };

  const handleOptionClick = (labelCode: string) => {
    if (!currentQ) return;
    setErrorMsg(null);
    const selected = state.dynamicAnswers[currentQ.id] || [];
    const isMulti = currentQ.questionType === "MULTI_SELECT";

    let nextSelected: string[];
    if (isMulti) {
      nextSelected = selected.includes(labelCode)
        ? selected.filter((c) => c !== labelCode)
        : [...selected, labelCode];
    } else {
      nextSelected = [labelCode];
    }

    setDynamicAnswer(currentQ.id, nextSelected);
    syncToLegacyAnswers(currentQ.code || "", labelCode);
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!currentQ) return;

    const selected = state.dynamicAnswers[currentQ.id] || [];
    const textVal = state.dynamicTextAnswers[currentQ.id] || "";

    if (selected.length === 0 && !textVal.trim()) {
      setErrorMsg("Vui lòng chọn hoặc nhập đáp án trước khi tiếp tục.");
      return;
    }

    setIsSubmittingStep(true);
    try {
      await submitDynamicAnswersAndNext([currentQ.id]);
      setSurveyStep(step + 1);
    } catch (e) {
      console.error(e);
      setErrorMsg("Có lỗi khi lưu câu trả lời. Vui lòng thử lại.");
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (step > 1) {
      setSurveyStep(step - 1);
    } else {
      setFlowState("intro");
    }
  };

  const handleComplete = async () => {
    setIsSubmittingStep(true);
    setErrorMsg(null);
    try {
      const success = await completeDynamicSurvey();
      if (!success) {
        setErrorMsg("Không thể hoàn tất khảo sát. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Đã xảy ra lỗi khi hoàn tất khảo sát.");
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Loading state
  if (state.isLoadingDynamic && state.dynamicQuestions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#6b5cf6]" />
        <h4 className="font-heading text-base font-bold text-[#131336]">
          Đang tải ngân hàng câu hỏi...
        </h4>
      </div>
    );
  }

  // Error state
  if (state.dynamicError && state.dynamicQuestions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h4 className="font-heading text-base font-bold text-red-500">
          Lỗi tải câu hỏi
        </h4>
        <p className="mt-1 text-xs text-[#131336]/60">{state.dynamicError}</p>
        <Button
          onClick={() => startDynamicSurvey()}
          className="mt-6 rounded-full bg-[#6b5cf6] px-6 py-2 text-sm font-bold text-white hover:bg-[#5a4ae5]"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // If we passed all questions
  if (step > questionsCount) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Bạn đã hoàn thành các câu hỏi!
        </h3>
        <p className="max-w-md text-base text-[#131336]/70">
          Hệ thống AI GlowScan sẽ tính toán điểm Baumann và thiết kế phác đồ phù
          hợp với làn da của bạn.
        </p>
        <Button
          onClick={handleComplete}
          disabled={isSubmittingStep}
          className="h-14 w-full max-w-xs rounded-full bg-[#6b5cf6] px-8 text-lg font-bold text-white shadow-md hover:bg-[#5a4ae5]"
        >
          {isSubmittingStep ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span>Phân tích kết quả</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      {/* Top Progress Bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
        <div
          className="h-full bg-[#6b5cf6] transition-all duration-300 ease-out"
          style={{
            width: `${Math.min(100, (step / questionsCount) * 100)}%`,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pt-12 pb-8">
        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        {currentQ && (
          <div className="animate-in fade-in space-y-8 duration-300">
            <div className="space-y-3 text-center">
              <h2 className="font-heading text-3xl leading-tight font-bold text-[#131336] md:text-4xl">
                {currentQ.text}
              </h2>
              {currentQ.description && (
                <p className="mx-auto max-w-xl text-lg text-[#131336]/70">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Options Grid */}
            <div className="mx-auto grid w-full max-w-2xl gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-2">
              {currentQ.options && currentQ.options.length > 0 ? (
                currentQ.options.map((option) => {
                  const selected = (
                    state.dynamicAnswers[currentQ.id] || []
                  ).includes(option.labelCode);

                  return (
                    <div
                      key={option.labelCode}
                      onClick={() => handleOptionClick(option.labelCode)}
                      className={`relative flex cursor-pointer flex-col rounded-xl border-2 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                        selected
                          ? "border-[#6b5cf6] ring-1 ring-[#6b5cf6]"
                          : "border-transparent ring-1 ring-[#e5e5e5] hover:ring-[#6b5cf6]/50"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold transition-colors ${
                          selected ? "text-[#131336]" : "text-[#131336]"
                        }`}
                      >
                        {option.name}
                      </span>
                      {option.description && (
                        <span className="mt-2 text-sm leading-relaxed text-[#131336]/60">
                          {option.description}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <textarea
                    rows={4}
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    value={state.dynamicTextAnswers[currentQ.id] || ""}
                    onChange={(e) =>
                      setDynamicAnswer(currentQ.id, [], e.target.value)
                    }
                    className="w-full rounded-xl border border-[#e5e5e5] bg-white p-4 text-base text-[#131336] placeholder:text-[#131336]/40 focus:border-[#6b5cf6] focus:ring-1 focus:ring-[#6b5cf6] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Fixed/Sticky Footer */}
      <div className="sticky bottom-0 left-0 z-10 w-full border-t border-[#e5e5e5] bg-[#F4F3ED] p-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isSubmittingStep}
            className="h-14 flex-1 rounded-full text-base font-bold text-[#131336] hover:bg-[#131336]/5"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmittingStep}
            className="h-14 flex-[2] rounded-full bg-[#6b5cf6] text-lg font-bold text-white shadow-md hover:bg-[#5a4ae5] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmittingStep ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              <span>Tiếp tục</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
