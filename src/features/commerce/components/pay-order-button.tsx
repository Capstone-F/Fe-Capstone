"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { paymentsApi } from "@/features/commerce/api/payments.api";
import {
  isOrderNotPayable,
  toPaymentErrorMessage,
} from "@/features/commerce/lib/payment-errors";
import { Button } from "@/shared/components/ui/button";

const t = {
  pay: "Thanh toán",
  redirecting: "Đang chuyển tới PayOS...",
  failed: "Không thể thanh toán. Vui lòng thử lại.",
};

/**
 * Resumes payment for an order still waiting to be paid. The backend reuses the
 * order's existing pending payment, so pressing this twice never creates a second
 * one — only render it while the order is PENDING.
 */
export function PayOrderButton({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePay = async () => {
    setIsRedirecting(true);
    try {
      const response = await paymentsApi.startCheckout(orderId);
      window.location.assign(response.data.paymentUrl);
    } catch (error) {
      setIsRedirecting(false);
      toast.error(toPaymentErrorMessage(error, t.failed));
      // The order moved on elsewhere; refetch so the page stops offering to pay.
      if (isOrderNotPayable(error)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.order(orderId),
        });
      }
    }
  };

  return (
    <Button
      size="sm"
      disabled={isRedirecting}
      onClick={() => void handlePay()}
      className="rounded-lg text-xs font-semibold"
    >
      {isRedirecting ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          {t.redirecting}
        </>
      ) : (
        <>
          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
          {t.pay}
        </>
      )}
    </Button>
  );
}
