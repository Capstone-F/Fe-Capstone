"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";
import { useWalletTransactions } from "../hooks/useWallet";
import formatCurrency from "@/shared/utils/currency";
import type { WalletTransactionType } from "../types/wallet.types";
import { Spinner } from "@/shared/components/ui/spinner";

function getTransactionBadge(type: WalletTransactionType) {
  switch (type) {
    case "TOP_UP":
      return {
        label: "Nạp tiền vào ví",
        icon: ArrowDownLeft,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        isPositive: true,
      };
    case "REFUND":
      return {
        label: "Hoàn tiền",
        icon: RefreshCw,
        color: "text-blue-600 bg-blue-50 border-blue-200",
        isPositive: true,
      };
    case "CONSULTATION_PAYMENT":
      return {
        label: "Thanh toán tư vấn Bác sĩ",
        icon: Stethoscope,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        isPositive: false,
      };
    case "PRODUCT_PURCHASE":
      return {
        label: "Thanh toán mua hàng",
        icon: ShoppingBag,
        color: "text-purple-600 bg-purple-50 border-purple-200",
        isPositive: false,
      };
    default:
      return {
        label: "Giao dịch ví",
        icon: ArrowUpRight,
        color: "text-slate-600 bg-slate-50 border-slate-200",
        isPositive: false,
      };
  }
}

export function WalletTransactionsList() {
  const { data: transactions, isLoading, error } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-5 w-5 text-slate-400" />
      </div>
    );
  }

  if (error || !transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Clock className="h-8 w-8 text-slate-300" />
        <p className="text-xs font-medium text-slate-500">
          Chưa có lịch sử giao dịch nào
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {transactions.map((tx) => {
        const info = getTransactionBadge(tx.type);
        const Icon = info.icon;
        return (
          <div key={tx.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${info.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  {info.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(tx.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold ${
                  info.isPositive ? "text-emerald-600" : "text-slate-800"
                }`}
              >
                {info.isPositive ? "+" : "-"}
                {formatCurrency(Math.abs(tx.amountVnd))}
              </span>
              <span className="block text-[9px] font-semibold text-slate-400 uppercase">
                {tx.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
