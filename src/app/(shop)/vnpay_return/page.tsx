"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { queryKeys } from "@/lib/query/keys";
import { getPaymentStatus } from "@/features/commerce/api/payments-client";
import { getOrder } from "@/features/commerce/api/orders-client";
import { formatVnd } from "@/features/commerce/lib/format";
import { CheckoutStepper } from "@/features/commerce/components/checkout-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentStatusValue } from "@/types/domain";

const ck = vi.commerce.checkout;

/** VNPay's IPN webhook confirms payment asynchronously, so PENDING/PROCESSING is not final yet. */
function isPendingPaymentStatus(
  status: PaymentStatusValue | undefined,
): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

type ViewState = "loading" | "processing" | "timedOut" | "succeeded" | "failed";

const STATE_CONTENT: Record<ViewState, { title: string; hint?: string }> = {
  loading: { title: ck.loadingTitle },
  processing: { title: ck.processingTitle, hint: ck.processingHint },
  timedOut: { title: ck.timeoutTitle, hint: ck.timeoutHint },
  succeeded: { title: ck.successTitle, hint: ck.successHint },
  failed: { title: ck.failedTitle, hint: ck.failedHint },
};

function StateIcon({ state }: { state: ViewState }) {
  if (state === "loading" || state === "processing") {
    return <Loader2 className="h-14 w-14 animate-spin text-slate-400" />;
  }
  if (state === "timedOut") {
    return <Clock className="text-warning h-14 w-14" />;
  }
  if (state === "succeeded") {
    return <CheckCircle2 className="text-success h-14 w-14" />;
  }
  return <XCircle className="text-destructive h-14 w-14" />;
}

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? "";
  const returnStatus = searchParams.get("status");

  // Mirrors `timedOut` state so `refetchInterval` (evaluated by the query client's
  // internal scheduler, not by React render) can read it synchronously.
  const timedOutRef = useRef(false);

  const {
    data: payment,
    isLoading: paymentLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.payment(paymentId),
    queryFn: () => getPaymentStatus(paymentId),
    enabled: !!paymentId,
    // TanStack Query v5 single-argument callback form: `query`, not `(data, query)`.
    // The BE's redirect can land before VNPay's IPN webhook flips the payment to a
    // terminal status, so keep polling while it's still PENDING/PROCESSING and stop
    // as soon as it resolves (or the bounded 30s timeout below cuts polling off).
    // `refetchInterval` runs outside React's render cycle, so it can't see `timedOut`
    // state directly — read the ref that's mirrored alongside it instead.
    refetchInterval: (query) => {
      if (timedOutRef.current) {
        return false;
      }
      if (isPendingPaymentStatus(query.state.data?.status)) {
        return POLL_INTERVAL_MS;
      }
      return false;
    },
  });

  const { data: order } = useQuery({
    queryKey: queryKeys.order(payment?.orderId ?? ""),
    queryFn: () => getOrder(payment!.orderId),
    enabled: !!payment?.orderId,
  });

  // Bounded 30s window: if the IPN webhook still hasn't landed by then, stop treating
  // this as "processing" and surface a distinct (non-failure, non-success) timeout state.
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!paymentId) return;
    timeoutRef.current = setTimeout(() => {
      timedOutRef.current = true;
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [paymentId]);

  const isLoading = !!paymentId && paymentLoading;
  const failed =
    !paymentId ||
    isError ||
    returnStatus === "invalid" ||
    payment?.status === "FAILED" ||
    payment?.status === "CANCELLED";
  const succeeded = payment?.status === "PAID";
  const pending = isPendingPaymentStatus(payment?.status);

  let viewState: ViewState;
  if (isLoading) {
    viewState = "loading";
  } else if (failed) {
    viewState = "failed";
  } else if (succeeded) {
    viewState = "succeeded";
  } else if (pending) {
    viewState = timedOut ? "timedOut" : "processing";
  } else {
    // Unknown/unexpected status — treat as a failure rather than silently hanging.
    viewState = "failed";
  }

  const content = STATE_CONTENT[viewState];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <CheckoutStepper current={4} />
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <StateIcon state={viewState} />
          <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
          {content.hint && (
            <p className="text-muted-foreground text-sm">{content.hint}</p>
          )}
          {order && (
            <div className="mt-2 flex flex-col gap-1 rounded-xl bg-slate-50 px-6 py-4 text-sm">
              <span>
                {ck.orderCode}: <span className="font-bold">{order.id}</span>
              </span>
              <span className="text-primary font-bold">
                {formatVnd(order.totalVnd)}
              </span>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Link href="/products">
              <Button size="sm" className="rounded-lg text-xs font-semibold">
                {vi.commerce.cart.continueShopping}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <CheckoutStepper current={4} />
          <Skeleton className="h-64 w-full rounded-xl bg-slate-300" />
        </div>
      }
    >
      <VnpayReturnContent />
    </Suspense>
  );
}
