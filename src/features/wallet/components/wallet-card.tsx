"use client";

import { useState } from "react";
import { Wallet as WalletIcon, PlusCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import { useWallet } from "../hooks/useWallet";
import { walletBalance } from "../lib/wallet-ledger";
import { WalletTopUpModal } from "./wallet-topup-modal";
import { WalletTransactionsList } from "./wallet-transactions-list";

/** Compact wallet summary — used in the wallet tab of the customer profile. */
export function WalletCard() {
  const { data: wallet, isLoading } = useWallet();
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  const isLocked = Boolean(wallet && !wallet.isActive);

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
                Đơn hàng · Tư vấn · Phác đồ
              </span>
            </div>
          </div>

          <Button
            size="sm"
            disabled={isLocked}
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
            {isLoading ? "---" : formatVnd(walletBalance(wallet))}
          </strong>
        </div>

        {isLocked && (
          <p className="mt-3 rounded-lg bg-amber-500/20 px-3 py-2 text-[11px] font-semibold text-amber-100">
            Ví đang tạm khoá. Vui lòng liên hệ hỗ trợ để mở lại.
          </p>
        )}
      </div>

      {/* Wallet ledger — money in and out of the wallet, not the order history. */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800">
          Lịch sử giao dịch ví
        </h4>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Toàn bộ dòng tiền vào và ra khỏi ví — nạp tiền, thanh toán và hoàn
          tiền.
        </p>
        <WalletTransactionsList />
      </div>

      {/* Top-up Modal */}
      <WalletTopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        returnTo="/profile?tab=wallet"
      />
    </div>
  );
}
