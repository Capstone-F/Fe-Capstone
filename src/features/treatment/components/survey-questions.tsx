"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
import { useSession } from "@/features/auth/hooks/use-session";
import { ApiError } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { useTreatment, SurveyAnswers } from "../context/treatment-context";

export function SurveyQuestions() {
  const {
    state,
    updateAnswers,
    setSurveyStep,
    setFlowState,
    generateRoutines,
  } = useTreatment();
  const step = state.surveyStep;

  const sessionQuery = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (step === 7 && !appConfig.devBypassAuth) {
      if (
        sessionQuery.error instanceof ApiError &&
        sessionQuery.error.status === 401
      ) {
        const loginTarget = `/login?redirectTo=${encodeURIComponent(pathname)}`;
        router.replace(loginTarget as Route);
      }
    }
  }, [step, sessionQuery.error, router, pathname]);

  // Local validation error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBaumannInfoOpen, setIsBaumannInfoOpen] = useState(false);

  // Mock photo selection options
  const MOCK_PHOTOS = [
    {
      id: "img1",
      name: "Ảnh chụp chính diện 1",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "img2",
      name: "Ảnh chụp chính diện 2",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    },
  ];

  const answers = state.surveyAnswers;

  // Handles moving to the next step with validation
  const handleNext = () => {
    setErrorMsg(null);

    if (step === 1) {
      if (
        !answers.baumannOilyDry ||
        !answers.baumannSensitiveResistant ||
        !answers.baumannPigmentNon ||
        !answers.baumannWrinkleTight
      ) {
        setErrorMsg(
          "Vui lòng trả lời đầy đủ cả 4 thuộc tính Baumann để phân loại da.",
        );
        return;
      }
    } else if (step === 2) {
      if (answers.hydration === "") {
        setErrorMsg("Vui lòng chọn mức độ ẩm hiện tại của làn da bạn.");
        return;
      }
    } else if (step === 4) {
      if (answers.treatmentGoals.length === 0) {
        setErrorMsg("Vui lòng chọn ít nhất 1 mục tiêu chăm sóc da.");
        return;
      }
    } else if (step === 5) {
      if (!answers.primaryConcern) {
        setErrorMsg("Vui lòng chọn 1 mối quan tâm về da khẩn cấp nhất.");
        return;
      }
    } else if (step === 6) {
      // Validate that health answers are checked
      if (
        !answers.pregnancy ||
        !answers.breastfeeding ||
        !answers.menstruation ||
        !answers.hormonalChanges ||
        !answers.otherDermatology ||
        !answers.prescriptionMeds
      ) {
        setErrorMsg("Vui lòng chọn phản hồi cho tất cả các câu hỏi sức khỏe.");
        return;
      }
    }

    if (step < 7) {
      setSurveyStep(step + 1);
    } else {
      // Finalize survey and trigger AI engine rules
      generateRoutines();
      setFlowState("analyzing");
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      setSurveyStep(step - 1);
    } else {
      setFlowState("intro");
    }
  };

  // Skip photo selection handler
  const handleSkipPhoto = () => {
    updateAnswers({ photoUploaded: false, photoFile: null });
    generateRoutines();
    setFlowState("analyzing");
  };

  if (step === 7 && !appConfig.devBypassAuth) {
    if (sessionQuery.isLoading) {
      return (
        <div className="animate-in fade-in flex min-h-[400px] flex-1 flex-col items-center justify-center space-y-4 p-6 text-center duration-300">
          <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground text-xs font-bold">
            Đang xác thực phiên làm việc của bạn...
          </p>
        </div>
      );
    }

    if (
      sessionQuery.error instanceof ApiError &&
      sessionQuery.error.status === 401
    ) {
      return (
        <div className="animate-in fade-in flex min-h-[400px] flex-1 flex-col items-center justify-center space-y-4 p-6 text-center duration-300">
          <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground text-xs font-bold">
            Bạn chưa đăng nhập. Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      );
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-1 flex-col justify-between px-4 duration-300">
      {/* Header bar & Progress Bar */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>

          <span className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
            BƯỚC {step} / 7:{" "}
            {step === 1
              ? "HỒ SƠ BAUMANN"
              : step === 2
                ? "ĐỘ ẨM DA"
                : step === 3
                  ? "CHU TRÌNH HIỆN TẠI"
                  : step === 4
                    ? "MỤC TIÊU CHĂM SÓC DA"
                    : step === 5
                      ? "MỐI QUAN TÂM CHÍNH"
                      : step === 6
                        ? "THÔNG TIN SỨC KHỎE"
                        : "ẢNH CHỤP PHÂN TÍCH AI"}
          </span>
          <div className="h-8 w-8 shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message alert */}
      {errorMsg && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in zoom-in-95 mt-3 flex items-center gap-2 rounded-2xl border p-3 text-xs font-semibold duration-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Question Body (Scrollable content) */}
      <div className="my-4 max-h-[390px] flex-1 overflow-y-auto py-1 pr-1">
        {/* STEP 1: BAUMANN PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                  Đánh giá hồ sơ da Baumann
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBaumannInfoOpen(true)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Tìm hiểu về hệ thống Baumann"
                >
                  <HelpCircle className="h-4.5 w-4.5" />
                </button>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Chọn các đặc tính bên dưới để xác định mã loại da gồm 4 ký tự
                của bạn.{" "}
                <button
                  type="button"
                  onClick={() => setIsBaumannInfoOpen(true)}
                  className="text-primary font-bold hover:underline"
                >
                  Tìm hiểu Baumann là gì?
                </button>
              </p>
            </div>

            {/* Simulated Live Baumann Code indicator */}
            <div className="surface-glass border-primary/20 bg-primary/5 flex items-center justify-between rounded-2xl border p-3">
              <span className="text-foreground text-xs font-bold">
                Mã Baumann dự kiến:
              </span>
              <span className="text-primary border-primary/10 rounded-xl border bg-white px-3 py-1 font-mono text-base font-black tracking-widest">
                {(answers.baumannOilyDry || "_") +
                  (answers.baumannSensitiveResistant || "_") +
                  (answers.baumannPigmentNon || "_") +
                  (answers.baumannWrinkleTight || "_")}
              </span>
            </div>

            {/* 1.1: Oiliness vs Dryness */}
            <div className="border-border/50 space-y-2 rounded-2xl border bg-white/40 p-3.5">
              <h4 className="text-foreground text-xs font-bold">
                1.1. Tiết bã nhờn (Oiliness vs Dryness)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => updateAnswers({ baumannOilyDry: "O" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannOilyDry === "O"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">Da dầu (Oily - O)</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Bóng nhờn, lỗ chân lông to
                  </span>
                </button>
                <button
                  onClick={() => updateAnswers({ baumannOilyDry: "D" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannOilyDry === "D"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">Da khô (Dry - D)</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Bong tróc, rát căng
                  </span>
                </button>
              </div>
            </div>

            {/* 1.2: Sensitivity vs Resistance */}
            <div className="border-border/50 space-y-2 rounded-2xl border bg-white/40 p-3.5">
              <h4 className="text-foreground text-xs font-bold">
                1.2. Mức độ nhạy cảm (Sensitivity vs Resistance)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    updateAnswers({ baumannSensitiveResistant: "S" })
                  }
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannSensitiveResistant === "S"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">
                    Nhạy cảm (Sensitive - S)
                  </span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Dễ đỏ ngứa, kích ứng
                  </span>
                </button>
                <button
                  onClick={() =>
                    updateAnswers({ baumannSensitiveResistant: "R" })
                  }
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannSensitiveResistant === "R"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">
                    Khỏe/Đề kháng (Resistant - R)
                  </span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Dung nạp tốt mỹ phẩm
                  </span>
                </button>
              </div>
            </div>

            {/* 1.3: Pigmentation vs Non-pigmentation */}
            <div className="border-border/50 space-y-2 rounded-2xl border bg-white/40 p-3.5">
              <h4 className="text-foreground text-xs font-bold">
                1.3. Sắc tố (Pigmentation vs Non-pigmentation)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => updateAnswers({ baumannPigmentNon: "P" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannPigmentNon === "P"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">
                    Tăng sắc tố (Pigmented - P)
                  </span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Thâm sạm, không đều màu
                  </span>
                </button>
                <button
                  onClick={() => updateAnswers({ baumannPigmentNon: "N" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannPigmentNon === "N"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">
                    Không tăng (Non-pigmented - N)
                  </span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Tông màu da đồng đều
                  </span>
                </button>
              </div>
            </div>

            {/* 1.4: Wrinkled vs Tight */}
            <div className="border-border/50 space-y-2 rounded-2xl border bg-white/40 p-3.5">
              <h4 className="text-foreground text-xs font-bold">
                1.4. Lão hóa (Wrinkled vs Tight)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => updateAnswers({ baumannWrinkleTight: "W" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannWrinkleTight === "W"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">
                    Nếp nhăn (Wrinkled - W)
                  </span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Nếp nhăn nông, giảm đàn hồi
                  </span>
                </button>
                <button
                  onClick={() => updateAnswers({ baumannWrinkleTight: "T" })}
                  className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left text-xs transition-all ${
                    answers.baumannWrinkleTight === "T"
                      ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                      : "border-border/60 hover:bg-secondary/20 bg-white"
                  }`}
                >
                  <span className="font-extrabold">Căng mịn (Tight - T)</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Căng trẻ, rất ít nếp nhăn
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HYDRATION */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Đánh giá mức độ ẩm da
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Làn da của bạn hiện tại cảm nhận đủ ẩm ở mức nào?
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  val: 100,
                  label: "100% — Rất cao",
                  desc: "Da ngậm nước căng mọng, mềm mại tự nhiên suốt ngày.",
                },
                {
                  val: 75,
                  label: "75% — Cao",
                  desc: "Màng ẩm hoạt động tốt, hầu như không khô căng hay đổ dầu bóng.",
                },
                {
                  val: 50,
                  label: "50% — Trung bình",
                  desc: "Độ ẩm tạm ổn, đôi lúc khô nhẹ ở má hoặc đổ dầu vùng chữ T.",
                },
                {
                  val: 25,
                  label: "25% — Thấp (Cần khóa ẩm sâu)",
                  desc: "Da thô ráp, xuất hiện các vảy da khô nhỏ, căng rát nhẹ.",
                },
                {
                  val: 0,
                  label: "0% — Rất thấp (Thiếu ẩm trầm trọng)",
                  desc: "Da cực kỳ khô ráp, bong tróc nứt nẻ, có cảm giác ngứa căng khó chịu.",
                },
              ].map((item) => {
                const isSelected = answers.hydration === item.val;
                return (
                  <button
                    key={item.val}
                    onClick={() =>
                      updateAnswers({
                        hydration: item.val as 0 | 25 | 50 | 75 | 100,
                      })
                    }
                    className={`flex w-full flex-col gap-1 rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99] ${
                      isSelected
                        ? "border-primary/80 bg-primary/5 ring-primary/20 ring-2"
                        : "border-border/70 hover:bg-primary/5 hover:border-primary/40 bg-white/60"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`text-xs font-extrabold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {item.label}
                      </span>
                      <div
                        className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <div className="animate-scale-in h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-[10px] leading-relaxed">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CURRENT ROUTINE */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Sản phẩm & Chu trình hiện tại
              </h3>
              <p className="text-muted-foreground text-[11px]">
                Cung cấp chi tiết để hệ thống kiểm tra và ngăn chặn các xung đột
                hoạt chất.
              </p>
            </div>

            {/* 3.1: Current products free text */}
            <div className="space-y-1.5">
              <label className="text-foreground block text-xs font-bold">
                3.1. Các sản phẩm hiện tại bạn đang dùng là gì?
              </label>
              <textarea
                value={answers.currentRoutineProducts}
                onChange={(e) =>
                  updateAnswers({ currentRoutineProducts: e.target.value })
                }
                placeholder="Ví dụ: Neutrogena Hydro Boost, Cosrx Snail Mucin..."
                className="border-border/80 focus:ring-primary/20 focus:border-primary min-h-[60px] w-full resize-none rounded-xl border bg-white p-3 text-xs focus:ring-2 focus:outline-none"
              />
            </div>

            {/* 3.2: Active Ingredients (Multi-select) */}
            <div className="space-y-2">
              <label className="text-foreground block text-xs font-bold">
                3.2. Các hoạt chất đang sử dụng (Active Ingredients)
              </label>

              {/* Show warning if Retinol is selected */}
              {answers.currentActiveIngredients.includes("Retinol") && (
                <div className="animate-in fade-in flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800 duration-200">
                  <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 animate-bounce text-amber-600" />
                  <span>
                    <strong>Cảnh báo Retinol:</strong> Nếu quy trình chăm sóc da
                    mới đề xuất AHA/BHA, việc dùng chung có thể gây bong tróc
                    mạnh hoặc đỏ rát. Hệ thống sẽ tích hợp cảnh báo phối hợp
                    thuốc cho bạn.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  "Retinol",
                  "AHA",
                  "BHA",
                  "Vitamin C",
                  "Niacinamide",
                  "Benzoyl Peroxide",
                ].map((ing) => {
                  const isSelected =
                    answers.currentActiveIngredients.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => {
                        let nextIng = [...answers.currentActiveIngredients];
                        if (nextIng.includes(ing)) {
                          nextIng = nextIng.filter((i) => i !== ing);
                        } else {
                          nextIng.push(ing);
                        }
                        updateAnswers({ currentActiveIngredients: nextIng });
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 text-muted-foreground hover:border-primary/30 bg-white"
                      }`}
                    >
                      {ing}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    updateAnswers({ currentActiveIngredients: [] })
                  }
                  className="border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 rounded-full border border-dashed px-3 py-1.5 text-[11px] font-bold transition-all"
                >
                  Không có / Xóa tất cả
                </button>
              </div>
            </div>

            {/* 3.3: Morning routine */}
            <div className="space-y-1.5">
              <label className="text-foreground block text-xs font-bold">
                3.3. Chu trình buổi sáng của bạn
              </label>
              <input
                type="text"
                value={answers.morningRoutineText}
                onChange={(e) =>
                  updateAnswers({ morningRoutineText: e.target.value })
                }
                placeholder="Ví dụ: Sữa rửa mặt → Tinh chất → Kem chống nắng"
                className="border-border/80 focus:ring-primary/20 focus:border-primary w-full rounded-xl border bg-white p-3 text-xs focus:ring-2 focus:outline-none"
              />
            </div>

            {/* 3.4: Evening routine */}
            <div className="space-y-1.5">
              <label className="text-foreground block text-xs font-bold">
                3.4. Chu trình buổi tối của bạn
              </label>
              <input
                type="text"
                value={answers.eveningRoutineText}
                onChange={(e) =>
                  updateAnswers({ eveningRoutineText: e.target.value })
                }
                placeholder="Ví dụ: Sữa rửa mặt → Retinol → Kem dưỡng ẩm"
                className="border-border/80 focus:ring-primary/20 focus:border-primary w-full rounded-xl border bg-white p-3 text-xs focus:ring-2 focus:outline-none"
              />
            </div>

            {/* 3.5: Current irritation status (Single select tags) */}
            <div className="space-y-2">
              <label className="text-foreground block text-xs font-bold">
                3.5. Tình trạng kích ứng da hiện tại
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    val: "none",
                    label: "Không có",
                    color:
                      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  },
                  {
                    val: "mild",
                    label: "Kích ứng nhẹ",
                    color:
                      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
                  },
                  {
                    val: "redness",
                    label: "Mẩn đỏ",
                    color:
                      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                  },
                  {
                    val: "burning",
                    label: "Châm chích",
                    color:
                      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                  },
                  {
                    val: "itchy",
                    label: "Ngứa",
                    color:
                      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                  },
                ].map((item) => {
                  const isSelected = answers.irritationStatus === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() =>
                        updateAnswers({
                          irritationStatus:
                            item.val as SurveyAnswers["irritationStatus"],
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                        isSelected
                          ? "ring-primary/40 border-primary scale-105 font-black ring-2"
                          : "opacity-75 hover:opacity-100"
                      } ${item.color}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TREATMENT GOALS */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Mục tiêu chăm sóc da
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Mục tiêu chăm sóc da của bạn lúc này là gì? (Chọn một hoặc nhiều
                mục tiêu)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                "Giảm mụn",
                "Giảm dầu thừa",
                "Cải thiện thâm sạm",
                "Cải thiện khô da",
                "Hỗ trợ phục hồi da",
                "Thu nhỏ lỗ chân lông",
                "Duy trì làn da khỏe đẹp",
                "Giảm dấu hiệu lão hóa",
              ].map((goal) => {
                const isSelected = answers.treatmentGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => {
                      let nextGoals = [...answers.treatmentGoals];
                      if (nextGoals.includes(goal)) {
                        nextGoals = nextGoals.filter((g) => g !== goal);
                      } else {
                        nextGoals.push(goal);
                      }
                      updateAnswers({ treatmentGoals: nextGoals });
                    }}
                    className={`flex items-center justify-between gap-1.5 rounded-2xl border p-3 text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-primary/10 font-bold ring-2"
                        : "border-border/60 hover:bg-secondary/20 text-foreground bg-white"
                    }`}
                  >
                    <span className="text-xs">{goal}</span>
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: PRIMARY CONCERN */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Mối quan tâm chính
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Chọn một mối quan tâm về da khẩn cấp nhất của bạn vào lúc này để
                AI tập trung chăm sóc.
              </p>
            </div>

            <div className="grid gap-2.5">
              {[
                {
                  val: "Mụn trứng cá",
                  desc: "Mụn viêm, bọc, trứng cá bùng phát hoặc dai dẳng",
                },
                {
                  val: "Thâm sạm",
                  desc: "Đốm nâu, sạm nám, tăng sắc tố hoặc vết thâm sau mụn",
                },
                {
                  val: "Da khô",
                  desc: "Khô ráp, bong tróc vảy da, thiếu nước trầm trọng",
                },
                {
                  val: "Mẩn đỏ",
                  desc: "Da mỏng yếu nhạy cảm, dễ kích ứng ửng đỏ mao mạch",
                },
                {
                  val: "Lỗ chân lông to",
                  desc: "Bã nhờn làm giãn rộng lỗ chân lông vùng T-zone",
                },
                {
                  val: "Dầu thừa",
                  desc: "Bóng nhờn liên tục, tăng tiết bã nhờn mạnh",
                },
                {
                  val: "Lão hóa da",
                  desc: "Nếp nhăn, kém săn chắc, mất độ đàn hồi",
                },
              ].map((item) => {
                const isSelected = answers.primaryConcern === item.val;
                return (
                  <button
                    key={item.val}
                    onClick={() => updateAnswers({ primaryConcern: item.val })}
                    className={`flex w-full flex-col gap-0.5 rounded-2xl border p-3.5 text-left shadow-sm transition-all duration-200 active:scale-[0.99] ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                        : "border-border/60 hover:bg-primary/5 hover:border-primary/40 bg-white"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {item.val}
                      </span>
                      <div
                        className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <div className="animate-scale-in h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: HEALTH INFORMATION */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Thông tin sức khỏe bổ sung
              </h3>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Thông tin mang tính chất an toàn dược mỹ phẩm (không thay thế
                phân tích chuyên sâu).
              </p>
            </div>

            {/* Warning if pregnant */}
            {answers.pregnancy === "yes" && (
              <div className="animate-in fade-in flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-[10px] leading-relaxed text-red-800 duration-200">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <span>
                  <strong>An Toàn Thai Kỳ:</strong> Do bạn đang mang thai, hệ
                  thống AI sẽ tự động loại trừ các hoạt chất Retinoid (Retinol)
                  và Axit Salicylic (BHA) liều cao ra khỏi quy trình chăm sóc da
                  để đảm bảo an toàn tối đa cho mẹ và bé.
                </span>
              </div>
            )}

            <div className="space-y-3.5">
              {[
                {
                  field: "pregnancy",
                  label: "1. Bạn hiện có đang mang thai không?",
                },
                {
                  field: "breastfeeding",
                  label: "2. Bạn hiện có đang cho con bú không?",
                },
                {
                  field: "menstruation",
                  label: "3. Bạn hiện đang trong chu kỳ kinh nguyệt?",
                },
                {
                  field: "hormonalChanges",
                  label: "4. Gần đây bạn có gặp thay đổi nội tiết tố?",
                },
                {
                  field: "otherDermatology",
                  label: "5. Bạn có đang tư vấn da liễu ở nơi khác không?",
                },
                {
                  field: "prescriptionMeds",
                  label: "6. Bạn có dùng thuốc chăm sóc da theo toa?",
                },
              ].map((q) => {
                const currentVal = answers[q.field as keyof SurveyAnswers];
                return (
                  <div
                    key={q.field}
                    className="border-border/40 space-y-1.5 border-b pb-3"
                  >
                    <span className="text-foreground block text-[11px] font-bold">
                      {q.label}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "yes", label: "Có" },
                        { val: "no", label: "Không" },
                        { val: "declined", label: "Không muốn trả lời" },
                      ].map((btn) => {
                        const isBtnSelected = currentVal === btn.val;
                        return (
                          <button
                            key={btn.val}
                            type="button"
                            onClick={() =>
                              updateAnswers({
                                [q.field]: btn.val,
                              } as Partial<SurveyAnswers>)
                            }
                            className={`rounded-xl border px-2 py-1.5 text-center text-[10px] font-bold transition-all ${
                              isBtnSelected
                                ? "border-primary bg-primary/10 text-primary ring-primary/20 ring-1"
                                : "border-border/60 text-muted-foreground hover:bg-secondary/20 bg-white"
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: PHOTO UPLOAD */}
        {step === 7 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                Tải ảnh chụp da phân tích AI
              </h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Tùy chọn tải ảnh chụp cận mặt giúp thuật toán AI phân tích chính
                xác các dấu hiệu bề mặt da.
              </p>
            </div>

            {/* Standard quality requirements check */}
            <div className="text-muted-foreground space-y-2 rounded-2xl border border-white/60 bg-white/40 p-4 text-xs shadow-sm">
              <h4 className="text-foreground flex items-center gap-1.5 text-[11px] font-bold">
                <HelpCircle className="text-primary h-4 w-4" /> Tiêu chuẩn ảnh
                hợp lệ:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Đã tẩy trang sạch sẽ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Ánh sáng tự nhiên tốt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Tháo kính mắt / Phụ kiện</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Mặt thẳng chính diện</span>
                </div>
              </div>
            </div>

            {/* Image Upload Area */}
            {answers.photoUploaded && answers.photoFile ? (
              <div className="border-primary/50 bg-primary/5 relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-5 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={answers.photoFile}
                  alt="Review skin profile photo"
                  className="border-primary/20 animate-scale-in h-28 w-28 rounded-2xl border object-cover shadow-md"
                />
                <div>
                  <span className="text-primary block text-xs font-bold">
                    Tải ảnh thành công!
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    Thuật toán AI đã sẵn sàng xử lý tệp này
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateAnswers({ photoUploaded: false, photoFile: null })
                  }
                  className="text-destructive text-xs font-bold hover:underline"
                >
                  Xóa ảnh và chọn lại
                </button>
              </div>
            ) : (
              <div className="border-border/80 space-y-4 rounded-3xl border-2 border-dashed bg-white/40 p-6 text-center">
                <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-foreground block text-xs font-bold">
                    Chọn ảnh da của bạn
                  </span>
                  <span className="text-muted-foreground block text-[10px]">
                    Định dạng JPEG, PNG tối đa 10MB
                  </span>
                </div>

                <div className="bg-border/30 my-2 h-[1px]" />

                {/* Clickable Quick Mock samples */}
                <div className="space-y-2">
                  <span className="text-muted-foreground block text-[9px] font-bold tracking-wider uppercase">
                    Hoặc thử với ảnh mẫu để test AI:
                  </span>
                  <div className="flex justify-center gap-3">
                    {MOCK_PHOTOS.map((ph) => (
                      <button
                        key={ph.id}
                        onClick={() =>
                          updateAnswers({
                            photoUploaded: true,
                            photoFile: ph.url,
                          })
                        }
                        className="group relative flex cursor-pointer flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ph.url}
                          alt={ph.name}
                          className="border-border group-hover:border-primary h-14 w-14 rounded-xl border object-cover"
                        />
                        <span className="text-muted-foreground group-hover:text-primary text-[8px] font-semibold">
                          {ph.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer controls (Next / Skip) */}
      <div className="shrink-0 space-y-2">
        <Button
          onClick={handleNext}
          className="bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          {step === 7 ? (
            <>
              <span>Hoàn Thành Khảo Sát</span>
              <Sparkles className="h-5 w-5 animate-pulse" />
            </>
          ) : (
            <>
              <span>Tiếp tục</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>

        {step === 7 && (
          <Button
            variant="ghost"
            onClick={handleSkipPhoto}
            className="text-muted-foreground hover:text-foreground w-full py-2 text-xs font-bold"
          >
            Bỏ qua ảnh & Phân tích khảo sát tĩnh
          </Button>
        )}
      </div>

      {/* Baumann explanation popup */}
      {isBaumannInfoOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-[2rem] border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="border-border/40 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-foreground text-lg font-extrabold tracking-tight">
                    Hệ Thống Phân Loại Da Baumann
                  </h3>
                  <p className="text-muted-foreground text-[10px]">
                    Baumann Skin Typing System
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBaumannInfoOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-full p-1.5 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="text-foreground/90 space-y-4 py-4 text-xs leading-relaxed">
              <p>
                Hệ thống phân loại da <strong>Baumann</strong> là phương pháp
                khoa học nổi tiếng được phát triển bởi Tiến sĩ Leslie Baumann.
                Hệ thống này chia làn da thành{" "}
                <strong>16 loại da khác nhau</strong> bằng cách đánh giá 4 thuộc
                tính (quang phổ) cốt lõi:
              </p>

              <div className="space-y-3">
                {/* 1. Oily vs Dry */}
                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold">
                      1. Oily (O) vs Dry (D)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Dầu hay Khô
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đo lường lượng bã nhờn và khả năng giữ nước của da. Da dầu
                    thường bóng và lỗ chân lông to; da khô thường thô ráp và
                    căng rát.
                  </p>
                </div>

                {/* 2. Sensitive vs Resistant */}
                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold">
                      2. Sensitive (S) vs Resistant (R)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Nhạy cảm hay Đề kháng
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đo mức độ phản ứng với các yếu tố bên ngoài. Da nhạy cảm dễ
                    ửng đỏ, ngứa rát và kích ứng; da đề kháng có lớp hàng rào
                    bảo vệ vững chắc, ít khi phản ứng phụ với mỹ phẩm.
                  </p>
                </div>

                {/* 3. Pigmented vs Non-pigmented */}
                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold">
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

                {/* 4. Wrinkled vs Tight */}
                <div className="border-border/50 space-y-1 rounded-2xl border bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold">
                      4. Wrinkled (W) vs Tight (T)
                    </span>
                    <span className="text-muted-foreground text-[9px] font-bold">
                      Nhăn hay Căng mịn
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Đánh giá nguy cơ lão hóa và nếp nhăn. Nhóm W cần các hoạt
                    chất chống oxy hóa mạnh; nhóm T tập trung duy trì sự săn
                    chắc trẻ trung vốn có.
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border-primary/20 text-primary rounded-2xl border p-3 text-[11px]">
                <strong>💡 Cách hoạt động trong GlowScan:</strong> Bằng cách kết
                hợp 4 chữ cái lại với nhau, bạn sẽ nhận được mã loại da riêng
                của mình (ví dụ: <strong>OSPW</strong>, <strong>DRNT</strong>).
                Hệ thống AI của chúng tôi sẽ dựa vào bộ mã này kết hợp với phân
                tích hình ảnh để đưa ra quy trình chăm sóc da tối ưu nhất cho
                bạn.
              </div>
            </div>

            {/* Footer button */}
            <div className="border-border/40 border-t pt-3">
              <Button
                onClick={() => setIsBaumannInfoOpen(false)}
                className="bg-primary hover:bg-primary/95 w-full rounded-2xl text-xs font-bold text-white shadow-md"
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
