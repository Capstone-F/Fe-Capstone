"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Wallet as WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";
import { formatVnd } from "@/shared/utils/format";
import { useWalletTransactions } from "../hooks/useWallet";
import { toVnd } from "../lib/wallet-ledger";
import type { WalletTransactionType } from "../types/wallet.types";

const TYPE_LABELS: Record<WalletTransactionType, string> = {
  WALLET_TOPUP: "Nạp tiền vào ví",
  REFUND: "Hoàn tiền về ví",
  PRODUCT_PURCHASE: "Thanh toán đơn hàng",
  CONSULTATION_PAYMENT: "Thanh toán tư vấn chuyên gia",
  TREATMENT_PLAN_PAYMENT: "Thanh toán phác đồ điều trị",
};

const TYPE_ICONS: Record<WalletTransactionType, LucideIcon> = {
  WALLET_TOPUP: WalletIcon,
  REFUND: RefreshCw,
  PRODUCT_PURCHASE: ShoppingBag,
  CONSULTATION_PAYMENT: Stethoscope,
  TREATMENT_PLAN_PAYMENT: Sparkles,
};

interface WalletTransactionsListProps {
  /** Show only the newest N rows — used by the compact card in the profile tab. */
  limit?: number;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <Clock className="h-8 w-8 text-slate-300" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}

export function WalletTransactionsList({ limit }: WalletTransactionsListProps) {
  const { data: transactions, isLoading, error } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-5 w-5 text-slate-400" />
      </div>
    );
  }

  if (error) {
    return <EmptyState message="Không tải được lịch sử giao dịch." />;
  }

  if (!transactions || transactions.length === 0) {
    return <EmptyState message="Chưa có giao dịch nào trong ví." />;
  }

  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {rows.map((tx) => {
        const isIncoming = tx.direction === "CREDIT";
        const Icon = TYPE_ICONS[tx.type] ?? ArrowUpRight;
        return (
          <div key={tx.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  isIncoming
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  {TYPE_LABELS[tx.type] ?? "Giao dịch ví"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(tx.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-right">
              {isIncoming ? (
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              )}
              <div>
                <span
                  className={`text-xs font-bold ${
                    isIncoming ? "text-emerald-600" : "text-slate-800"
                  }`}
                >
                  {isIncoming ? "+" : "−"}
                  {formatVnd(toVnd(tx.amountVnd))}
                </span>
                {tx.status !== "COMPLETED" && (
                  <span className="block text-[9px] font-semibold text-amber-600 uppercase">
                    {tx.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
