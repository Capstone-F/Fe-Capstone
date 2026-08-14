"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { paymentsApi } from "@/features/commerce/api/payments.api";
import { queryKeys } from "@/lib/query/keys";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { sanitizeRedirectPath } from "@/shared/utils/safe-redirect";
import { formatVnd } from "@/shared/utils/format";
import { useWallet } from "../hooks/useWallet";
import { toVnd, walletBalance } from "../lib/wallet-ledger";
import type { PaymentStatusValue } from "@/types/domain";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

type ViewState = "loading" | "processing" | "timedOut" | "succeeded" | "failed";

const STATE_CONTENT: Record<ViewState, { title: string; hint: string }> = {
  loading: {
    title: "Đang xác nhận giao dịch...",
    hint: "Vui lòng đợi trong giây lát.",
  },
  processing: {
    title: "Đang xử lý nạp tiền...",
    hint: "Hệ thống đang đối chiếu với cổng thanh toán.",
  },
  timedOut: {
    title: "Giao dịch đang được xử lý",
    hint: "Việc xác nhận mất nhiều thời gian hơn dự kiến. Số dư sẽ được cộng ngay khi cổng thanh toán xác nhận.",
  },
  succeeded: {
    title: "Nạp tiền thành công!",
    hint: "Số dư ví của bạn đã được cập nhật.",
  },
  failed: {
    title: "Nạp tiền không thành công",
    hint: "Ví của bạn chưa bị trừ hay cộng tiền. Bạn có thể thử lại.",
  },
};

function isPendingPaymentStatus(status: PaymentStatusValue | undefined) {
  return status === "PENDING" || status === "PROCESSING";
}

function StateIcon({ state }: { state: ViewState }) {
  if (state === "loading" || state === "processing") {
    return <Loader2 className="h-12 w-12 animate-spin text-slate-400" />;
  }
  if (state === "timedOut") {
    return <Clock className="text-warning h-12 w-12" />;
  }
  if (state === "succeeded") {
    return <CheckCircle2 className="text-success h-12 w-12" />;
  }
  return <XCircle className="text-destructive h-12 w-12" />;
}

function WalletCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const paymentId = searchParams.get("paymentId") ?? "";
  const returnStatus = searchParams.get("status");
  const nextParam = searchParams.get("next");
  // The gateway echoes the whole return URL back, so `next` is attacker-visible —
  // never navigate to it without sanitising.
  const nextPath = nextParam ? sanitizeRedirectPath(nextParam) : null;

  const timedOutRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.payment(paymentId),
    queryFn: async () => {
      const response = await paymentsApi.getPaymentStatus(paymentId);
      return {
        id: response.data.id,
        status: response.data.status as PaymentStatusValue,
        amountVnd: response.data.amountVnd,
      };
    },
    enabled: !!paymentId,
    refetchInterval: (query) => {
      if (timedOutRef.current) {
        return false;
      }
      return isPendingPaymentStatus(query.state.data?.status)
        ? POLL_INTERVAL_MS
        : false;
    },
  });

  useEffect(() => {
    if (!paymentId) return;
    const timer = setTimeout(() => {
      timedOutRef.current = true;
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [paymentId]);

  const succeeded = payment?.status === "PAID";
  const failed =
    !paymentId ||
    isError ||
    returnStatus === "invalid" ||
    payment?.status === "FAILED" ||
    payment?.status === "CANCELLED";

  // The balance only moves on the backend once the gateway confirms, so the cached
  // wallet is stale exactly until this point.
  const invalidatedRef = useRef(false);
  useEffect(() => {
    if (succeeded && !invalidatedRef.current) {
      invalidatedRef.current = true;
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    }
  }, [succeeded, queryClient]);

  // Came from checkout (or another flow that needs the topped-up balance): go back
  // there once the credit has landed.
  useEffect(() => {
    if (succeeded && nextPath) {
      router.replace(nextPath);
    }
  }, [succeeded, nextPath, router]);

  const { data: wallet } = useWallet();

  let viewState: ViewState;
  if (!!paymentId && isLoading) {
    viewState = "loading";
  } else if (failed) {
    viewState = "failed";
  } else if (succeeded) {
    viewState = "succeeded";
  } else if (isPendingPaymentStatus(payment?.status)) {
    viewState = timedOut ? "timedOut" : "processing";
  } else {
    viewState = "failed";
  }

  const content = STATE_CONTENT[viewState];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 py-8">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <StateIcon state={viewState} />
          <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
          <p className="text-muted-foreground text-sm">{content.hint}</p>

          {succeeded && payment && (
            <div className="mt-2 flex w-full max-w-xs flex-col gap-1 rounded-xl bg-slate-50 px-6 py-4 text-sm">
              <span className="text-slate-600">
                Đã nạp{" "}
                <strong className="text-slate-900">
                  {formatVnd(toVnd(payment.amountVnd))}
                </strong>
              </span>
              <span className="text-slate-600">
                Số dư hiện tại:{" "}
                <strong className="text-primary">
                  {formatVnd(walletBalance(wallet))}
                </strong>
              </span>
            </div>
          )}

          {succeeded && nextPath && (
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang quay lại trang trước...
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <Link href="/profile?tab=wallet">
              <Button size="sm" className="rounded-lg text-xs font-semibold">
                Về ví của tôi
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs font-semibold"
              >
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WalletCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse py-20 text-center font-medium text-slate-500">
          Đang xử lý kết quả nạp tiền...
        </div>
      }
    >
      <WalletCallbackContent />
    </Suspense>
  );
}
