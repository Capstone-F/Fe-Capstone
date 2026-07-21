"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
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
  const [isBaumannInfoOpen, setIsBaumannInfoOpen] = useState(false);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);

  // Mock photo selection options for optional scan step
  const MOCK_PHOTOS = [
    {
      id: "img1",
      name: "Ảnh chụp bề mặt da 1 (Da dầu nhạy cảm)",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "img2",
      name: "Ảnh chụp bề mặt da 2 (Da có thâm mụn)",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    },
  ];

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
        router.replace(loginTarget as Route);
      }
    }
  }, [sessionQuery.error, router, pathname]);

  const questionsCount = state.dynamicQuestions.length;
  const currentQ =
    step <= questionsCount ? state.dynamicQuestions[step - 1] : null;
  const isPhotoStep = step === questionsCount + 1 && questionsCount > 0;

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
        setErrorMsg(
          "Không thể hoàn tất khảo sát. Vui lòng kiểm tra lại kết nối.",
        );
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
        <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
        <h4 className="font-heading text-foreground text-base font-bold">
          Đang tải ngân hàng câu hỏi khảo sát AI...
        </h4>
        <p className="text-muted-foreground mt-1 text-xs">
          Hệ thống đang kết nối với máy chủ GlowScan để lấy danh sách câu hỏi
          theo thời gian thực.
        </p>
      </div>
    );
  }

  // Error state
  if (state.dynamicError && state.dynamicQuestions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
        <h4 className="font-heading text-foreground text-base font-bold">
          Không thể tải câu hỏi khảo sát
        </h4>
        <p className="text-muted-foreground mt-1 text-xs">
          {state.dynamicError}
        </p>
        <Button
          onClick={() => startDynamicSurvey()}
          className="bg-primary mt-6 rounded-2xl px-6 py-2 text-xs font-bold text-white shadow-md"
        >
          Thử lại ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between px-4 py-2">
      <div className="space-y-4">
        {/* Top Header & Step Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={isSubmittingStep}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-primary bg-primary/10 rounded-full px-3 py-0.5 text-[9px] font-bold tracking-wider uppercase">
              {isPhotoStep
                ? "BƯỚC CUỐI: CHỤP ẢNH AI"
                : currentQ?.priority === "CORE"
                  ? "NHÓM CÂU HỎI CƠ BẢN"
                  : "CÂU HỎI CHUYÊN SÂU (L2)"}
            </span>
            <span className="text-foreground text-xs font-bold">
              Bước {step} / {questionsCount > 0 ? questionsCount + 1 : 1}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBaumannInfoOpen(true)}
            title="Tìm hiểu về hệ thống Baumann"
            className="border-border/40 text-primary hover:bg-primary/10 h-8 w-8 shrink-0 rounded-xl border"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="bg-secondary/40 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(100, (step / (questionsCount + 1 || 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div className="animate-in fade-in flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Question Render */}
        {currentQ && (
          <div className="animate-in fade-in space-y-4 pt-1 duration-300">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg leading-snug font-extrabold">
                {currentQ.text}
              </h3>
              {currentQ.description && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Options grid */}
            <div className="max-h-[320px] space-y-2 overflow-y-auto pt-2 pr-1">
              {currentQ.options && currentQ.options.length > 0 ? (
                currentQ.options.map((option) => {
                  const selected = (
                    state.dynamicAnswers[currentQ.id] || []
                  ).includes(option.labelCode);
                  return (
                    <div
                      key={option.labelCode}
                      onClick={() => handleOptionClick(option.labelCode)}
                      className={`group flex cursor-pointer items-start justify-between rounded-2xl border p-3.5 transition-all duration-200 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/50 hover:border-primary/40 bg-white/60 hover:bg-white/90"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 pr-3">
                        <span
                          className={`text-xs font-bold transition-colors ${
                            selected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {option.name}
                        </span>
                        {option.description && (
                          <span className="text-muted-foreground text-[10px] leading-relaxed">
                            {option.description}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-white transition-all ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-border/60 group-hover:border-primary/50 bg-transparent"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Open-ended text input if no options */
                <div className="pt-2">
                  <textarea
                    rows={4}
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    value={state.dynamicTextAnswers[currentQ.id] || ""}
                    onChange={(e) =>
                      setDynamicAnswer(currentQ.id, [], e.target.value)
                    }
                    className="border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 w-full rounded-2xl border bg-white/70 p-3 text-xs outline-none focus:ring-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Upload / AI Scan Step */}
        {isPhotoStep && (
          <div className="animate-in fade-in space-y-4 pt-1 duration-300">
            <div className="space-y-1 text-center">
              <span className="text-primary bg-primary/10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="h-3 w-3" />
                CÔNG NGHỆ QUÉT DA AI GLOWSCAN
              </span>
              <h3 className="font-heading text-foreground pt-1 text-lg leading-snug font-extrabold">
                Chụp Ảnh Bề Mặt Da (Tùy Chọn)
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Hệ thống AI sẽ định vị chính xác độ sâu nếp nhăn, kích thước lỗ
                chân lông và tình trạng mụn/thâm.
              </p>
            </div>

            <div className="border-primary/40 bg-primary/5 hover:bg-primary/10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-colors">
              {state.surveyAnswers.photoUploaded &&
              state.surveyAnswers.photoFile ? (
                <div className="space-y-3">
                  <div className="border-primary relative mx-auto h-32 w-32 overflow-hidden rounded-2xl border-2 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={state.surveyAnswers.photoFile}
                      alt="Selected"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Đã chọn ảnh thành công</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateAnswers({ photoUploaded: false, photoFile: null })
                    }
                    className="border-border/60 hover:bg-secondary/60 h-8 rounded-xl text-[10px] font-semibold"
                  >
                    Chọn lại ảnh khác
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground text-xs font-bold">
                      Tải lên ảnh hoặc chọn mẫu ảnh demo
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      Hỗ trợ định dạng JPG, PNG dưới 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mock demo photo selectors */}
            {!state.surveyAnswers.photoUploaded && (
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                  Hoặc thử nhanh với ảnh mẫu demo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_PHOTOS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        updateAnswers({
                          photoUploaded: true,
                          photoFile: p.url,
                        })
                      }
                      className="border-border/50 hover:border-primary/50 group flex cursor-pointer items-center gap-2 rounded-2xl border bg-white/60 p-2 transition-all hover:bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      />
                      <span className="text-foreground group-hover:text-primary line-clamp-2 text-[10px] font-semibold transition-colors">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="border-border/30 mt-6 flex items-center justify-between border-t pt-4">
        {isPhotoStep ? (
          <>
            <Button
              variant="ghost"
              onClick={handleComplete}
              disabled={isSubmittingStep}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-2xl text-xs font-bold"
            >
              Bỏ qua ảnh & Phân tích
            </Button>

            <Button
              onClick={handleComplete}
              disabled={isSubmittingStep}
              className="bg-primary hover:bg-primary/95 flex items-center gap-1.5 rounded-2xl px-6 py-5 text-xs font-bold text-white shadow-md transition-all"
            >
              {isSubmittingStep ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Phân Tích Sức Khỏe Da</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="flex w-full justify-end">
            <Button
              onClick={handleNext}
              disabled={isSubmittingStep}
              className="bg-primary hover:bg-primary/95 flex items-center gap-1.5 rounded-2xl px-8 py-5 text-xs font-bold text-white shadow-md transition-all"
            >
              {isSubmittingStep ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span>Tiếp theo</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Baumann explanation popup modal */}
      {isBaumannInfoOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="surface-glass relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <h3 className="font-heading text-foreground text-base font-extrabold">
                  Hệ Thống Phân Loại Da Baumann
                </h3>
                <p className="text-muted-foreground text-[10px]">
                  Khoa học phân loại da 16 nhóm theo tiêu chuẩn da liễu quốc tế
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      1. Oily (O) vs Dry (D)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Da dầu hay Da khô
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đo lường lượng bã nhờn bài tiết. Da dầu thường có độ bóng
                    nhờn, lỗ chân lông to; da khô bong tróc, căng rát và thiếu
                    ẩm.
                  </p>
                </div>

                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      2. Sensitive (S) vs Resistant (R)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Nhạy cảm hay Đề kháng
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đo mức độ phản ứng với các yếu tố bên ngoài. Da nhạy cảm dễ
                    ửng đỏ, ngứa rát râm ran; da đề kháng có lớp hàng rào bảo vệ
                    vững chắc.
                  </p>
                </div>

                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      3. Pigmented (P) vs Non-pigmented (N)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Sắc tố hay Không sắc tố
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Khả năng sản sinh melanin gây thâm sạm, tàn nhang, đốm nâu
                    hoặc tình trạng da không đều màu.
                  </p>
                </div>

                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      4. Wrinkled (W) vs Tight (T)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Nhăn hay Căng mịn
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đánh giá nguy cơ lão hóa và nếp nhăn. Nhóm W cần các hoạt
                    chất chống oxy hóa mạnh; nhóm T tập trung duy trì sự săn
                    chắc trẻ trung.
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border-primary/20 text-primary rounded-2xl border p-3 text-[11px] leading-relaxed">
                <strong>💡 Hoạt động trong GlowScan:</strong> Sau khi hoàn thành
                khảo sát AI, hệ thống tự động tính toán mã da riêng (ví dụ:{" "}
                <strong>OSPW</strong>, <strong>DRNT</strong>) và gán vào hồ sơ
                của bạn.
              </div>

              <Button
                onClick={() => setIsBaumannInfoOpen(false)}
                className="bg-primary hover:bg-primary/95 w-full rounded-2xl py-5 text-xs font-bold text-white shadow-md"
              >
                Đã Hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
