"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Tag,
  Dna,
  ShieldCheck,
  Clock,
  FlaskConical,
  ShoppingBag,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { useSession } from "@/features/auth/hooks/useSession";
import { formatVnd } from "@/shared/utils/format";
import {
  getSurveyReviewStep,
  validateSurveyRecommendation,
} from "@/features/treatment/lib/survey-flow";
import { parseBaumannCode } from "../lib/baumann";

type TabType = "PROFILE" | "PRODUCTS";

const PROFILE_LABELS_VI: Record<string, string> = {
  FEMALE: "Nữ",
  MALE: "Nam",
  NOT_PREFER_TO_SAY: "Không muốn tiết lộ",
};

export function ReportScreen() {
  const router = useRouter();
  const sessionQuery = useSession();
  const isAuthenticated = Boolean(sessionQuery.data);
  const { state, setFlowState, setSurveyStep, getRecommendedProducts } =
    useTreatment();
  const [activeTab, setActiveTab] = useState<TabType>("PROFILE");

  const recommendedProducts = getRecommendedProducts();
  const recommendationStatus = validateSurveyRecommendation(
    state.recommendations,
    state.surveySessionId,
  );

  // Extract snapshot profile from recommendation or customer profile fallback
  const recProfile = state.recommendations?.customerProfile;
  const custProfile = state.customerProfile?.customer;

  const rawCode =
    recProfile?.skinTypeCode || custProfile?.skinType?.code || "ORNT";

  const scores = recProfile
    ? {
        oilyDryScore: recProfile.oilyDryScore,
        sensitiveResistantScore: recProfile.sensitiveResistantScore,
        pigmentedNonPigmentedScore: recProfile.pigmentedNonPigmentedScore,
        wrinkledTightScore: recProfile.wrinkledTightScore,
      }
    : custProfile?.baumannScores;

  const parsedBaumann = parseBaumannCode(rawCode, scores);
  const labels = state.recommendations?.labels || [];
  const protocols = state.recommendations?.protocols || [];
  const localizedLabelByCode = new Map(
    state.dynamicQuestions.flatMap((question) =>
      question.options.map((option) => [
        option.labelCode,
        option.vietnameseNormalized || option.name,
      ]),
    ),
  );
  state.faceLabels.forEach((label) => {
    localizedLabelByCode.set(
      label.code,
      label.vietnameseNormalized || label.name,
    );
  });

  if (recommendationStatus !== "ok") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Chưa thể dựng báo cáo khảo sát
        </h3>
        <p className="text-sm text-[#131336]/70">
          Chưa có đủ dữ liệu để hiển thị kết quả khảo sát này. Vui lòng quay lại
          và hoàn tất khảo sát thêm một lần nữa.
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
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setFlowState("intro");
            }}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            Kết quả khảo sát da
          </span>
          <div className="h-8 w-8 shrink-0" />
        </div>

        {/* Guest Claim Banner (matching Mobile spec) */}
        {!isAuthenticated && (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 text-left shadow-xs sm:flex-row">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h5 className="text-xs font-bold text-amber-900">
                  Kết quả khảo sát tạm thời (Khách vãng lai)
                </h5>
                <p className="text-[11px] text-amber-800">
                  Đăng nhập hoặc tạo tài khoản để tự động lưu phác đồ này và mua
                  hàng!
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/login?redirectTo=/checkout")}
              className="w-full shrink-0 rounded-xl bg-[#6b5cf6] px-4 py-2 text-xs font-bold text-white hover:bg-[#5a4ae5] sm:w-auto"
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}

        {/* Segmented Control Tabs */}
        <div className="mx-auto w-full max-w-xl rounded-2xl bg-slate-100 p-1.5 shadow-inner">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("PROFILE")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                activeTab === "PROFILE"
                  ? "bg-white text-[#6b5cf6] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Dna className="h-4 w-4" />
              <span>Hồ sơ da</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PRODUCTS")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                activeTab === "PRODUCTS"
                  ? "bg-white text-[#6b5cf6] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Sản phẩm gợi ý</span>
              <span className="rounded-full bg-[#6b5cf6] px-2 py-0.5 text-[10px] font-extrabold text-white">
                {recommendedProducts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Profile & Protocols */}
        {activeTab === "PROFILE" && (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* AI Analysis Banner */}
            <div className="rounded-3xl border border-[#6b5cf6]/20 bg-[#f6f4ff] p-4 text-left shadow-xs sm:p-5">
              <div className="flex items-center gap-2.5 text-[#6b5cf6]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6b5cf6] text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase">
                  Phân tích chăm sóc da GlowScan
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                Dựa trên câu trả lời khảo sát và phân tích tình trạng da hiện
                tại, hệ thống tổng hợp hồ sơ Baumann và gợi ý hoạt chất chăm sóc
                phù hợp cho bạn.
              </p>
            </div>

            {/* Baumann Profile Hero Card */}
            <div className="relative rounded-3xl border border-white/80 bg-white/80 p-5 text-left shadow-md backdrop-blur-md sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#6b5cf6]/10 px-3 py-1 text-xs font-extrabold text-[#6b5cf6]">
                      Mã Baumann: {parsedBaumann.code}
                    </span>
                    {recProfile?.age && (
                      <span className="text-xs font-semibold text-slate-500">
                        {recProfile.age} tuổi
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading mt-2 text-xl font-black text-[#131336] sm:text-2xl">
                    {parsedBaumann.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {parsedBaumann.description}
                  </p>
                </div>
              </div>

              {/* 4 Baumann Axes Gauges / Sliders */}
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                {Object.values(parsedBaumann.axes).map((axis) => {
                  // Normalize score to 0 - 100% for slider visual
                  const score = Object.is(axis.score, -0) ? 0 : axis.score;
                  const clampedScore = Math.max(-50, Math.min(50, score));
                  const percentage = ((clampedScore + 50) / 100) * 100;

                  return (
                    <div
                      key={axis.key}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:bg-white"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{axis.label}</span>
                        <span className="text-[#6b5cf6]">
                          {score > 0 ? `+${score}` : score}
                        </span>
                      </div>

                      {/* Slider Bar Representation */}
                      <div className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-[#6b5cf6] transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-500">
                        <span
                          className={
                            score <= 0 ? "font-bold text-[#6b5cf6]" : ""
                          }
                        >
                          {axis.negativeLabel}
                        </span>
                        <span
                          className={
                            score > 0 ? "font-bold text-[#6b5cf6]" : ""
                          }
                        >
                          {axis.positiveLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recorded Skin Concern Tags */}
            {labels.length > 0 && (
              <div className="space-y-2.5 text-left">
                <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Vấn đề da được ghi nhận ({labels.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {labels.map((lbl, idx) => (
                    <div
                      key={lbl.id || idx}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#131336] shadow-xs"
                    >
                      <Tag className="h-3.5 w-3.5 text-[#6b5cf6]" />
                      <span>
                        {lbl.vietnameseNormalized ||
                          (lbl.code
                            ? localizedLabelByCode.get(lbl.code)
                            : undefined) ||
                          (lbl.code
                            ? PROFILE_LABELS_VI[lbl.code]
                            : undefined) ||
                          lbl.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Treatment Protocols */}
            {protocols.length > 0 && (
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Hoạt chất và cách chăm sóc gợi ý ({protocols.length} bước)
                </h4>

                <div className="space-y-3">
                  {protocols.map((proto, idx) => (
                    <div
                      key={proto.id || idx}
                      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6b5cf6]/10 text-xs font-black text-[#6b5cf6]">
                            {idx + 1}
                          </div>
                          <div>
                            <h5 className="font-heading text-base font-bold text-[#131336]">
                              {proto.name}
                            </h5>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[#6b5cf6]">
                              <FlaskConical className="h-3.5 w-3.5" />
                              <span>
                                {proto.ingredientName}
                                {proto.concentrationPct
                                  ? ` (${proto.concentrationPct}%)`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {proto.timeOfUse && (
                          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {translateTimeOfUse(proto.timeOfUse)}
                          </span>
                        )}
                      </div>

                      {proto.instructions && (
                        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                          <strong>Hướng dẫn:</strong> {proto.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Suggested products */}
        {activeTab === "PRODUCTS" && (
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-left shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Sản phẩm gợi ý phù hợp với hồ sơ da
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Đây là các sản phẩm phù hợp với hoạt chất và cách chăm sóc được
                gợi ý cho bạn.
              </p>
            </div>

            <div className="space-y-3">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-heading text-sm font-bold text-[#131336]">
                      {product.name}
                    </h5>
                    <p className="text-xs text-slate-500">
                      Hoạt chất / thông tin sản phẩm: {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#131336]">
                      {formatVnd(product.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setFlowState("purchase")}
              className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
            >
              <span>Tiến Hành Đặt Đơn / Mua Hàng</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Footer Actions */}
      <div className="shrink-0 pt-6">
        <Button
          onClick={() =>
            setFlowState(activeTab === "PROFILE" ? "purchase" : "plan")
          }
          className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
        >
          <span>
            {activeTab === "PROFILE"
              ? isAuthenticated
                ? "Xem sản phẩm gợi ý & đặt hàng"
                : "Xem sản phẩm gợi ý & đăng nhập"
              : "Quay lại hồ sơ da"}
          </span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function translateTimeOfUse(value: string): string {
  const labels: Record<string, string> = {
    AM: "Buổi sáng",
    PM: "Buổi tối",
    MORNING: "Buổi sáng",
    EVENING: "Buổi tối",
    AM_PM: "Sáng và tối",
  };
  return labels[value] ?? value;
}
