"use client";

import React, { useState } from "react";
import {
  Calendar,
  Loader2,
  Eye,
  Lock,
  CheckCircle2,
  XCircle,
  Star,
  Search,
  SearchX,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  useClinicBookings,
  useClinicBookingDetail,
} from "../hooks/useClinicBookings";
import { useClinicExperts } from "../hooks/useClinicExperts";
import { formatVndString } from "@/shared/utils/format";
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

const statusFilterItems: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  PENDING: "Chờ khám",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang khám",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function ClinicBookingsView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expertIdFilter, setExpertIdFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );

  const { data: expertsRes } = useClinicExperts({ limit: 100 });
  const expertsList = React.useMemo(
    () => expertsRes?.items || [],
    [expertsRes?.items],
  );

  const expertFilterItems = React.useMemo(() => {
    return {
      ALL: "Tất cả chuyên gia",
      ...Object.fromEntries(
        expertsList.map((c) => [
          c.id,
          c.name || c.user?.name || `BS. #${c.id.slice(0, 6)}`,
        ]),
      ),
    };
  }, [expertsList]);

  const activeQuery = {
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    expertId: expertIdFilter.trim() || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useClinicBookings(activeQuery);
  const { data: detailData, isLoading: isDetailLoading } =
    useClinicBookingDetail(selectedBookingId);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải danh sách Ca tư vấn...
        </span>
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800"
          >
            Chờ khám
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="border-blue-300 bg-blue-50 text-blue-800"
          >
            Đã xác nhận
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="border-purple-300 bg-purple-50 text-purple-800"
          >
            Đang khám
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-800"
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

  const renderEscrowBadge = (escrowStatus: string | null) => {
    if (!escrowStatus) return <span className="text-xs text-slate-400">—</span>;
    switch (escrowStatus) {
      case "HELD":
        return (
          <Badge className="gap-1 border-purple-200 bg-purple-100 text-purple-800">
            <Lock className="h-3 w-3" /> Đang giữ Escrow
          </Badge>
        );
      case "RELEASED":
        return (
          <Badge className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Đã giải ngân về ví
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="gap-1 border-rose-200 bg-rose-100 text-rose-800">
            <XCircle className="h-3 w-3" /> Đã hoàn tiền khách
          </Badge>
        );
      default:
        return <Badge variant="outline">{escrowStatus}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Calendar className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Giám sát Ca khám & Tiền giữ Escrow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xem danh sách lịch hẹn tư vấn của các Chuyên gia thuộc phòng khám
              (Read-only)
            </p>
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Danh sách Lịch hẹn Tư vấn</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </CardTitle>

          {/* Filters Bar inside Table Card Header */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Tìm kiếm ca hẹn:
              </label>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Mã ca, tên bệnh nhân..."
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
                Trạng thái ca khám:
              </label>
              <Select
                value={statusFilter}
                items={statusFilterItems}
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
                  <SelectItem value="PENDING">Chờ khám</SelectItem>
                  <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
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

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Từ ngày:
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Đến ngày:
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-xl text-xs"
              />
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
                    "Không thể tải danh sách ca tư vấn"}
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
                {(search ||
                  statusFilter !== "ALL" ||
                  expertIdFilter ||
                  fromDate ||
                  toDate) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setExpertIdFilter("");
                      setFromDate("");
                      setToDate("");
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
                    : "Không có ca khám nào khớp với bộ lọc"}
                </span>
                <span className="text-xs text-slate-500">
                  Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh các
                  tiêu chí lọc.
                </span>
              </div>
              {(search ||
                statusFilter !== "ALL" ||
                expertIdFilter ||
                fromDate ||
                toDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setExpertIdFilter("");
                    setFromDate("");
                    setToDate("");
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
                  <TableHead className="font-semibold">Mã ca khám</TableHead>
                  <TableHead className="font-semibold">Chuyên gia</TableHead>
                  <TableHead className="font-semibold">Khách hàng</TableHead>
                  <TableHead className="font-semibold">Thời gian hẹn</TableHead>
                  <TableHead className="font-semibold">Giá phí</TableHead>
                  <TableHead className="font-semibold">Trạng thái ca</TableHead>
                  <TableHead className="font-semibold">
                    Trạng thái Escrow
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.expertName || `BS. #${item.expertId.slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {item.customerName || "Khách hàng"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(item.scheduledAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatVndString(item.feeChargedVnd)}
                    </TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {renderEscrowBadge(item.escrowStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedBookingId(item.id)}
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

      {/* Booking Detail Modal (Read-only) */}
      <Dialog
        open={Boolean(selectedBookingId)}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      >
        <DialogContent className="w-full max-w-md rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Calendar className="h-5 w-5 text-purple-600" />
              Chi tiết Ca khám #{selectedBookingId?.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Thông tin chi tiết ca tư vấn & trạng thái Escrow
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || !detailData ? (
            <div className="flex min-h-[150px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <span className="text-slate-500">Trạng thái ca khám:</span>
                <div>{renderStatusBadge(detailData.status)}</div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <span className="text-slate-500">Trạng thái Escrow:</span>
                <div>{renderEscrowBadge(detailData.escrowStatus)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500">Chuyên gia:</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {detailData.expertName || detailData.expertId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Khách hàng:</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {detailData.customerName || "Khách hàng"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Thời gian hẹn:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(detailData.scheduledAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Phí dịch vụ:</span>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatVndString(detailData.feeChargedVnd)}
                  </p>
                </div>
              </div>

              {detailData.feedback && (
                <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>
                      Đánh giá từ khách hàng: {detailData.feedback.rating}/5 sao
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700 italic dark:text-slate-300">
                    {`"${detailData.feedback.comment}"`}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setSelectedBookingId(null)}
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
