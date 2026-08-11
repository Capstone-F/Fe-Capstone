"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import { useTreatment } from "@/features/treatment/components/treatment-context";
import { SurveyFaceScan } from "./survey-face-scan";

export function SurveyQuestions() {
  const {
    state,
    setSurveyStep,
    setFlowState,
    startDynamicSurvey,
    setDynamicAnswer,
    submitDynamicAnswersAndNext,
    completeDynamicSurvey,
  } = useTreatment();

  const step = state.surveyStep;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);

  // Start dynamic survey if questions list is empty or session is null
  useEffect(() => {
    if (
      (!state.surveySessionId || state.dynamicQuestions.length === 0) &&
      !state.isLoadingDynamic &&
      !state.dynamicError
    ) {
      void startDynamicSurvey();
    }
  }, [
    state.surveySessionId,
    state.dynamicQuestions.length,
    state.isLoadingDynamic,
    state.dynamicError,
    startDynamicSurvey,
  ]);

  const questionsCount = state.dynamicQuestions.length;
  const currentQ =
    step <= questionsCount ? state.dynamicQuestions[step - 1] : null;

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
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!currentQ) return;

    const selected = state.dynamicAnswers[currentQ.id] || [];
    const textVal = state.dynamicTextAnswers[currentQ.id] || "";

    // If skipping (no answer selected), advance step directly without sending empty labelCodes payload to BE
    if (selected.length === 0 && !textVal.trim()) {
      setSurveyStep(step + 1);
      return;
    }

    setIsSubmittingStep(true);
    try {
      const wasSaved = await submitDynamicAnswersAndNext([currentQ.id]);
      if (wasSaved) {
        setSurveyStep(step + 1);
      } else {
        setErrorMsg("Không thể lưu câu trả lời. Vui lòng thử lại.");
      }
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
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6b5cf6]/10 text-[#6b5cf6]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h4 className="font-heading mt-4 text-lg font-bold text-[#131336]">
          Đang tải ngân hàng câu hỏi AI...
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    );
  }

  // Error state
  if (state.dynamicError && state.dynamicQuestions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
        <h4 className="font-heading text-lg font-bold text-red-500">
          Chưa Thể Tải Câu Hỏi Khảo Sát
        </h4>
        <p className="mt-2 max-w-sm text-xs text-slate-600">
          {state.dynamicError}
        </p>
        <Button
          onClick={() => void startDynamicSurvey()}
          className="mt-6 rounded-full bg-[#6b5cf6] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#5a4ae5]"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // If we passed all questions: Always render SurveyFaceScan step for everyone
  if (step > questionsCount) {
    return (
      <SurveyFaceScan
        isCompleting={isSubmittingStep}
        errorMessage={errorMsg}
        onBack={() => setSurveyStep(Math.max(1, questionsCount))}
        onComplete={() => void handleComplete()}
      />
    );
  }

  const progressRatio = step / (questionsCount || 1);
  const sections = [
    { label: "Loại da & Bã nhờn", active: progressRatio <= 0.25 },
    {
      label: "Độ nhạy cảm",
      active: progressRatio > 0.25 && progressRatio <= 0.5,
    },
    {
      label: "Sắc tố da",
      active: progressRatio > 0.5 && progressRatio <= 0.75,
    },
    { label: "Nếp nhăn & Lão hóa", active: progressRatio > 0.75 },
  ];

  const isMulti = currentQ?.questionType === "MULTI_SELECT";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-6 md:flex-row">
      {/* Left Progress Rail */}
      <div className="hidden shrink-0 flex-col gap-6 border-r border-slate-200/80 pt-4 pr-8 md:flex md:w-64">
        <div className="flex flex-col gap-1.5 text-left">
          <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
            Tiến trình khảo sát
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-[#6b5cf6]">
              {step}
            </span>
            <span className="text-sm font-bold text-slate-400">
              /{questionsCount}
            </span>
          </div>
        </div>

        <div className="relative mt-2 ml-1 flex flex-col gap-6 border-l border-slate-200 pl-4 text-left">
          {sections.map((sec, idx) => (
            <div key={idx} className="relative flex items-center gap-3 py-0.5">
              <div
                className={cn(
                  "absolute -left-[21px] h-2.5 w-2.5 rounded-full border bg-white transition-all duration-300",
                  sec.active
                    ? "scale-125 border-[#6b5cf6] bg-[#6b5cf6] shadow-xs"
                    : "border-slate-300",
                )}
              />
              <span
                className={cn(
                  "text-xs font-bold tracking-wide transition-colors duration-300",
                  sec.active ? "text-[#6b5cf6]" : "text-slate-500",
                )}
              >
                {sec.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Question Area */}
      <div className="flex flex-1 flex-col justify-between">
        {/* Top Progress Bar (Mobile view) */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 md:hidden">
          <div
            className="h-full bg-[#6b5cf6] transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(100, (step / (questionsCount || 1)) * 100)}%`,
            }}
          />
        </div>

        <div className="flex flex-1 flex-col pt-6 pb-8 md:pt-4">
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          {currentQ && (
            <div className="animate-in fade-in space-y-6 text-left duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#6b5cf6]/10 px-3 py-0.5 text-[10px] font-bold text-[#6b5cf6] uppercase">
                    {isMulti ? "Có thể chọn nhiều đáp án" : "Chọn 1 đáp án"}
                  </span>
                </div>
                <h2 className="font-heading text-2xl leading-tight font-extrabold text-[#131336] sm:text-3xl">
                  {currentQ.text}
                </h2>
                {currentQ.description && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {currentQ.description}
                  </p>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid w-full gap-3 pt-2 sm:grid-cols-2">
                {currentQ.options && currentQ.options.length > 0 ? (
                  currentQ.options.map((option) => {
                    const selected = (
                      state.dynamicAnswers[currentQ.id] || []
                    ).includes(option.labelCode);

                    return (
                      <div
                        key={option.labelCode}
                        onClick={() => handleOptionClick(option.labelCode)}
                        className={cn(
                          "relative flex cursor-pointer items-center justify-between rounded-2xl border p-4.5 shadow-xs transition-all duration-200 select-none",
                          selected
                            ? "border-[#6b5cf6] bg-[#6b5cf6]/5 shadow-sm ring-1 ring-[#6b5cf6]"
                            : "border-slate-200/80 bg-white hover:border-[#6b5cf6]/40 hover:bg-slate-50",
                        )}
                      >
                        <span className="text-sm font-bold text-[#131336]">
                          {option.vietnameseNormalized || option.name}
                        </span>
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                            selected
                              ? "border-[#6b5cf6] bg-[#6b5cf6] text-white"
                              : "border-slate-300 bg-transparent",
                          )}
                        >
                          {selected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <textarea
                      rows={4}
                      placeholder="Nhập câu trả lời chi tiết của bạn..."
                      value={state.dynamicTextAnswers[currentQ.id] || ""}
                      onChange={(e) =>
                        setDynamicAnswer(currentQ.id, [], e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-[#131336] placeholder:text-slate-400 focus:border-[#6b5cf6] focus:ring-1 focus:ring-[#6b5cf6] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="sticky bottom-0 left-0 z-10 w-full border-t border-slate-100 bg-white/80 py-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmittingStep}
              className="h-12 flex-1 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              onClick={() => void handleNext()}
              disabled={isSubmittingStep}
              className="h-12 flex-[2] rounded-2xl bg-[#6b5cf6] text-sm font-bold text-white shadow-md hover:bg-[#5a4ae5] disabled:opacity-70"
            >
              {isSubmittingStep ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {(state.dynamicAnswers[currentQ?.id || ""] || []).length >
                      0 ||
                    (state.dynamicTextAnswers[currentQ?.id || ""] || "").trim()
                      ? "Tiếp tục"
                      : "Bỏ qua câu này"}
                  </span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
