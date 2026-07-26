"use client";

import { useState } from "react";
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useWallet, useWalletTransactions } from "../hooks/useWallet";
import { WalletTopUpModal } from "./wallet-topup-modal";
import { formatVnd } from "@/shared/utils/format";

export function WalletCard() {
  const { data: wallet, isLoading } = useWallet();
  const { data: transactions } = useWalletTransactions();
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-md">
              <WalletIcon className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <span className="block text-[11px] font-medium text-emerald-200/80">
                Ví GlowScan Cá Nhân
              </span>
              <span className="text-xs font-semibold text-white/90">
                Khám & Tư Vấn Chuyên Gia
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setTopUpModalOpen(true)}
            className="rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-xs hover:bg-emerald-400"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Nạp Tiền Ví
          </Button>
        </div>

        <div className="mt-6">
          <span className="block text-xs text-emerald-200/70">
            Số Dư Khả Dụng
          </span>
          <strong className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {isLoading ? "---" : formatVnd(wallet?.balanceVnd || 0)}
          </strong>
        </div>
      </div>

      {/* Transaction History List */}
      {transactions && transactions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800">
            Lịch sử giao dịch ví gần đây:
          </h4>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`rounded-lg p-2 ${
                      tx.type === "TOP_UP" || tx.type === "REFUND"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tx.type === "TOP_UP" || tx.type === "REFUND" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">
                      {tx.type === "TOP_UP"
                        ? "Nạp tiền vào ví"
                        : tx.type === "CONSULTATION_PAYMENT"
                          ? "Thanh toán ca hẹn tư vấn"
                          : tx.type === "REFUND"
                            ? "Hoàn tiền ca hẹn"
                            : "Giao dịch ví"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>

                <strong
                  className={`font-extrabold ${
                    tx.type === "TOP_UP" || tx.type === "REFUND"
                      ? "text-emerald-700"
                      : "text-slate-900"
                  }`}
                >
                  {tx.type === "TOP_UP" || tx.type === "REFUND" ? "+" : "-"}
                  {formatVnd(tx.amountVnd)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      <WalletTopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
      />
    </div>
  );
}
