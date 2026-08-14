"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  PlusCircle,
  Building2,
  HelpCircle,
  Lock,
  Info,
} from "lucide-react";
import { useClinicWallet } from "../hooks/useClinicWallet";
import {
  useMyWithdrawals,
  useRequestWithdrawal,
} from "../hooks/useMyWithdrawals";
import { formatVndString, formatVnd } from "@/shared/utils/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { NetworkError } from "./error-states";

export function ClinicWithdrawalsView() {
  const { data: wallet, isLoading: isWalletLoading } = useClinicWallet();
  const [page, setPage] = useState(1);
  const {
    data: withdrawalsData,
    isLoading: isListLoading,
    isError,
    error,
    refetch,
  } = useMyWithdrawals({
    page,
    limit: 10,
  });

  const requestMutation = useRequestWithdrawal();
  const [amountInput, setAmountInput] = useState<string>("");

  const isBankConfigured = Boolean(
    wallet?.bankName && wallet?.bankAccountNumber && wallet?.bankAccountHolder,
  );

  const balanceNumber = Number(wallet?.balanceVnd || "0");
  const heldEscrowNumber = Number(wallet?.heldEscrowVnd || "0");
  const amountNumber = Number(amountInput || "0");

  let validationError: string | null = null;
  if (!isBankConfigured) {
    validationError =
      "Bạn cần thiết lập thông tin Tài khoản ngân hàng trước khi rút tiền.";
  } else if (amountInput !== "" && (isNaN(amountNumber) || amountNumber <= 0)) {
    validationError = "Số tiền rút phải lớn hơn 0 ₫.";
  } else if (amountNumber > balanceNumber) {
    validationError = `Số tiền rút vượt quá số dư khả dụng (${formatVndString(wallet?.balanceVnd)}). Tiền tạm giữ Escrow (${formatVndString(wallet?.heldEscrowVnd)}) chưa thể rút cho đến khi hoàn thành dịch vụ.`;
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || amountNumber <= 0) return;
    requestMutation.mutate(amountNumber, {
      onSuccess: () => {
        setAmountInput("");
      },
    });
  };

  const handleSetMaxAmount = () => {
    if (balanceNumber > 0) {
      setAmountInput(balanceNumber.toString());
    }
  };

  if (isWalletLoading || (isListLoading && page === 1)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải lịch sử Rút tiền...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <NetworkError
        message={(error as Error)?.message || "Không thể tải lịch sử rút tiền"}
        onRetry={() => refetch()}
      />
    );
  }

  const items = withdrawalsData?.items || [];
  const totalPages = Math.ceil((withdrawalsData?.total || 0) / 10) || 1;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <Clock className="mr-1 h-3 w-3 text-amber-600" /> Đang chờ duyệt
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          >
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" /> Đã chuyển
            tiền
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
          >
            <XCircle className="mr-1 h-3 w-3 text-rose-600" /> Đã từ chối (Hoàn
            ví)
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Banknote className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Yêu cầu Rút tiền & Lịch sử
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gửi yêu cầu rút số dư khả dụng về ngân hàng phòng khám & theo dõi
              tiến độ duyệt
            </p>
          </div>
        </div>

        <Link href="/clinic/wallet">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" /> Quản lý Ví & Ngân hàng
          </Button>
        </Link>
      </div>

      {/* Wallet Balance Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Available Balance */}
        <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-950/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Số dư khả dụng
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
            {formatVndString(wallet?.balanceVnd)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Số tiền có thể rút về tài khoản ngay bây giờ
          </p>
        </Card>

        {/* Card 2: Held Escrow */}
        <Card className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs dark:border-purple-950/50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              Tạm giữ Escrow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-extrabold text-purple-900 dark:text-purple-100">
            {formatVndString(wallet?.heldEscrowVnd)}
          </p>
          <p className="mt-1 text-[11px] text-purple-700/80 dark:text-purple-400/80">
            Tiền cọc ca tư vấn/giai đoạn (tự động cộng vào khả dụng sau khi hoàn
            thành)
          </p>
        </Card>

        {/* Card 3: Pending Withdrawals */}
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs dark:border-amber-950/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Đang chờ duyệt rút
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-extrabold text-amber-900 dark:text-amber-100">
            {formatVndString(wallet?.pendingWithdrawalsVnd)}
          </p>
          <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Đã trừ khỏi số dư khả dụng, chờ Admin chuyển khoản
          </p>
        </Card>
      </div>

      {/* Grid: Request Form Card + Bank Snapshot Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Request Form */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 p-6 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tạo Yêu cầu Rút tiền Mới
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Số dư khả dụng:</span>
                <span className="font-mono font-bold">
                  {formatVndString(wallet?.balanceVnd)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300">
                <Lock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Tạm giữ Escrow:</span>
                <span className="font-mono font-bold">
                  {formatVndString(wallet?.heldEscrowVnd)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form
              onSubmit={handleRequestSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="amountVnd"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Số tiền muốn rút (VNĐ) *:
                  </Label>
                  {balanceNumber > 0 && (
                    <button
                      type="button"
                      onClick={handleSetMaxAmount}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      Rút tối đa ({formatVndString(wallet?.balanceVnd)})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="amountVnd"
                    type="number"
                    min={1}
                    max={balanceNumber > 0 ? balanceNumber : undefined}
                    required
                    placeholder="VD: 500000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="rounded-xl pr-12 font-mono text-sm"
                  />
                  <div className="absolute top-2.5 right-3 text-xs font-bold text-slate-400">
                    ₫
                  </div>
                </div>
                {amountInput && !isNaN(amountNumber) && amountNumber > 0 && (
                  <span className="text-[11px] font-medium text-slate-500">
                    Bằng chữ / định dạng:{" "}
                    <strong>{formatVnd(amountNumber)}</strong>
                  </span>
                )}
              </div>

              {heldEscrowNumber > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-purple-100 bg-purple-50/60 p-3 text-xs text-purple-800 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span>
                    Bạn đang có{" "}
                    <strong>{formatVndString(wallet?.heldEscrowVnd)}</strong>{" "}
                    tiền tạm giữ (Escrow). Khoản tiền này sẽ được tự động mở
                    khóa và cộng vào <strong>Số dư khả dụng</strong> ngay sau
                    khi hoàn thành các ca tư vấn hoặc dịch vụ.
                  </span>
                </div>
              )}

              {validationError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                  <span>Số tiền rút sẽ bị khóa (REQUESTED) ngay khi tạo.</span>
                </div>

                <Button
                  type="submit"
                  disabled={
                    requestMutation.isPending ||
                    Boolean(validationError) ||
                    amountNumber <= 0 ||
                    balanceNumber <= 0
                  }
                  className="rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  {requestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="mr-1.5 h-4 w-4" /> Gửi Yêu cầu Rút
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bank Snapshot Info Card */}
        <Card className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <Building2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tài khoản Nhận tiền
            </h3>
          </div>

          {isBankConfigured ? (
            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <span className="text-slate-500">Ngân hàng:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {wallet?.bankName}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Số tài khoản:</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {wallet?.bankAccountNumber}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Chủ tài khoản:</span>
                <p className="font-bold text-slate-900 uppercase dark:text-slate-100">
                  {wallet?.bankAccountHolder}
                </p>
              </div>
              <Link href="/clinic/wallet" className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                >
                  Thay đổi Ngân hàng
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center gap-3 text-center text-xs">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <p className="text-slate-600 dark:text-slate-400">
                Chưa có thông tin ngân hàng! Vui lòng cập nhật tài khoản trước
                khi rút.
              </p>
              <Link href="/clinic/wallet">
                <Button size="sm" className="rounded-xl text-xs font-bold">
                  Thiết lập Ngân hàng
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* History Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Lịch sử Yêu cầu Rút tiền
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
              <Clock className="mb-2 h-8 w-8 text-slate-300" />
              Chưa có yêu cầu rút tiền nào được tạo.
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-semibold">Mã yêu cầu</TableHead>
                  <TableHead className="font-semibold">Số tiền</TableHead>
                  <TableHead className="font-semibold">
                    Ngân hàng nhận
                  </TableHead>
                  <TableHead className="font-semibold">Ngày tạo</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold">
                    Mã giao dịch / Ghi chú Admin
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{item.id.slice(0, 8).toUpperCase()}
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
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Common Pagination */}
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={withdrawalsData?.total || 0}
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
