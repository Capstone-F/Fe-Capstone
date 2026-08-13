"use client";

import React, { useState } from "react";
import {
  ReceiptText,
  Download,
  Loader2,
  Info,
  Search,
  SearchX,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  useClinicTransactions,
  useExportClinicTransactionsCsv,
} from "../hooks/useClinicStatement";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

const TRANSACTION_TYPES: { label: string; value: string }[] = [
  { label: "Tất cả loại giao dịch", value: "ALL" },
  { label: "Thanh toán Tư vấn", value: "CONSULTATION_PAYMENT" },
  { label: "Thanh toán Phác đồ", value: "TREATMENT_PLAN_PAYMENT" },
  { label: "Hoàn tiền cho khách", value: "REFUND" },
  { label: "Giải ngân về ví phòng khám", value: "ESCROW_RELEASE" },
  { label: "Hoa hồng Nền tảng", value: "COMMISSION" },
  { label: "Rút tiền về ngân hàng", value: "WITHDRAWAL" },
  { label: "Hoàn trả rút tiền (Từ chối)", value: "WITHDRAWAL_REVERSAL" },
];

const typeFilterItems: Record<string, string> = Object.fromEntries(
  TRANSACTION_TYPES.map((t) => [t.value, t.label]),
);

export function ClinicStatementView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [expertId, setExpertId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

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
    type: selectedType !== "ALL" ? selectedType : undefined,
    expertId: expertId.trim() || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useClinicTransactions(activeQuery);
  const exportCsvMutation = useExportClinicTransactionsCsv();

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  const translateType = (type: string) => {
    switch (type) {
      case "CONSULTATION_PAYMENT":
        return (
          <Badge className="border-blue-200 bg-blue-100 text-blue-800">
            Thanh toán Tư vấn
          </Badge>
        );
      case "TREATMENT_PLAN_PAYMENT":
        return (
          <Badge className="border-purple-200 bg-purple-100 text-purple-800">
            Thanh toán Phác đồ
          </Badge>
        );
      case "REFUND":
        return (
          <Badge className="border-rose-200 bg-rose-100 text-rose-800">
            Hoàn tiền khách
          </Badge>
        );
      case "ESCROW_RELEASE":
        return (
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">
            Giải ngân về ví
          </Badge>
        );
      case "COMMISSION":
        return (
          <Badge className="border-amber-200 bg-amber-100 text-amber-800">
            Hoa hồng sàn
          </Badge>
        );
      case "WITHDRAWAL":
        return (
          <Badge className="border-teal-200 bg-teal-100 text-teal-800">
            Rút tiền về NH
          </Badge>
        );
      case "WITHDRAWAL_REVERSAL":
        return (
          <Badge className="border-indigo-200 bg-indigo-100 text-indigo-800">
            Hoàn ví (Admin từ chối)
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải lịch sử giao dịch...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ReceiptText className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Sổ cái Giao dịch & Biến động Số dư
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xem lại lịch sử nhận tiền giữ Escrow, giải ngân, hoa hồng và rút
              tiền ngân hàng (Read-only)
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            exportCsvMutation.mutate({
              type: activeQuery.type,
              expertId: activeQuery.expertId,
              from: activeQuery.from,
              to: activeQuery.to,
            })
          }
          disabled={exportCsvMutation.isPending}
          className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
        >
          {exportCsvMutation.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-4 w-4 text-slate-500" />
          )}
          Xuất Báo cáo CSV
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 dark:border-indigo-950/50 dark:bg-indigo-950/30 dark:text-indigo-200">
        <Info className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <span>
          <strong>Lưu ý:</strong> Sổ cái này phản ánh toàn bộ doanh thu tư vấn,
          phác đồ điều trị, hoa hồng nền tảng và rút tiền. Các đơn hàng sản phẩm
          thương mại và giao dịch nạp ví của khách hàng không nằm trong sao kê
          này.
        </span>
      </div>

      {/* Transactions Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Nhật ký Giao dịch (Sổ cái)</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </CardTitle>

          {/* Filters Bar inside Table Card Header */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Tìm kiếm sổ cái:
              </label>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ghi chú, mã giao dịch..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>

            {/* Filter 1: Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Loại giao dịch:
              </label>
              <Select
                value={selectedType}
                items={typeFilterItems}
                onValueChange={(val) => {
                  setSelectedType(val || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Chọn loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="text-xs"
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter 2: Expert */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Chuyên gia phụ trách:
              </label>
              <Select
                value={expertId || "ALL"}
                items={expertFilterItems}
                onValueChange={(val) => {
                  setExpertId(!val || val === "ALL" ? "" : val);
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

            {/* Filter 3: From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Từ ngày:
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            {/* Filter 4: To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Đến ngày:
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
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
                    "Không thể tải nhật ký giao dịch"}
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
                  selectedType !== "ALL" ||
                  expertId ||
                  from ||
                  to) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setSelectedType("ALL");
                      setExpertId("");
                      setFrom("");
                      setTo("");
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
                    : "Không có giao dịch nào khớp với bộ lọc"}
                </span>
                <span className="text-xs text-slate-500">
                  Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh các
                  tiêu chí lọc.
                </span>
              </div>
              {(search || selectedType !== "ALL" || expertId || from || to) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedType("ALL");
                    setExpertId("");
                    setFrom("");
                    setTo("");
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
                  <TableHead className="font-semibold">Thời gian</TableHead>
                  <TableHead className="font-semibold">
                    Loại giao dịch
                  </TableHead>
                  <TableHead className="font-semibold">Số tiền (VNĐ)</TableHead>
                  <TableHead className="font-semibold">
                    Liên kết (Ref ID)
                  </TableHead>
                  <TableHead className="font-semibold">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-slate-500">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{translateType(item.type)}</TableCell>
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatVndString(item.amountVnd)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {item.consultationId && (
                        <div>Booking: #{item.consultationId.slice(0, 8)}</div>
                      )}
                      {item.treatmentId && (
                        <div>Phác đồ: #{item.treatmentId.slice(0, 8)}</div>
                      )}
                      {item.withdrawalId && (
                        <div>Rút tiền: #{item.withdrawalId.slice(0, 8)}</div>
                      )}
                      {item.expertId && (
                        <div>Expert: #{item.expertId.slice(0, 8)}</div>
                      )}
                      {!item.consultationId &&
                        !item.treatmentId &&
                        !item.withdrawalId &&
                        !item.expertId && <span>—</span>}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {item.note || item.externalRef || "—"}
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
    </div>
  );
}
