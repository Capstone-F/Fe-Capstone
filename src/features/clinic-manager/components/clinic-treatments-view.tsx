"use client";

import React, { useState } from "react";
import {
  FileText,
  Loader2,
  Eye,
  Info,
  Search,
  SearchX,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  useClinicTreatments,
  useClinicTreatmentDetail,
} from "../hooks/useClinicTreatments";
import { useClinicExperts } from "../hooks/useClinicExperts";
import { formatVndString } from "@/shared/utils/format";
import {
  treatmentPhaseTypeLabel,
  treatmentPhaseStatusLabel,
} from "@/features/treatments/lib/treatment-labels";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

const treatmentStatusFilterItems: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  ACTIVE: "Đang điều trị",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function ClinicTreatmentsView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expertIdFilter, setExpertIdFilter] = useState<string>("");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(
    null,
  );

  const { data: expertsData } = useClinicExperts({ limit: 100 });
  const expertsList = expertsData?.items || [];

  const expertFilterItems = React.useMemo(() => {
    return {
      ALL: "Tất cả chuyên gia",
      ...Object.fromEntries(
        (expertsData?.items || []).map((exp) => [
          exp.id,
          exp.name || exp.user?.name || `BS. #${exp.id.slice(0, 6)}`,
        ]),
      ),
    };
  }, [expertsData]);

  const activeQuery = {
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    expertId: expertIdFilter.trim() || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useClinicTreatments(activeQuery);
  const { data: detailData, isLoading: isDetailLoading } =
    useClinicTreatmentDetail(selectedTreatmentId);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải danh sách Phác đồ Điều trị...
        </span>
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-800"
          >
            Đang điều trị
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800"
          >
            Tạm dừng
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-blue-300 bg-blue-50 text-blue-800"
          >
            Hoàn thành
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="border-rose-300 bg-rose-50 text-rose-800"
          >
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const translatePhaseStatus = (status: string) => {
    return (
      treatmentPhaseStatusLabel[
        status as keyof typeof treatmentPhaseStatusLabel
      ] || (status === "CANCELLED" ? "Đã hủy" : status)
    );
  };

  const translatePhaseType = (type: string) => {
    return (
      treatmentPhaseTypeLabel[type as keyof typeof treatmentPhaseTypeLabel] ||
      type
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <FileText className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Giám sát Phác đồ Điều trị & Giải ngân Escrow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theo dõi các phác đồ chuyên sâu đã gửi, từng giai đoạn và doanh
              thu tạm giữ/giải ngân (Read-only)
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 dark:border-emerald-950/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          <strong>Lưu ý về Escrow:</strong> <code>releasedVnd</code> thể hiện
          tổng tiền Escrow gộp đã được giải ngân. Số tiền thực nhận thực tế của
          phòng khám sau khi trừ hoa hồng nền tảng sẽ được phản ánh tại trang{" "}
          <strong>Ví phòng khám</strong>.
        </span>
      </div>

      {/* Treatments Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Danh sách Phác đồ Điều trị</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </CardTitle>

          {/* Filters Bar inside Table Card Header */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Tìm kiếm phác đồ:
              </label>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tên phác đồ, bệnh nhân..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Trạng thái Phác đồ:
              </label>
              <Select
                value={statusFilter}
                items={treatmentStatusFilterItems}
                onValueChange={(val) => {
                  setStatusFilter(val || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang điều trị</SelectItem>
                  <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Chuyên gia phụ trách:
              </label>
              <Select
                value={expertIdFilter || "ALL"}
                items={expertFilterItems}
                onValueChange={(val) => {
                  setExpertIdFilter(!val || val === "ALL" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Tất cả chuyên gia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả chuyên gia</SelectItem>
                  {expertsList.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.name ||
                        exp.user?.name ||
                        `BS. #${exp.id.slice(0, 6)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isError ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {(error as Error)?.message ||
                    "Không thể tải danh sách phác đồ điều trị"}
                </span>
                <span className="text-xs text-slate-500">
                  Đã có lỗi xảy ra trong quá trình truy vấn dữ liệu. Bạn có thể
                  thử lại hoặc xóa từ khóa tìm kiếm.
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="rounded-xl text-xs"
                >
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Thử lại
                </Button>
                {(search || statusFilter !== "ALL" || expertIdFilter) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setExpertIdFilter("");
                      setPage(1);
                    }}
                    className="rounded-xl text-xs"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <SearchX className="h-6 w-6" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {search
                    ? `Không tìm thấy kết quả cho "${search}"`
                    : "Không có phác đồ điều trị nào khớp với bộ lọc"}
                </span>
                <span className="text-xs text-slate-500">
                  Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh các
                  tiêu chí lọc.
                </span>
              </div>
              {(search || statusFilter !== "ALL" || expertIdFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setExpertIdFilter("");
                    setPage(1);
                  }}
                  className="mt-2 rounded-xl text-xs"
                >
                  Xóa bộ lọc & tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-semibold">Tên Phác đồ</TableHead>
                  <TableHead className="font-semibold">
                    Chuyên gia phụ trách
                  </TableHead>
                  <TableHead className="font-semibold">Tổng chi phí</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold">
                    Tóm tắt Escrow (Giải ngân / Đang giữ)
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                      <div className="font-mono text-[10px] text-slate-400">
                        #{item.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {item.expertName || `BS. #${item.expertId.slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatVndString(item.totalPriceVnd)}
                    </TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          Đã giải ngân:{" "}
                          {formatVndString(item.escrow?.releasedVnd)}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">
                          Đang giữ: {formatVndString(item.escrow?.heldVnd)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTreatmentId(item.id)}
                        className="h-8 w-8 rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Common Pagination */}
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={data?.total || 0}
            pageSize={20}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>

      {/* Treatment Detail Modal (Read-only) */}
      <Dialog
        open={Boolean(selectedTreatmentId)}
        onOpenChange={(open) => !open && setSelectedTreatmentId(null)}
      >
        <DialogContent className="w-full max-w-lg rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <FileText className="h-5 w-5 text-emerald-600" />
              Chi tiết Phác đồ: {detailData?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tiến trình giai đoạn & tổng hợp dòng tiền Escrow
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || !detailData ? (
            <div className="flex min-h-[150px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2 text-xs">
              {/* Escrow Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-center">
                  <span className="text-[10px] font-medium text-emerald-700">
                    Đã giải ngân
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-emerald-800">
                    {formatVndString(detailData.escrow?.releasedVnd)}
                  </p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-2.5 text-center">
                  <span className="text-[10px] font-medium text-purple-700">
                    Đang tạm giữ
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-purple-800">
                    {formatVndString(detailData.escrow?.heldVnd)}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center">
                  <span className="text-[10px] font-medium text-rose-700">
                    Đã hoàn trả
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-rose-800">
                    {formatVndString(detailData.escrow?.refundedVnd)}
                  </p>
                </div>
              </div>

              {/* Phases List */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Các giai đoạn điều trị:
                </span>
                {detailData.phases?.map((phase, idx) => (
                  <div
                    key={phase.id || idx}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Giai đoạn {phase.phaseOrder + 1}:{" "}
                        {translatePhaseType(phase.phaseType)}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        Trạng thái:{" "}
                        <strong>{translatePhaseStatus(phase.status)}</strong>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatVndString(phase.priceVnd)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setSelectedTreatmentId(null)}
              className="w-full rounded-xl text-xs"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
