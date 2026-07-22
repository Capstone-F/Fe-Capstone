"use client";

import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import {
  getSurveyReviewStep,
  validateSurveyRecommendation,
} from "@/features/treatment/lib/survey-flow";

export function ReportScreen() {
  const { state, setFlowState, setSurveyStep, getRecommendedProducts } =
    useTreatment();
  const skinType = state.customerProfile?.customer?.skinType;
  const baumannScores = state.customerProfile?.customer?.baumannScores;
  const recommendedProducts = getRecommendedProducts();
  const recommendationStatus = validateSurveyRecommendation(
    state.recommendations,
    state.surveySessionId,
  );

  if (recommendationStatus !== "ok") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Chưa thể dựng báo cáo khảo sát
        </h3>
        <p className="text-sm text-[#131336]/70">
          Backend chưa trả về bộ khuyến nghị hợp lệ cho phiên khảo sát này. Vui
          lòng quay lại và thử hoàn tất khảo sát thêm một lần nữa.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setSurveyStep(getSurveyReviewStep(state.dynamicQuestions.length));
              setFlowState("survey");
            }}
            className="rounded-full bg-[#6b5cf6] px-6 text-sm font-bold text-white hover:bg-[#5a4ae5]"
          >
            Quay lại khảo sát
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col justify-between px-4 duration-500">
      <div className="space-y-5">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSurveyStep(getSurveyReviewStep(state.dynamicQuestions.length));
              setFlowState("survey");
            }}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="space-y-1 text-center">
          <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            KẾT QUẢ TỪ BACKEND
          </span>
          <h3 className="font-heading text-foreground pt-1 text-xl font-extrabold tracking-tight">
            Hồ Sơ Da Sau Khảo Sát
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Chỉ hiển thị dữ liệu đã được backend xác nhận cho phiên khảo sát
            hiện tại.
          </p>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md sm:max-w-md md:max-w-xl">
          <div className="flex items-center gap-2 text-[#6b5cf6]">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold tracking-wider uppercase">
              Tóm tắt hồ sơ da
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-[#f6f4ff] px-4 py-3">
              <span className="text-xs font-semibold text-slate-600">
                Mã Baumann
              </span>
              <span className="text-sm font-extrabold text-[#6b5cf6]">
                {skinType?.code ?? "Chưa có"}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-100 px-4 py-3 text-left">
              <p className="text-xs font-semibold text-slate-900">
                {skinType?.name ??
                  "GlowScan đã ghi nhận phiên khảo sát của bạn"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {skinType?.description ??
                  "Loại da chi tiết sẽ hiển thị khi backend hoàn tất chấm điểm Baumann cho hồ sơ hiện tại."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <ClipboardList className="h-4 w-4 text-[#6b5cf6]" />
              <span className="text-xs font-bold">Protocol khuyến nghị</span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {state.recommendations?.protocols.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Backend đã chốt số protocol áp dụng cho phiên khảo sát này.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="h-4 w-4 text-[#6b5cf6]" />
              <span className="text-xs font-bold">Sản phẩm hợp lệ</span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {recommendedProducts.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Chỉ các variant thật từ backend mới được đưa sang bước mua hàng.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4 text-[#6b5cf6]" />
              <span className="text-xs font-bold">Điểm Baumann</span>
            </div>
            <p className="mt-3 text-sm font-black text-slate-900">
              {baumannScores
                ? `${baumannScores.oilyDryScore ?? "-"} / ${baumannScores.sensitiveResistantScore ?? "-"} / ${baumannScores.pigmentedNonPigmentedScore ?? "-"} / ${baumannScores.wrinkledTightScore ?? "-"}`
                : "Chưa có điểm chi tiết"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Backend sẽ cập nhật điểm chi tiết khi hồ sơ da đã được chấm xong.
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-4">
        <Button
          onClick={() => setFlowState("plan")}
          className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
        >
          <span>Xem Protocol Khuyến Nghị</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
