"use client";

import { Sun, Moon, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTreatment } from "../context/treatment-context";

export function PlanScreen() {
  const { state, setFlowState } = useTreatment();
  const morningList = state.morningRoutine;
  const eveningList = state.eveningRoutine;

  const answers = state.surveyAnswers;
  const baumannCode =
    (answers.baumannOilyDry || "O") +
    (answers.baumannSensitiveResistant || "S") +
    (answers.baumannPigmentNon || "P") +
    (answers.baumannWrinkleTight || "T");

  const isPregnant = answers.pregnancy === "yes";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-1 flex-col justify-between px-4 duration-500">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1 text-center">
          <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            PHÁC ĐỒ ĐIỀU TRỊ CỦA BẠN
          </span>
          <h3 className="font-heading text-foreground pt-1 text-xl font-extrabold tracking-tight">
            Liệu Trình Cá Nhân Hóa
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Thiết kế y khoa chuyên biệt cho loại da:{" "}
            <span className="text-foreground text-primary bg-primary/5 border-primary/10 rounded-lg border px-2 py-0.5 font-black">
              {baumannCode}
            </span>
          </p>
        </div>

        {/* Dynamic Warning for Safety (Pregnancy) */}
        {isPregnant && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-relaxed text-emerald-800 shadow-sm">
            <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <span>
              <strong>Chế độ thai kỳ an toàn hoạt động:</strong> Phác đồ đã tự
              động loại bỏ các hoạt chất có nguy cơ ảnh hưởng thai nhi
              (Retinoids, BHA liều cao). Các sản phẩm dưới đây hoàn toàn an toàn
              cho mẹ và bé.
            </span>
          </div>
        )}

        {/* Routine Containers (Scrollable) */}
        <div className="max-h-[360px] space-y-4.5 overflow-y-auto pr-1">
          {/* Morning Routine */}
          <div className="relative space-y-3.5 overflow-hidden rounded-3xl border border-amber-200/50 bg-amber-50/20 p-4 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-amber-200/10 to-transparent" />
            <div className="flex items-center gap-1.5 text-amber-600">
              <Sun className="h-5 w-5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Routine Buổi Sáng
              </span>
            </div>

            <div className="space-y-3">
              {morningList.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-foreground text-xs font-bold">
                      {item.text}
                    </span>
                    {item.description && (
                      <span className="text-primary text-[9px] font-semibold">
                        Thành phần chính: {item.description}
                      </span>
                    )}
                    {item.reason && (
                      <span className="text-muted-foreground text-[9px] leading-relaxed">
                        {item.reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Routine */}
          <div className="relative space-y-3.5 overflow-hidden rounded-3xl border border-indigo-200/50 bg-indigo-50/20 p-4 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-indigo-200/10 to-transparent" />
            <div className="flex items-center gap-1.5 text-indigo-600">
              <Moon className="h-5 w-5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Routine Buổi Tối
              </span>
            </div>

            <div className="space-y-3">
              {eveningList.map((item, idx) => (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-foreground text-xs font-bold">
                        {item.text}
                      </span>
                      {item.description && (
                        <span className="text-primary text-[9px] font-semibold">
                          Thành phần chính: {item.description}
                        </span>
                      )}
                      {item.reason && (
                        <span className="text-muted-foreground text-[9px] leading-relaxed">
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Render warning if active ingredient conflicts */}
                  {item.conflictWarning && (
                    <div className="ml-7 flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[9px] leading-relaxed text-amber-800">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{item.conflictWarning}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-4">
        <Button
          onClick={() => setFlowState("purchase")}
          className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
        >
          <span>Chốt Mua Sản Phẩm Liệu Trình</span>
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
