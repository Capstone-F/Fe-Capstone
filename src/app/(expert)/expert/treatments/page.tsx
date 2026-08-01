"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, FileText, Loader2, UserRound } from "lucide-react";

import { useTreatmentPlans } from "@/features/treatments/hooks/useTreatments";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";

export default function ExpertTreatmentsPage() {
  const router = useRouter();
  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
  } = useTreatmentPlans("expert");

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <FileText className="h-5 w-5 text-emerald-700" /> Phác đồ điều trị
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bản nháp được khởi tạo trực tiếp từ ca tư vấn của khách hàng.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải phác
            đồ...
          </div>
        ) : isError ? (
          <div className="border bg-white p-8 text-center">
            <p className="text-sm text-red-600">
              Không thể tải danh sách phác đồ.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="border border-dashed bg-white p-10 text-center text-sm text-slate-500">
            Chưa có phác đồ. Hãy mở một ca tư vấn để lập bản nháp cho khách
            hàng.
          </div>
        ) : (
          <div className="divide-y border bg-white">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">
                      {plan.title}
                    </h2>
                    <Badge variant="outline">
                      {plan.status === "DRAFT" && plan.readyForPayment
                        ? "Chờ thanh toán"
                        : plan.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" /> Khách{" "}
                      {plan.customerId.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />{" "}
                      {plan.startDate || "Chưa đặt ngày"} -{" "}
                      {plan.endDate || "Chưa đặt ngày"}
                    </span>
                    <span>
                      {plan.phases.length} phase ·{" "}
                      {formatVnd(plan.totalPriceVnd ?? 0)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const query = new URLSearchParams({
                      treatmentId: plan.id,
                      customerId: plan.customerId,
                    });
                    if (plan.sourceConsultationId)
                      query.set(
                        "sourceConsultationId",
                        plan.sourceConsultationId,
                      );
                    router.push(
                      `/expert/treatments/builder?${query.toString()}`,
                    );
                  }}
                >
                  Mở phác đồ
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
