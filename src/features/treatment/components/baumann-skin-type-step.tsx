"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Dna,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "./treatment-context";
import { useSession } from "@/features/auth/hooks/useSession";
import {
  useUpdateSkinType,
  useProfile,
} from "@/features/profile/hooks/useProfile";
import { toSkinTypePayload, type BaumannAxisScores } from "../lib/baumann-axes";
import { cn } from "@/lib/utils";

interface AxisConfig {
  key: keyof BaumannAxisScores;
  title: string;
  leftCode: string;
  leftLabel: string;
  rightCode: string;
  rightLabel: string;
  description: string;
  getEvaluation: (score: number) => string;
}

const SLIDER_AXES: AxisConfig[] = [
  {
    key: "oil",
    title: "Trục 1: Độ Dầu / Khô (Dầu ⟷ Khô)",
    leftCode: "O",
    leftLabel: "Da Dầu (Oily)",
    rightCode: "D",
    rightLabel: "Da Khô (Dry)",
    description:
      "Âm (-50): Tiết rất nhiều dầu bóng ⟷ Dương (+50): Da rất khô bong tróc",
    getEvaluation: (score) => {
      if (score <= -30) return "Da dầu nặng (-" + Math.abs(score) + ")";
      if (score < 0) return "Da dầu nhẹ/vừa (-" + Math.abs(score) + ")";
      if (score === 0) return "Da cân bằng / Thường (0)";
      if (score <= 30) return "Da khô nhẹ (+ " + score + ")";
      return "Da rất khô (+ " + score + ")";
    },
  },
  {
    key: "sensitivity",
    title: "Trục 2: Độ Nhạy Cảm (Khỏe ⟷ Nhạy Cảm)",
    leftCode: "R",
    leftLabel: "Da Khỏe (Resistant)",
    rightCode: "S",
    rightLabel: "Nhạy Cảm (Sensitive)",
    description:
      "Âm (-50): Da rất khỏe, không châm chích ⟷ Dương (+50): Dễ mẩn đỏ, nổi mụn kích ứng",
    getEvaluation: (score) => {
      if (score <= -30) return "Da cực kỳ khỏe/bền (-" + Math.abs(score) + ")";
      if (score <= 0) return "Da khỏe ít kích ứng (-" + Math.abs(score) + ")";
      if (score <= 30) return "Da nhạy cảm vừa (+" + score + ")";
      return "Da rất nhạy cảm (+" + score + ")";
    },
  },
  {
    key: "pigment",
    title: "Trục 3: Sắc Tố Da (Đều Màu ⟷ Tăng Sắc Tố)",
    leftCode: "N",
    leftLabel: "Đều Màu (Non-pigmented)",
    rightCode: "P",
    rightLabel: "Tăng Sắc Tố (Pigmented)",
    description:
      "Âm (-50): Tông màu đều, không thâm ⟷ Dương (+50): Nhiều vết thâm mụn, tàn nhang, nám",
    getEvaluation: (score) => {
      if (score <= -30) return "Da rất đều màu (-" + Math.abs(score) + ")";
      if (score <= 0) return "Da ít tăng sắc tố (-" + Math.abs(score) + ")";
      if (score <= 30) return "Tăng sắc tố vừa (+" + score + ")";
      return "Tăng sắc tố nhiều (+" + score + ")";
    },
  },
  {
    key: "aging",
    title: "Trục 4: Lão Hóa & Đàn Hồi (Căng Mịn ⟷ Nếp Nhăn)",
    leftCode: "T",
    leftLabel: "Căng Mịn (Tight)",
    rightCode: "W",
    rightLabel: "Có Nếp Nhăn (Wrinkled)",
    description:
      "Âm (-50): Da săn chắc căng mịn ⟷ Dương (+50): Có nếp nhăn, rãnh sâu và giảm đàn hồi",
    getEvaluation: (score) => {
      if (score <= -30) return "Da rất căng mịn (-" + Math.abs(score) + ")";
      if (score <= 0) return "Da căng săn chắc (-" + Math.abs(score) + ")";
      if (score <= 30) return "Có nếp nhăn nhẹ (+" + score + ")";
      return "Nếp nhăn sâu/Lão hóa (+" + score + ")";
    },
  },
];

export function BaumannSkinTypeStep() {
  const { setFlowState } = useTreatment();
  const sessionQuery = useSession();
  const isAuthenticated = Boolean(sessionQuery.data);
  const profileQuery = useProfile(isAuthenticated);
  const updateSkinType = useUpdateSkinType();

  // Initial scores from profile or default 0
  const savedScores: BaumannAxisScores = useMemo(() => {
    const b = profileQuery.data?.baumannScores;
    return {
      oil: b?.oilyDryScore ?? -10,
      sensitivity: b?.sensitiveResistantScore ?? 10,
      pigment: b?.pigmentedNonPigmentedScore ?? 10,
      aging: b?.wrinkledTightScore ?? -10,
    };
  }, [profileQuery.data?.baumannScores]);

  const [scores, setScores] = useState<BaumannAxisScores>(() => savedScores);
  const [isSaving, setIsSaving] = useState(false);

  // Compute 4-letter Baumann Code dynamically from slider scores
  const computedCode = useMemo(() => {
    const o = scores.oil < 0 ? "O" : "D";
    const s = scores.sensitivity > 0 ? "S" : "R";
    const p = scores.pigment > 0 ? "P" : "N";
    const w = scores.aging > 0 ? "W" : "T";
    return `${o}${s}${p}${w}`;
  }, [scores]);

  const handleSliderChange = (key: keyof BaumannAxisScores, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetToZero = () => {
    setScores({ oil: 0, sensitivity: 0, pigment: 0, aging: 0 });
  };

  const handleProceed = async () => {
    if (isAuthenticated) {
      setIsSaving(true);
      try {
        await updateSkinType.mutateAsync(toSkinTypePayload(scores));
      } catch (err) {
        console.warn("Failed to patch skin type to backend:", err);
      } finally {
        setIsSaving(false);
      }
    }
    setFlowState("survey");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between px-4 py-6 duration-300">
      <div className="space-y-6 pb-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlowState("intro")}
            className="border-border/40 hover:bg-secondary/40 h-10 w-10 shrink-0 rounded-2xl border"
          >
            <ArrowLeft className="h-5 w-5 text-[#131336]" />
          </Button>
          <span className="rounded-full bg-[#6b5cf6]/10 px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#6b5cf6] uppercase">
            Bước 1: Tinh Chỉnh Slider Baumann (Âm ⟷ Cân bằng ⟷ Dương)
          </span>
          <div className="h-10 w-10 shrink-0" />
        </div>

        {/* Dynamic Code Header */}
        <div className="flex flex-col gap-3 rounded-[28px] border border-indigo-200/60 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-[#6b5cf6]" />
              <span className="text-xs font-extrabold tracking-wider text-[#6b5cf6] uppercase">
                Mã Baumann Tự Động Tính Theo Slider:
              </span>
            </div>
            <h2 className="font-heading text-3xl font-black text-[#131336] sm:text-4xl">
              Mã:{" "}
              <span className="text-[#6b5cf6] underline decoration-indigo-300 underline-offset-8">
                {computedCode}
              </span>
            </h2>
          </div>

          <Button
            variant="outline"
            onClick={handleResetToZero}
            className="h-10 gap-1.5 rounded-2xl border-indigo-200 bg-white text-xs font-bold text-slate-700 hover:bg-indigo-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#6b5cf6]" />
            Đặt lại mốc Cân bằng (0)
          </Button>
        </div>

        {/* 4 Interactive Sliders */}
        <div className="grid gap-5 sm:grid-cols-2">
          {SLIDER_AXES.map((axis) => {
            const currentScore = scores[axis.key];

            return (
              <div
                key={axis.key}
                className="space-y-4 rounded-[32px] border border-white/80 bg-white/95 p-5 text-left shadow-lg backdrop-blur-xl transition-all"
              >
                <div className="flex items-start gap-3 border-b border-slate-100 pb-2.5">
                  <h4 className="min-w-0 flex-1 text-xs font-extrabold text-[#131336]">
                    {axis.title}
                  </h4>
                  <span className="shrink-0 rounded-full bg-[#6b5cf6]/10 px-2.5 py-0.5 text-[11px] font-extrabold whitespace-nowrap text-[#6b5cf6]">
                    {axis.getEvaluation(currentScore)}
                  </span>
                </div>

                <p className="min-h-[32px] text-[11px] leading-relaxed text-slate-500">
                  {axis.description}
                </p>

                {/* Slider UI Component */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={cn(
                        currentScore < 0 ? "text-[#6b5cf6]" : "text-slate-400",
                      )}
                    >
                      {axis.leftLabel} (-50)
                    </span>
                    <span className="font-semibold text-slate-400">
                      Cân bằng (0)
                    </span>
                    <span
                      className={cn(
                        currentScore > 0 ? "text-[#6b5cf6]" : "text-slate-400",
                      )}
                    >
                      {axis.rightLabel} (+50)
                    </span>
                  </div>

                  <div className="relative flex items-center py-2">
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={currentScore}
                      onChange={(e) =>
                        handleSliderChange(axis.key, Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#6b5cf6]"
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Mức độ âm</span>
                    <span className="font-extrabold text-[#131336]">
                      Điểm:{" "}
                      {currentScore > 0 ? `+${currentScore}` : currentScore}
                    </span>
                    <span>Mức độ dương</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="sticky bottom-0 left-0 z-10 mt-2 w-full border-t border-slate-100 bg-white/90 py-4 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setFlowState("intro")}
            disabled={isSaving}
            className="h-12 flex-1 rounded-2xl text-xs font-bold text-slate-700"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Quay lại
          </Button>
          <Button
            onClick={() => void handleProceed()}
            disabled={isSaving}
            className="h-12 flex-[2] rounded-2xl bg-[#6b5cf6] text-xs font-bold text-white shadow-lg hover:bg-[#5a4ae5]"
          >
            {isSaving ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                <span>Lưu Điểm & Tiếp Tục Làm Khảo Sát</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
