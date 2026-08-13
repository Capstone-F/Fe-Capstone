"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Building2,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Loader2,
  Save,
} from "lucide-react";
import {
  useClinicWallet,
  useUpdateBankAccount,
} from "../hooks/useClinicWallet";
import { formatVndString } from "@/shared/utils/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NetworkError } from "./error-states";

export function ClinicWalletView() {
  const {
    data: wallet,
    isLoading,
    isError,
    error,
    refetch,
  } = useClinicWallet();
  const updateBankMutation = useUpdateBankAccount();

  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
  });

  useEffect(() => {
    if (wallet) {
      queueMicrotask(() => {
        setBankForm({
          bankName: wallet.bankName || "",
          bankAccountNumber: wallet.bankAccountNumber || "",
          bankAccountHolder: wallet.bankAccountHolder || "",
        });
      });
    }
  }, [wallet]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải thông tin Ví phòng khám...
        </span>
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <NetworkError
        message={
          (error as Error)?.message || "Không thể tải thông tin ví phòng khám"
        }
        onRetry={() => refetch()}
      />
    );
  }

  const isBankConfigured = Boolean(
    wallet.bankName && wallet.bankAccountNumber && wallet.bankAccountHolder,
  );

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBankMutation.mutate(bankForm);
  };

  const isFormChanged =
    bankForm.bankName !== (wallet.bankName || "") ||
    bankForm.bankAccountNumber !== (wallet.bankAccountNumber || "") ||
    bankForm.bankAccountHolder !== (wallet.bankAccountHolder || "");

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Wallet className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Ví & Tài khoản Ngân hàng
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý số dư giải ngân, tiền đặt cọc Escrow và tài khoản nhận
              tiền rút
            </p>
          </div>
        </div>

        <Link href="/clinic/withdrawals">
          <Button
            disabled={!isBankConfigured}
            className="rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <Banknote className="mr-1.5 h-4 w-4" /> Yêu cầu Rút tiền
          </Button>
        </Link>
      </div>

      {!isBankConfigured && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Chú ý:</strong> Bạn cần cập nhật đầy đủ 3 thông tin Tài
            khoản ngân hàng bên dưới trước khi có thể thực hiện yêu cầu Rút
            tiền.
          </span>
        </div>
      )}

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
            {formatVndString(wallet.balanceVnd)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Có thể rút về tài khoản ngân hàng đã đăng ký
          </p>
        </Card>

        {/* Card 2: Held Escrow */}
        <Card className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs dark:border-purple-950/50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              Tiền tạm giữ (Escrow)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-extrabold text-purple-900 dark:text-purple-100">
            {formatVndString(wallet.heldEscrowVnd)}
          </p>
          <p className="mt-1 text-[11px] text-purple-700/80 dark:text-purple-400/80">
            Tiền chờ hoàn thành ca tư vấn / kích hoạt giai đoạn (chưa thể rút)
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
            {formatVndString(wallet.pendingWithdrawalsVnd)}
          </p>
          <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Đã trừ khỏi số dư khả dụng, chờ Admin xác nhận chuyển khoản
          </p>
        </Card>
      </div>

      {/* Bank Account Form Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Thông tin Tài khoản Ngân hàng Phòng khám
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Thông tin này sẽ được chốt (snapshot) tự động vào mỗi yêu cầu
                rút tiền để Admin thực hiện chuyển khoản thủ công
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form
            onSubmit={handleBankSubmit}
            className="flex max-w-xl flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="bankName"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Tên Ngân hàng *:
              </Label>
              <Input
                id="bankName"
                required
                placeholder="VD: Vietcombank, Techcombank, MB Bank..."
                value={bankForm.bankName}
                onChange={(e) =>
                  setBankForm({ ...bankForm, bankName: e.target.value })
                }
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="bankAccountNumber"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Số tài khoản *:
              </Label>
              <Input
                id="bankAccountNumber"
                required
                placeholder="VD: 0123456789"
                value={bankForm.bankAccountNumber}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    bankAccountNumber: e.target.value,
                  })
                }
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="bankAccountHolder"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Tên chủ tài khoản (Viết hoa không dấu) *:
              </Label>
              <Input
                id="bankAccountHolder"
                required
                placeholder="VD: PHONG KHAM GLOWSCAN QUAN 1"
                value={bankForm.bankAccountHolder}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    bankAccountHolder: e.target.value,
                  })
                }
                className="rounded-xl text-xs font-bold uppercase"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={updateBankMutation.isPending || !isFormChanged}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                {updateBankMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" /> Lưu thông tin Ngân hàng
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
