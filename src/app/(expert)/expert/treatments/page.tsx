"use client";

import { useRouter } from "next/navigation";
import { FileText, Plus, User, Edit, Eye } from "lucide-react";
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
  const { data: plans = [], isLoading } = useTreatmentPlans(
    undefined,
    "expert",
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-xs font-bold text-amber-800"
          >
            Bản Nháp (Draft)
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-xs font-bold text-blue-800"
          >
            Đã Chốt (Chờ thanh toán)
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
          >
            Đang Điều Trị (Active)
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
          >
            Đã Hoàn Thành
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs font-bold">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <FileText className="h-5 w-5 text-emerald-600" />
            Quản Lý Phác Đồ Điều Trị Bệnh Nhân
          </h2>
          <p className="text-xs text-slate-500">
            Danh sách phác đồ Skincare cá nhân hóa do bạn thiết lập, chỉnh sửa
            và kích hoạt.
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
          plans.map((plan) => {
            const isDraft = plan.status === "DRAFT";
            const navUrl = `/expert/treatments/builder?treatmentId=${plan.id}&customerId=${plan.customerId}&customerName=${encodeURIComponent(plan.customerName || "Bệnh nhân")}`;

            return (
              <Card
                key={plan.id}
                className="border-slate-200 shadow-2xs transition-shadow hover:shadow-md"
              >
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">
                        {plan.customerName}
                      </span>
                    </div>

                    {getStatusBadge(plan.status)}
                  </div>
                  <CardTitle className="mt-2 text-base font-bold text-slate-900">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Chi phí: {formatVnd(plan.totalFeeVnd)} · Số phase:{" "}
                    {plan.phases.length}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-5 text-xs">
                  <div className="space-y-2">
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
                            Thời lượng: {phase.durationWeeks} tuần ·{" "}
                            {phase.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => router.push(navUrl)}
                      variant={isDraft ? "default" : "outline"}
                      className={`rounded-xl text-xs font-bold ${
                        isDraft
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border-slate-200 text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {isDraft ? (
                        <>
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Chỉnh Sửa / Hoàn Thiện Phác Đồ (Draft)
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Xem Chi Tiết Phác Đồ
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
