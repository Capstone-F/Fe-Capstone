"use client";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { useTreatmentPlans, usePayTreatmentPlan } from "../hooks/useTreatments";
import { formatVnd } from "@/shared/utils/format";
import { toast } from "sonner";

export function CustomerTreatmentView() {
  const router = useRouter();
  const { data: plans, isLoading } = useTreatmentPlans("user_customer_demo");
  const payPlanMutation = usePayTreatmentPlan();
  const activePlan = plans?.[0];

  if (isLoading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-xs font-semibold text-slate-500">
        Đang nạp phác đồ điều trị da cá nhân hóa...
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        <Sparkles className="h-8 w-8 text-amber-500" />
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Bạn Chưa Có Phác Đồ Điều Trị Active
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Hãy đặt lịch hẹn tư vấn với Bác sĩ chuyên khoa để được lập phác đồ
            Skincare cá nhân hóa 1:1.
          </p>
        </div>
        <Button
          onClick={() => router.push("/experts")}
          className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          Đặt Lịch Khám Chuyên Gia Ngay
        </Button>
      </div>
    );
  }

  const activePhase =
    activePlan.phases.find((p) => p.status === "ACTIVE") ||
    activePlan.phases[0];

  return (
    <div className="space-y-6">
      {/* Top Banner with Ribbon */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 p-6 text-white shadow-md">
        {/* Ribbon Badge */}
        <div className="absolute top-0 right-0 h-28 w-28 overflow-hidden">
          <div className="absolute top-3 -right-7 w-32 rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 py-1 text-center text-[9px] font-black tracking-wider text-white uppercase shadow-md">
            PHÁC ĐỒ ACTIVE
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-emerald-500/40 bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Đã Kiểm Duyệt Bởi Bác Sĩ
          </Badge>
          <span className="text-xs font-semibold text-emerald-200">
            Bác sĩ phụ trách: <strong>{activePlan.expertName}</strong>
          </span>
        </div>

        <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {activePlan.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-800/60 pt-4">
          <div className="flex items-center gap-4 text-xs text-emerald-200/90">
            <span>
              Giai đoạn hiện tại:{" "}
              <strong>Phase {activePlan.currentPhaseNumber}</strong>
            </span>
            <span>
              Tổng chi phí gói:{" "}
              <strong>{formatVnd(activePlan.totalFeeVnd)}</strong>
            </span>
          </div>

          {/* Payment or Free Re-booking Button */}
          {activePlan.status === "DRAFT" ||
          activePlan.status === "PENDING_PAYMENT" ? (
            <Button
              size="sm"
              onClick={() => {
                payPlanMutation.mutate(activePlan.id, {
                  onSuccess: () => {
                    toast.success(
                      "Thanh toán phác đồ bằng Ví thành công! Phác đồ đã chuyển sang Active.",
                    );
                  },
                  onError: (err: unknown) => {
                    toast.error(
                      (err as Error)?.message || "Thanh toán thất bại.",
                    );
                  },
                });
              }}
              disabled={payPlanMutation.isPending}
              className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
            >
              Thanh Toán Gói ({formatVnd(activePlan.totalFeeVnd)}) Qua Ví
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                toast.success(
                  "Bán đã có Phác đồ Active! Ca tái khám được tính 0đ (Miễn phí)",
                );
                router.push(`/booking/${activePlan.expertId}`);
              }}
              className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-400"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Đặt Lịch Tái Khám (Miễn Phí 0đ)
            </Button>
          )}
        </div>
      </div>

      {/* Active Phase Details */}
      {activePhase && (
        <Card className="border-slate-200 shadow-2xs">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {activePhase.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Thời lượng: {activePhase.durationWeeks} tuần ·{" "}
                  {activePhase.notes}
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
              >
                Phase Đang Hoạt Động
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* AM Routine */}
            <div className="space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <Sun className="h-4 w-4 text-amber-600" /> BUỔI SÁNG (AM
                  ROUTINE)
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  3 Bước Skincare
                </span>
              </div>

              <div className="space-y-2">
                {activePhase.amSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded-xl border border-amber-100/80 bg-white p-3 text-xs shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">
                        Bước {idx + 1}: {step.stepName}
                      </span>
                      <span className="block text-[11px] font-semibold text-emerald-700">
                        Sản phẩm: {step.productName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Tần suất: {step.frequencyPreset} ·{" "}
                        {step.instructionPreset}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast.success(`Đã hoàn thành bước: ${step.stepName}`)
                      }
                      className="rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Check-in
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* PM Routine */}
            <div className="space-y-3 rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                  <Moon className="h-4 w-4 text-indigo-600" /> BUỔI TỐI (PM
                  ROUTINE)
                </span>
                <span className="text-[10px] font-bold text-indigo-700">
                  2 Bước Skincare
                </span>
              </div>

              <div className="space-y-2">
                {activePhase.pmSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded-xl border border-indigo-100/80 bg-white p-3 text-xs shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">
                        Bước {idx + 1}: {step.stepName}
                      </span>
                      <span className="block text-[11px] font-semibold text-emerald-700">
                        Sản phẩm: {step.productName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Tần suất: {step.frequencyPreset} ·{" "}
                        {step.instructionPreset}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast.success(`Đã hoàn thành bước: ${step.stepName}`)
                      }
                      className="rounded-lg text-[11px] font-bold text-indigo-700 hover:bg-indigo-50"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Check-in
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
