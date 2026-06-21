"use client";

import {
  Droplet,
  Heart,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTreatment } from "../context/treatment-context";

export function ReportScreen() {
  const { state, setFlowState } = useTreatment();
  const answers = state.surveyAnswers;
  const aiObs = state.aiObservation;

  // Compute a dynamic skin health score based on answers
  let score = 85;
  if (answers.baumannSensitiveResistant === "S") score -= 10;
  if (answers.irritationStatus && answers.irritationStatus !== "none")
    score -= 8;
  if (answers.primaryConcern === "Mụn trứng cá") score -= 7;

  // Guard score range
  score = Math.max(45, Math.min(98, score));

  // Baumann code
  const baumannCode =
    (answers.baumannOilyDry || "O") +
    (answers.baumannSensitiveResistant || "S") +
    (answers.baumannPigmentNon || "P") +
    (answers.baumannWrinkleTight || "T");

  // Format Baumann text translation
  const getBaumannTranslation = (code: string) => {
    const parts = [];
    parts.push(code[0] === "O" ? "Da dầu (Oily)" : "Da khô (Dry)");
    parts.push(
      code[1] === "S" ? "Nhạy cảm (Sensitive)" : "Khỏe/Đề kháng (Resistant)",
    );
    parts.push(
      code[2] === "P" ? "Tăng sắc tố (Pigmented)" : "Đều màu (Non-pigmented)",
    );
    parts.push(code[3] === "W" ? "Có nếp nhăn (Wrinkled)" : "Căng mịn (Tight)");
    return parts.join(" • ");
  };

  // Circular progress calculations for score
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col justify-between px-4 duration-500">
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1 text-center">
          <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            KẾT QUẢ PHÂN TÍCH
          </span>
          <h3 className="font-heading text-foreground pt-1 text-xl font-extrabold tracking-tight">
            Báo Cáo Sức Khỏe Da
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Báo cáo y khoa dựa trên hồ sơ Baumann và dữ liệu lâm sàng của bạn.
          </p>
        </div>

        {/* Premium Score Gauge */}
        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/70 py-4 shadow-sm backdrop-blur-md">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                stroke="oklch(var(--primary) / 0.15)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="translate-x-4 translate-y-4"
              />
              {/* Foreground progress circle */}
              <circle
                stroke="oklch(var(--primary))"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="translate-x-4 translate-y-4 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-heading text-foreground text-3xl font-extrabold tracking-tight">
                {score}
              </span>
              <span className="text-muted-foreground text-[8px] font-semibold tracking-wider uppercase">
                Điểm Sức Khỏe
              </span>
            </div>
          </div>
          <div className="mt-2.5 space-y-1 px-4 text-center">
            <span className="bg-primary/10 text-primary inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold">
              Mã Baumann: {baumannCode}
            </span>
            <p className="text-muted-foreground text-[10px] leading-relaxed font-medium">
              {getBaumannTranslation(baumannCode)}
            </p>
          </div>
        </div>

        {/* AI Observation Results (Conditionally rendered) */}
        {aiObs && (
          <div className="border-primary/20 bg-primary/5 shadow-inner-sm space-y-2 rounded-3xl border p-4">
            <div className="text-primary flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              <span>Kết Quả Quan Sát Từ AI (AI Observation)</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-[10px]">
              <div className="border-border/40 flex flex-col gap-0.5 rounded-xl border bg-white/60 p-2">
                <span className="text-muted-foreground">Mức độ mụn:</span>
                <span className="text-foreground flex justify-between text-xs font-bold">
                  <span>{aiObs.acneSeverity}</span>
                  <span className="text-primary text-[9px] font-normal">
                    → Niacinamide & BHA
                  </span>
                </span>
              </div>
              <div className="border-border/40 flex flex-col gap-0.5 rounded-xl border bg-white/60 p-2">
                <span className="text-muted-foreground">Thâm sạm da:</span>
                <span className="text-foreground flex justify-between text-xs font-bold">
                  <span>{aiObs.darkSpots}</span>
                  <span className="text-primary text-[9px] font-normal">
                    → Vitamin C / Nia
                  </span>
                </span>
              </div>
              <div className="border-border/40 flex flex-col gap-0.5 rounded-xl border bg-white/60 p-2">
                <span className="text-muted-foreground">Lỗ chân lông:</span>
                <span className="text-foreground flex justify-between text-xs font-bold">
                  <span>{aiObs.poreSize}</span>
                  <span className="text-primary text-[9px] font-normal">
                    → BHA & AHA
                  </span>
                </span>
              </div>
              <div className="border-border/40 flex flex-col gap-0.5 rounded-xl border bg-white/60 p-2">
                <span className="text-muted-foreground">Độ sâu nếp nhăn:</span>
                <span className="text-foreground flex justify-between text-xs font-bold">
                  <span>{aiObs.wrinkleDepth}</span>
                  <span className="text-primary text-[9px] font-normal">
                    → Chống lão hóa
                  </span>
                </span>
              </div>
            </div>
            <span className="text-muted-foreground block pt-1 text-center text-[8px] leading-normal italic">
              *Ảnh da đã được đối chiếu chéo và chuẩn hóa với các câu trả lời tự
              khai báo.
            </span>
          </div>
        )}

        {/* Detail Metric Cards */}
        <div className="space-y-2">
          <h4 className="text-foreground pl-1 text-[10px] font-bold tracking-wider uppercase">
            Chỉ số chi tiết:
          </h4>

          {/* Hydration */}
          <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0 rounded-xl bg-blue-50 p-1.5 text-blue-500">
                <Droplet className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-semibold">
                  Độ ẩm tự nhận biết
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Mức nước biểu bì tự cảm nhận
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-blue-600">
                {answers.hydration !== ""
                  ? `${answers.hydration}%`
                  : "Chưa khai báo"}
              </span>
              <span className="text-muted-foreground text-[9px] font-medium">
                {answers.hydration !== "" && answers.hydration <= 25
                  ? "Thấp (Khóa ẩm gấp)"
                  : "Cân bằng ổn định"}
              </span>
            </div>
          </div>

          {/* Sensitivity */}
          <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0 rounded-xl bg-emerald-50 p-1.5 text-emerald-500">
                <Heart className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-semibold">
                  Độ nhạy cảm hàng rào
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Phản ứng kích ứng với hoạt chất ngoại lai
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-emerald-600">
                {answers.baumannSensitiveResistant === "S"
                  ? "Nhạy cảm (S)"
                  : "Đề kháng (R)"}
              </span>
              <span className="text-muted-foreground text-[9px] font-medium">
                {answers.baumannSensitiveResistant === "S"
                  ? "Hàng rào mỏng nhẹ"
                  : "Đề kháng khỏe"}
              </span>
            </div>
          </div>

          {/* Irritation or Pregnancy risk */}
          <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0 rounded-xl bg-amber-50 p-1.5 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-semibold">
                  An toàn lâm sàng
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Nguy cơ thai kỳ & kích ứng hoạt chất
                </span>
              </div>
            </div>
            <div className="text-right">
              {answers.pregnancy === "yes" ? (
                <>
                  <span className="block text-xs font-bold text-red-600">
                    Thai kỳ (Có)
                  </span>
                  <span className="text-muted-foreground text-[9px] font-bold font-medium text-red-500">
                    Lọc hoạt chất mạnh
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-xs font-bold text-amber-600">
                    {answers.irritationStatus === "none" ||
                    !answers.irritationStatus
                      ? "Bình thường"
                      : "Có kích ứng nhẹ"}
                  </span>
                  <span className="text-muted-foreground text-[9px] font-medium">
                    {answers.irritationStatus === "none" ||
                    !answers.irritationStatus
                      ? "Không kích ứng"
                      : "Cần giãn cách thuốc"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Button footer */}
      <div className="shrink-0 pt-4">
        <Button
          onClick={() => setFlowState("plan")}
          className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
        >
          <span>Xem Phác Đồ Điều Trị</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
