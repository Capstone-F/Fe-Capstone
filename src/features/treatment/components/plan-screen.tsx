"use client";

import { ArrowLeft, Check, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { validateSurveyRecommendation } from "@/features/treatment/lib/survey-flow";

export function PlanScreen() {
  const { state, setFlowState, getRecommendedProducts } = useTreatment();
  const products = getRecommendedProducts();
  const recommendationStatus = validateSurveyRecommendation(
    state.recommendations,
    state.surveySessionId,
  );

  const protocolGroups =
    state.recommendations?.protocols
      .map((protocol) => ({
        id: protocol.id,
        code: protocol.code,
        name: protocol.name,
        description: protocol.description,
        products: products.filter(
          (product) => product.protocolId === protocol.id,
        ),
      }))
      .filter((group) => group.products.length > 0) ?? [];

  const groupedCards =
    protocolGroups.length > 0
      ? protocolGroups
      : [
          {
            id: "fallback",
            code: "SURVEY",
            name: "Sản phẩm khuyến nghị",
            description:
              "Danh sách sản phẩm backend đã chốt cho phiên khảo sát hiện tại.",
            products,
          },
        ];

  if (recommendationStatus !== "ok") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Chưa có protocol hợp lệ
        </h3>
        <p className="text-sm text-[#131336]/70">
          Khảo sát đã hoàn tất nhưng chưa lấy được bộ protocol và sản phẩm thật
          từ backend.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => setFlowState("report")}
            className="rounded-full bg-[#6b5cf6] px-6 text-sm font-bold text-white hover:bg-[#5a4ae5]"
          >
            Quay lại báo cáo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-1 flex-col justify-between px-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlowState("report")}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="space-y-1 text-center">
          <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            PROTOCOL KHUYẾN NGHỊ
          </span>
          <h3 className="font-heading text-foreground pt-1 text-xl font-extrabold tracking-tight">
            Phác Đồ Từ Backend
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Routine chi tiết chỉ được kích hoạt sau khi thanh toán survey thành
            công.
          </p>
        </div>

        <div className="max-h-[360px] space-y-4.5 overflow-y-auto pr-1">
          {groupedCards.map((group) => (
            <div
              key={group.id}
              className="relative space-y-3.5 overflow-hidden rounded-3xl border border-indigo-200/50 bg-indigo-50/20 p-4 shadow-sm backdrop-blur"
            >
              <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-indigo-200/10 to-transparent" />
              <div className="flex items-center gap-1.5 text-indigo-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  {group.code}
                </span>
              </div>

              <div>
                <h4 className="text-foreground text-sm font-extrabold">
                  {group.name}
                </h4>
                <p className="text-muted-foreground mt-1 text-[10px] leading-relaxed">
                  {group.description ||
                    "Backend không trả mô tả chi tiết cho protocol này."}
                </p>
              </div>

              <div className="space-y-3">
                {group.products.map((product, index) => (
                  <div key={product.id} className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-bold">
                          {product.name}
                        </span>
                        <span className="text-primary text-[9px] font-semibold">
                          {product.brand} • {product.category}
                        </span>
                        <span className="text-muted-foreground text-[9px] leading-relaxed">
                          {product.reason}
                        </span>
                      </div>
                    </div>

                    {product.conflictWarning && (
                      <div className="ml-7 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[9px] leading-relaxed text-amber-800">
                        {product.conflictWarning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 pt-4">
        <Button
          onClick={() => setFlowState("purchase")}
          className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
        >
          <span>Chọn Sản Phẩm Khuyến Nghị</span>
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
