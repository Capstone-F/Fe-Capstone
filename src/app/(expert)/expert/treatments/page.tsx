"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Info,
  Loader2,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";

import { useTreatmentPlans } from "@/features/treatments/hooks/useTreatments";
import { getTreatmentStatusLabel } from "@/features/treatments/lib/treatment-labels";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import useDebounce from "@/shared/hooks/useDebounce";
import { formatVnd } from "@/shared/utils/format";

export default function ExpertTreatmentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateOrder, setDateOrder] = useState<"asc" | "desc">("desc");
  const [phaseCount, setPhaseCount] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const hasFilters = Boolean(search || phaseCount || dateOrder !== "desc");
  const {
    data: plans = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTreatmentPlans("expert", {
    search: debouncedSearch || undefined,
    dateOrder,
    phaseCount: phaseCount ? Number(phaseCount) : undefined,
  });

  function resetFilters() {
    setSearch("");
    setDateOrder("desc");
    setPhaseCount("");
  }

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
        <section className="mb-4 grid gap-3 border bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_160px_auto] md:items-end">
          <div className="space-y-2">
            <label
              htmlFor="treatment-search"
              className="text-xs font-medium text-slate-600"
            >
              Tìm phác đồ
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="treatment-search"
                className="pr-8 pl-8"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tên phác đồ hoặc khách hàng"
              />
              {isFetching && !isLoading && (
                <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Thứ tự ngày
            </label>
            <Select
              value={dateOrder}
              onValueChange={(value) => {
                if (value) setDateOrder(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mới nhất trước</SelectItem>
                <SelectItem value="asc">Cũ nhất trước</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="treatment-phase-count"
              className="text-xs font-medium text-slate-600"
            >
              Số giai đoạn
            </label>
            <Input
              id="treatment-phase-count"
              type="number"
              min={1}
              step={1}
              value={phaseCount}
              onChange={(event) => setPhaseCount(event.target.value)}
              placeholder="Tất cả"
            />
          </div>

          <Button
            variant="outline"
            disabled={!hasFilters}
            onClick={resetFilters}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Đặt lại
          </Button>
        </section>

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
            {hasFilters
              ? "Không tìm thấy phác đồ phù hợp với bộ lọc."
              : "Chưa có phác đồ. Hãy mở một ca tư vấn để lập bản nháp cho khách hàng."}
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
                      {getTreatmentStatusLabel(plan)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" />
                      {plan.customerName || "Khách hàng chưa cập nhật tên"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />{" "}
                      {plan.startDate || "Chưa đặt ngày"} -{" "}
                      {plan.endDate || "Chưa đặt ngày"}
                    </span>
                    <span>
                      {plan.phases.length} giai đoạn ·{" "}
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
                      customerName:
                        plan.customerName || "Khách hàng chưa cập nhật tên",
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
                  <Info className="mr-2 h-4 w-4" /> Xem chi tiết
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
