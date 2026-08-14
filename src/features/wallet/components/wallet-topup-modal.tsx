"use client";

import { useState } from "react";
import { Wallet as WalletIcon, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { ApiError } from "@/core/api/errors";
import { useTopUpWallet } from "../hooks/useWallet";
import { formatVnd } from "@/shared/utils/format";
import { toast } from "sonner";

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmountVnd?: number;
  /** In-app path to land on after the gateway returns — defaults to the wallet page. */
  returnTo?: string;
}

/** Backend rejects anything below this (WalletTopUpDto @Min). */
const MIN_TOP_UP_VND = 10000;

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export function WalletTopUpModal({
  isOpen,
  onClose,
  requiredAmountVnd,
  returnTo,
}: WalletTopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(
    requiredAmountVnd && requiredAmountVnd > 0 ? requiredAmountVnd : 500000,
  );

  const topUpMutation = useTopUpWallet();

  const handleTopUp = () => {
    if (selectedAmount < MIN_TOP_UP_VND) {
      toast.error(`Số tiền nạp tối thiểu là ${formatVnd(MIN_TOP_UP_VND)}`);
      return;
    }

    // The gateway redirects back to this URL with ?paymentId&status appended; the
    // callback page confirms the payment and then forwards to `next`.
    const callbackUrl = new URL("/wallet/callback", window.location.origin);
    if (returnTo) {
      callbackUrl.searchParams.set("next", returnTo);
    }

    topUpMutation.mutate(
      {
        amountVnd: selectedAmount,
        client: "web",
        returnUrl: callbackUrl.toString(),
      },
      {
        onSuccess: (res) => {
          window.location.assign(res.paymentUrl);
        },
        onError: (err: unknown) => {
          const message =
            err instanceof ApiError
              ? err.message
              : "Không thể nạp tiền vào ví. Vui lòng thử lại.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <WalletIcon className="h-5 w-5 text-emerald-600" />
            Nạp Tiền Vào Ví GlowScan
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Nạp tiền vào ví cá nhân để thanh toán nhanh chóng cho đơn hàng, dịch
            vụ tư vấn chuyên gia và phác đồ điều trị.
          </DialogDescription>
        </DialogHeader>

        {requiredAmountVnd && requiredAmountVnd > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <span className="font-bold">⚠️ Số dư ví không đủ:</span> Số tiền
            thiếu tối thiểu để thanh toán là{" "}
            <strong>{formatVnd(requiredAmountVnd)}</strong>.
          </div>
        )}

        <div className="space-y-3 py-3">
          <span className="text-xs font-bold text-slate-700">
            Chọn mệnh giá nạp nhanh:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                  selectedAmount === amt
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {formatVnd(amt)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Bạn sẽ được chuyển sang cổng thanh toán để hoàn tất. Số dư cập nhật
            ngay khi giao dịch thành công.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={topUpMutation.isPending}
            onClick={handleTopUp}
            className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            {topUpMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Nạp {formatVnd(selectedAmount)} Ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
