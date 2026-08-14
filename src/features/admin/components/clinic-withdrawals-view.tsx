"use client";

import React, { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import {
  useAdminClinicWithdrawals,
  useMarkWithdrawalPaid,
  useRejectWithdrawal,
} from "../hooks/useClinicWithdrawals";
import { useAdminClinics } from "../hooks/useAdminClinics";
import { ClinicWithdrawalItem } from "../api/admin-clinic-withdrawals.api";
import { formatVndString } from "@/shared/utils/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
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

const withdrawalStatusFilterItems: Record<string, string> = {
  REQUESTED: "Hàng đợi chờ duyệt",
  PAID: "Đã thanh toán",
  REJECTED: "Đã từ chối",
  ALL: "Tất cả trạng thái",
};

export function AdminClinicWithdrawalsView() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "REQUESTED" | "PAID" | "REJECTED" | "ALL"
  >("REQUESTED");
  const [clinicIdFilter, setClinicIdFilter] = useState("");

  // Fetch clinics list for dropdown selection
  const { data: clinicsRes } = useAdminClinics();

  const clinicMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (clinicsRes?.items || []).forEach((c: { id: string; name?: string }) => {
      if (c.id && c.name) map.set(c.id, c.name);
    });
    return map;
  }, [clinicsRes?.items]);

  const clinicFilterItems = React.useMemo(() => {
    const list = clinicsRes?.items || [];
    return {
      ALL: "Tất cả phòng khám",
      ...Object.fromEntries(
        list.map((c: { id: string; name?: string }) => [
          c.id,
          c.name || `Phòng khám #${c.id.slice(0, 6)}`,
        ]),
      ),
    };
  }, [clinicsRes?.items]);

  // Modals state
  const [markPaidTarget, setMarkPaidTarget] =
    useState<ClinicWithdrawalItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ClinicWithdrawalItem | null>(
    null,
  );

  const [transferRefInput, setTransferRefInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const { data, isLoading, isFetching } = useAdminClinicWithdrawals({
    status: statusFilter,
    clinicId: clinicIdFilter.trim() || undefined,
    page,
    limit: 20,
  });

  const markPaidMutation = useMarkWithdrawalPaid();
  const rejectMutation = useRejectWithdrawal();

  const handleMarkPaidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markPaidTarget) return;
    markPaidMutation.mutate(
      {
        id: markPaidTarget.id,
        dto: {
          transferRef: transferRefInput.trim() || undefined,
          note: noteInput.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setMarkPaidTarget(null);
          setTransferRefInput("");
          setNoteInput("");
        },
      },
    );
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    rejectMutation.mutate(
      {
        id: rejectTarget.id,
        dto: {
          note: noteInput.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setNoteInput("");
        },
      },
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải danh sách Yêu cầu Rút tiền...
        </span>
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <Clock className="mr-1 h-3 w-3 text-amber-600" /> Chờ duyệt
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          >
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" /> Đã thanh
            toán
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-rose-300 bg-rose-50 font-bold text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
          >
            <XCircle className="mr-1 h-3 w-3 text-rose-600" /> Đã từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Duyệt Hàng đợi Rút tiền Phòng khám
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Xác nhận Admin đã chuyển khoản ngân hàng thực tế hoặc từ chối để hoàn
          trả lại ví phòng khám
        </p>
      </div>

      {/* Withdrawals Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Danh sách Yêu cầu Rút tiền</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </CardTitle>

          {/* Filters Bar inside Table Card Header */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Lọc theo trạng thái:
              </label>
              <Select
                value={statusFilter}
                items={withdrawalStatusFilterItems}
                onValueChange={(val) => {
                  setStatusFilter(
                    (val || "REQUESTED") as
                      | "REQUESTED"
                      | "PAID"
                      | "REJECTED"
                      | "ALL",
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Hàng đợi (Chờ duyệt)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REQUESTED">Hàng đợi chờ duyệt</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Phòng khám:
              </label>
              <Select
                value={clinicIdFilter || "ALL"}
                items={clinicFilterItems}
                onValueChange={(val) => {
                  setClinicIdFilter(!val || val === "ALL" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Tất cả phòng khám" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phòng khám</SelectItem>
                  {(clinicsRes?.items || []).map(
                    (c: { id: string; name?: string }) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name || `Phòng khám #${c.id.slice(0, 6)}`}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
              Không có yêu cầu rút tiền nào trong hàng đợi này.
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-semibold">Phòng khám</TableHead>
                  <TableHead className="font-semibold">Số tiền</TableHead>
                  <TableHead className="font-semibold">
                    Ngân hàng nhận (Snapshot)
                  </TableHead>
                  <TableHead className="font-semibold">
                    Người yêu cầu / Ngày tạo
                  </TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold">
                    Mã giao dịch / Ghi chú Admin
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const clinicName =
                    item.clinicName || clinicMap.get(item.clinicId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {clinicName ||
                              `Phòng khám #${item.clinicId.slice(0, 8)}`}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {item.clinicId}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatVndString(item.amountVnd)}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.bankName} - {item.bankAccountNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          {item.bankAccountHolder}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div>User: #{item.requestedByUserId.slice(0, 6)}</div>
                        <div className="text-[10px]">
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.transferRef && (
                          <div className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            Ref: {item.transferRef}
                          </div>
                        )}
                        {item.staffNote && (
                          <div className="text-[11px] text-slate-600 italic dark:text-slate-400">
                            {`"${item.staffNote}"`}
                          </div>
                        )}
                        {!item.transferRef && !item.staffNote && (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === "REQUESTED" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setMarkPaidTarget(item);
                                setTransferRefInput("");
                                setNoteInput("");
                              }}
                              className="h-8 rounded-xl bg-emerald-700 px-3 text-[11px] font-bold text-white hover:bg-emerald-800"
                            >
                              Xác nhận Đã chuyển
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRejectTarget(item);
                                setNoteInput("");
                              }}
                              className="h-8 rounded-xl border-rose-200 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                            >
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Đã xong
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      {/* Mark Paid Modal */}
      <Dialog
        open={Boolean(markPaidTarget)}
        onOpenChange={(open) => !open && setMarkPaidTarget(null)}
      >
        <DialogContent className="w-full max-w-md rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Xác nhận Đã Chuyển tiền Ngân hàng
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cập nhật trạng thái yêu cầu sang <strong>PAID</strong>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleMarkPaidSubmit}
            className="flex flex-col gap-3 py-2 text-xs"
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Lưu ý quan trọng:
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                Vui lòng hoàn tất chuyển khoản tiền thực tế{" "}
                <strong>{formatVndString(markPaidTarget?.amountVnd)}</strong> từ
                tài khoản nền tảng đến tài khoản phòng khám{" "}
                <strong>
                  {markPaidTarget?.bankName} -{" "}
                  {markPaidTarget?.bankAccountNumber} (
                  {markPaidTarget?.bankAccountHolder})
                </strong>{" "}
                trước khi xác nhận.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">
                Mã giao dịch ngân hàng (Transfer Ref):
              </Label>
              <Input
                placeholder="VD: FT260813998..."
                value={transferRefInput}
                onChange={(e) => setTransferRefInput(e.target.value)}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">
                Ghi chú của Admin (Admin note):
              </Label>
              <Textarea
                placeholder="Ghi chú thêm về giao dịch chuyển khoản này..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="h-16 resize-none rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMarkPaidTarget(null)}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={markPaidMutation.isPending}
                className="rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
              >
                {markPaidMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Xác nhận Đã Chuyển"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="w-full max-w-md rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <XCircle className="h-5 w-5 text-rose-600" />
              Từ chối Yêu cầu Rút tiền
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Số tiền{" "}
              <strong>{formatVndString(rejectTarget?.amountVnd)}</strong> sẽ
              được hoàn trả lại ví phòng khám
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleRejectSubmit}
            className="flex flex-col gap-3 py-2 text-xs"
          >
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Lý do từ chối (Admin note):</Label>
              <Textarea
                placeholder="VD: Sai thông tin chủ tài khoản, ngân hàng không hỗ trợ..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="h-20 resize-none rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectTarget(null)}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={rejectMutation.isPending}
                className="rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Xác nhận Từ chối"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
