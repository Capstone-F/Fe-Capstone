"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { queryKeys } from "@/lib/query/keys";
import { paymentsApi } from "@/features/commerce/api/payments.api";
import { useOrder } from "@/features/commerce/hooks/useOrders";
import {
  useGenerateRoutine,
  useRoutines,
} from "@/features/profile/hooks/useRoutines";
import { formatVnd } from "@/shared/utils/format";
import { CheckoutStepper } from "@/features/commerce/components/checkout-stepper";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { PaymentStatusValue } from "@/types/domain";

const ck = {
  title: "Thanh toán",
  loginRequiredTitle: "Vui lòng đăng nhập để đặt hàng",
  loginRequiredHint:
    "Bạn cần đăng nhập để tiếp tục thanh toán. Giỏ hàng của bạn sẽ được giữ lại.",
  loginCta: "Đăng nhập",
  steps: {
    review: "Xem lại giỏ",
    shipping: "Giao hàng",
    payment: "Thanh toán",
    confirm: "Xác nhận",
    done: "Hoàn tất",
  },
  payment: {
    vnpay: "PayOS",
    vnpayHint: "Thanh toán qua ngân hàng/thẻ",
  },
  back: "Quay lại",
  next: "Tiếp tục",
  placeOrder: "Đặt hàng",
  notSelected: "Chưa chọn",
  errors: {
    address: "Vui lòng nhập đầy đủ thông tin nhận hàng.",
    delivery: "Vui lòng chọn phương thức giao hàng.",
    placeOrder: "Không thể đặt hàng. Vui lòng thử lại.",
  },
  successTitle: "Đặt hàng thành công!",
  successHint: "Cảm ơn bạn. Đơn hàng của bạn đang được xử lý.",
  loadingTitle: "Đang xác nhận thanh toán...",
  processingTitle: "Đang xử lý thanh toán...",
  processingHint:
    "Vui lòng đợi trong giây lát, hệ thống đang xác nhận với PayOS.",
  timeoutTitle: "Thanh toán đang được xử lý",
  timeoutHint:
    "Quá trình xác nhận đang mất nhiều thời gian hơn dự kiến. Vui lòng kiểm tra lại đơn hàng của bạn sau ít phút.",
  failedTitle: "Thanh toán không thành công",
  failedHint: "Đơn hàng chưa được thanh toán. Bạn có thể thử lại từ giỏ hàng.",
  orderCode: "Mã đơn hàng",
  viewOrderDetail: "Xem chi tiết đơn hàng",
};

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

  const timedOutRef = useRef(false);

  const {
    data: payment,
    isLoading: paymentLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.payment(paymentId),
    queryFn: async () => {
      const response = await paymentsApi.getPaymentStatus(paymentId);
      return {
        id: response.data.id,
        orderId: response.data.orderId,
        status: response.data.status as PaymentStatusValue,
        provider: response.data.provider,
        amountVnd: response.data.amountVnd,
        paidAt: response.data.paidAt,
      };
    },
    enabled: !!paymentId,
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

  // Must go through useOrder: an ad-hoc query would cache a narrower object under
  // the same key, and /orders/[id] reads that entry expecting a full Order.
  const { order } = useOrder(payment?.orderId ?? "");

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
    viewState = "failed";
  }

  // A paid order changes how much product the user owns, and the backend recomputes the
  // Today stock warning from PAID+ orders. Drop the cached Today session so the low-stock
  // badge clears or softens on the next visit to /care.
  const queryClient = useQueryClient();
  const invalidatedRef = useRef(false);
  useEffect(() => {
    if (succeeded && !invalidatedRef.current) {
      invalidatedRef.current = true;
      void queryClient.invalidateQueries({ queryKey: queryKeys.routines });
    }
  }, [succeeded, queryClient]);

  // A paid SURVEY order is the only trigger for POST /routines/generate. Check
  // sourceOrderId first because the backend intentionally allows regeneration.
  const isSurveyOrder = succeeded && order?.source === "SURVEY";
  const generateRoutine = useGenerateRoutine();
  const routinesQuery = useRoutines(isSurveyOrder);
  const generateMutate = generateRoutine.mutate;
  const generatedRef = useRef(false);
  const existingRoutine = routinesQuery.data?.find(
    (routine) => routine.sourceOrderId === order?.id,
  );
  const routineReady = Boolean(existingRoutine || generateRoutine.data);

  useEffect(() => {
    if (
      isSurveyOrder &&
      order?.id &&
      routinesQuery.isSuccess &&
      !existingRoutine &&
      !generatedRef.current
    ) {
      generatedRef.current = true;
      generateMutate(order.id);
    }
  }, [
    isSurveyOrder,
    order?.id,
    routinesQuery.isSuccess,
    existingRoutine,
    generateMutate,
  ]);

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
              <span>Giao dịch đã được đối chiếu với đơn hàng của bạn.</span>
              <span className="text-primary font-bold">
                {formatVnd(order.totalVnd)}
              </span>
            </div>
          )}
          {isSurveyOrder && (
            <div className="mt-2 w-full max-w-md">
              {(routinesQuery.isLoading || generateRoutine.isPending) &&
                !routineReady && (
                  <p className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang tạo lộ trình chăm sóc từ đơn hàng...
                  </p>
                )}
              {routinesQuery.isError && !routineReady && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <span>
                    Chưa kiểm tra được lộ trình của đơn hàng. Hãy tải lại trước
                    khi tạo để tránh bị trùng.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs font-semibold"
                    onClick={() => void routinesQuery.refetch()}
                  >
                    Kiểm tra lại lộ trình
                  </Button>
                </div>
              )}
              {generateRoutine.isError && !routineReady && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <span>
                    Chưa tạo được lộ trình chăm sóc cho đơn này. Đơn hàng của
                    bạn vẫn được thanh toán thành công.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs font-semibold"
                    onClick={() => {
                      if (!order) return;
                      generatedRef.current = true;
                      generateMutate(order.id);
                    }}
                  >
                    Thử tạo lại lộ trình
                  </Button>
                </div>
              )}
              {routineReady && (
                <p className="text-xs font-semibold text-emerald-700">
                  Đã tạo lộ trình chăm sóc hằng ngày cho bạn.
                </p>
              )}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            {isSurveyOrder && routineReady && (
              <Link href="/care">
                <Button size="sm" className="rounded-lg text-xs font-semibold">
                  {"Xem lộ trình chăm sóc"}
                </Button>
              </Link>
            )}
            {succeeded && order && (
              <Link href={`/orders/${order.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs font-semibold"
                >
                  {ck.viewOrderDetail}
                </Button>
              </Link>
            )}
            <Link href="/products">
              <Button
                size="sm"
                variant={isSurveyOrder && routineReady ? "outline" : "default"}
                className="rounded-lg text-xs font-semibold"
              >
                {"Tiếp tục mua sắm"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VnpayReturnPage() {
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
