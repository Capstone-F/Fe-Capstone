"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { paymentsApi } from "@/features/commerce/api/payments.api";
import {
  isInsufficientWalletBalance,
  toWalletPaymentErrorMessage,
} from "@/features/commerce/lib/payment-errors";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { walletBalance } from "@/features/wallet/lib/wallet-ledger";
import { WalletTopUpModal } from "@/features/wallet/components/wallet-topup-modal";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";

const t = {
  pay: "Trả bằng ví",
  topUp: "Nạp ví để trả",
  paying: "Đang trừ ví...",
  failed: "Không thể thanh toán bằng ví. Vui lòng thử lại.",
};

/**
 * Settles a still-PENDING order from the wallet. Unlike the gateway button there is no
 * redirect: a 200 means the order is already PAID, so this lands on the confirmation
 * screen — which is also what generates the routine for SURVEY orders.
 */
export function PayOrderWithWalletButton({
  orderId,
  totalVnd,
}: {
  orderId: string;
  totalVnd: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: wallet, refetch: refetchWallet } = useWallet();
  const [isPaying, setIsPaying] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const balanceVnd = walletBalance(wallet);
  const shortfall = Math.max(0, totalVnd - balanceVnd);
  const isLocked = Boolean(wallet && !wallet.isActive);

  const handlePay = async () => {
    setIsPaying(true);
    try {
      const response = await paymentsApi.checkoutWithWallet(orderId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.order(orderId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.ordersAll });
      router.push(
        `/vnpay_return?paymentId=${response.data.paymentId}&status=success`,
      );
    } catch (error) {
      setIsPaying(false);
      void refetchWallet();
      toast.error(toWalletPaymentErrorMessage(error, t.failed));
      if (isInsufficientWalletBalance(error)) {
        setTopUpOpen(true);
      }
    }
  };

  if (isLocked) {
    return null;
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={isPaying}
        onClick={() => (shortfall > 0 ? setTopUpOpen(true) : void handlePay())}
        className="rounded-lg text-xs font-semibold"
        title={
          shortfall > 0
            ? `Số dư ví còn thiếu ${formatVnd(shortfall)}`
            : `Số dư ví: ${formatVnd(balanceVnd)}`
        }
      >
        {isPaying ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            {t.paying}
          </>
        ) : (
          <>
            <WalletIcon className="mr-1.5 h-3.5 w-3.5" />
            {shortfall > 0 ? t.topUp : t.pay}
          </>
        )}
      </Button>

      <WalletTopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        requiredAmountVnd={shortfall}
        returnTo={`/orders/${orderId}`}
      />
    </>
  );
}
