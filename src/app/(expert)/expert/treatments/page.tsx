"use client";

import { useRouter } from "next/navigation";
import { FileText, Plus, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useTreatmentPlans } from "@/features/treatments/hooks/useTreatments";
import { formatVnd } from "@/shared/utils/format";

export default function ExpertTreatmentsPage() {
  const router = useRouter();
  const { data: plans = [], isLoading } = useTreatmentPlans();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <FileText className="h-5 w-5 text-emerald-600" />
            Quản Lý Phác Đồ Điều Trị Bệnh Nhân
          </h2>
          <p className="text-xs text-slate-500">
            Danh sách phác đồ Skincare cá nhân hóa do bạn thiết lập và kích
            hoạt.
          </p>
        </div>

        <Button
          onClick={() => router.push("/expert/treatments/builder")}
          className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Lập Phác Đồ Mới (Đa Giai Đoạn)
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Đang nạp danh sách phác đồ...
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
            Chưa có phác đồ điều trị nào được lập.
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-900">
                      {plan.customerName}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
                  >
                    {plan.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-slate-900">
                  {plan.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Chi phí: {formatVnd(plan.totalFeeVnd)} · Số phase:{" "}
                  {plan.phases.length}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 p-5 text-xs">
                <span className="block font-bold text-slate-700">
                  Các giai đoạn điều trị:
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {plan.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="space-y-1 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <span className="block font-bold text-slate-900">
                        Phase {phase.phaseNumber}: {phase.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Thời lượng: {phase.durationWeeks} tuần · {phase.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
