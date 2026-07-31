"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethod } from "@/types/domain";
import { ApiError } from "@/core/api/errors";
import { useCart } from "@/features/commerce/hooks/useCart";
import { useCreateOrder } from "@/features/commerce/hooks/useCheckout";
import {
  useDistricts,
  useProvinces,
  useShippingFeeQuote,
  useWards,
} from "@/features/commerce/hooks/useDelivery";
import { paymentsApi } from "@/features/commerce/api/payments.api";
import {
  emptyShippingAddressDraft,
  toShippingAddressInput,
} from "@/features/commerce/lib/shipping-address";
import { formatVnd } from "@/shared/utils/format";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { CheckoutStepper } from "@/features/commerce/components/checkout-stepper";
import { GhnAddressForm } from "@/features/commerce/components/ghn-address-form";
import { useSession } from "@/features/auth/hooks/useSession";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";

const ck = {
  title: "Thanh toán",
  loginRequiredTitle: "Vui lòng đăng nhập để đặt hàng",
  loginRequiredHint:
    "Bạn cần đăng nhập để tiếp tục thanh toán. Giỏ hàng của bạn sẽ được giữ lại.",
  loginCta: "Đăng nhập",
  steps: {
    review: "Xem lại giỏ",
    shipping: "Địa chỉ giao hàng",
    payment: "Thanh toán",
    confirm: "Xác nhận",
  },
  summary: {
    feeCalculating: "Đang tính...",
    feeNeedsAddress: "Theo địa chỉ nhận",
  },
  shipping: {
    heading: "Địa chỉ nhận hàng",
    carrierNote:
      "Đơn hàng được giao qua Giao Hàng Nhanh (GHN). Phí vận chuyển tính theo địa chỉ nhận.",
    feeLoading: "Đang tính phí vận chuyển...",
    feeUnavailable:
      "Chưa tính được phí vận chuyển. Phí chính thức sẽ được xác nhận khi đặt hàng.",
  },
  payment: {
    vnpay: "VnPay",
    vnpayHint: "Thanh toán qua thẻ/ngân hàng (sandbox).",
    cod: "COD — Thanh toán khi nhận hàng",
    codDisabledHint: "Backend chỉ hỗ trợ VNPay ở giai đoạn này.",
  },
  back: "Quay lại",
  next: "Tiếp tục",
  placeOrder: "Đặt hàng",
  notSelected: "Chưa chọn",
  errors: {
    address: "Vui lòng nhập đầy đủ và đúng thông tin nhận hàng.",
    emptyCart:
      "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.",
    carrier:
      "Không kết nối được đơn vị vận chuyển. Vui lòng thử lại sau ít phút.",
    placeOrder: "Không thể đặt hàng. Vui lòng thử lại.",
  },
  emptyCartTitle: "Giỏ hàng đang trống",
  continueShopping: "Tiếp tục mua sắm",
};

const LAST_STEP = 3;

export function CheckoutPage() {
  const router = useRouter();
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();
  const session = useSession();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(emptyShippingAddressDraft);
  const [payment] = useState<PaymentMethod>("vnpay");
  const [isPlacing, setIsPlacing] = useState(false);

  // Null until every field is present and valid — this is what gates both the fee
  // preview and the place-order call.
  const address = useMemo(() => toShippingAddressInput(draft), [draft]);
  const feeQuote = useShippingFeeQuote(address);

  // Shared cache with GhnAddressForm; used only to render names on the confirm step.
  const provinces = useProvinces();
  const districts = useDistricts(draft.provinceId);
  const wards = useWards(draft.districtId);

  const lines = cart?.lines ?? [];
  const shippingFee = feeQuote.data ?? 0;
  const summary = cart
    ? { ...cart, shippingFee, total: cart.subtotal + shippingFee }
    : cart;
  // A zero fee is not free shipping — GHN has simply not priced the address yet.
  const shippingPlaceholder = feeQuote.isLoading
    ? ck.summary.feeCalculating
    : ck.summary.feeNeedsAddress;

  if (!session.isLoading && !session.data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <CheckoutStepper current={0} />
        <div className="text-muted-foreground rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-bold text-slate-700">{ck.loginRequiredTitle}</p>
          <p className="mt-1 text-sm">{ck.loginRequiredHint}</p>
          <Button
            size="sm"
            className="mt-4 text-xs"
            onClick={() => router.push("/login?redirectTo=/checkout")}
          >
            {ck.loginCta}
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <CheckoutStepper current={0} />
        <div className="text-muted-foreground rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-bold text-slate-700">{ck.emptyCartTitle}</p>
          <Link href="/products">
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              {ck.continueShopping}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const provinceName =
    provinces.data?.find((p) => p.id === draft.provinceId)?.name ?? "";
  const districtName =
    districts.data?.find((d) => d.id === draft.districtId)?.name ?? "";
  const wardName =
    wards.data?.find((w) => w.code === draft.wardCode)?.name ?? "";
  const fullAddress = address
    ? `${address.recipientName} — ${address.recipientPhone} — ${address.streetAddress}, ${wardName}, ${districtName}, ${provinceName}`
    : ck.notSelected;

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error(ck.errors.address);
      return;
    }

    setIsPlacing(true);
    try {
      // POST /orders locks the GHN fee and creates the Delivery the payment needs.
      const order = await createOrder.mutateAsync(address);
      const checkoutResponse = await paymentsApi.startCheckout(order.id);
      window.location.assign(checkoutResponse.data.paymentUrl);
    } catch (error) {
      setIsPlacing(false);
      toast.error(toPlaceOrderMessage(error));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {ck.title}
      </h2>
      <CheckoutStepper current={step} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          {step === 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.steps.review}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                {cart.unresolvedVariantIds.length > 0 && (
                  <p className="bg-warning-soft text-warning rounded-xl px-3 py-2 text-xs">
                    {cart.unresolvedVariantIds.length}{" "}
                    {
                      "sản phẩm trong giỏ không tải được thông tin hiển thị (đã ẩn khỏi danh sách)."
                    }
                  </p>
                )}
                {lines.map((line) => (
                  <div
                    key={line.variant.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-700">
                      {line.product.name} × {line.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatVnd(line.lineTotal)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.shipping.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4">
                <p className="text-muted-foreground text-xs">
                  {ck.shipping.carrierNote}
                </p>
                <GhnAddressForm value={draft} onChange={setDraft} />
                {address && feeQuote.isLoading && (
                  <p className="text-muted-foreground text-xs">
                    {ck.shipping.feeLoading}
                  </p>
                )}
                {address && feeQuote.isError && (
                  <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">
                    {ck.shipping.feeUnavailable}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.steps.payment}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4">
                <PaymentOption
                  selected={payment === "vnpay"}
                  icon={<CreditCard className="h-5 w-5" />}
                  title={ck.payment.vnpay}
                  hint={ck.payment.vnpayHint}
                />
                <PaymentOption
                  selected={false}
                  disabled
                  icon={<Truck className="h-5 w-5" />}
                  title={ck.payment.cod}
                  hint={ck.payment.codDisabledHint}
                />
              </CardContent>
            </Card>
          )}

          {step === LAST_STEP && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.steps.confirm}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 text-sm">
                <ConfirmRow label={ck.shipping.heading} value={fullAddress} />
                <ConfirmRow
                  label={"Phí vận chuyển (GHN)"}
                  value={
                    feeQuote.isSuccess
                      ? formatVnd(feeQuote.data)
                      : ck.shipping.feeUnavailable
                  }
                />
                <ConfirmRow label={ck.steps.payment} value={ck.payment.vnpay} />
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                step === 0 ? router.push("/cart") : setStep((s) => s - 1)
              }
              className="rounded-lg text-xs"
            >
              {ck.back}
            </Button>
            {step < LAST_STEP ? (
              <Button
                size="sm"
                // The fee preview is not a gate — the order re-quotes server-side.
                disabled={step === 1 && address === null}
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.next}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={createOrder.isPending || isPlacing}
                onClick={() => void handlePlaceOrder()}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.placeOrder}
              </Button>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-6">
            {summary && (
              <OrderSummary
                summary={summary}
                shippingPlaceholder={
                  feeQuote.isSuccess ? undefined : shippingPlaceholder
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toPlaceOrderMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return ck.errors.placeOrder;
  }
  if (error.status === 400 && /cart is empty/i.test(error.message)) {
    return ck.errors.emptyCart;
  }
  if (error.status === 502) {
    return ck.errors.carrier;
  }
  return ck.errors.placeOrder;
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

function PaymentOption({
  selected,
  disabled,
  icon,
  title,
  hint,
}: {
  selected: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left",
        selected
          ? "border-primary bg-primary-soft"
          : "border-slate-200 bg-white",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className={selected ? "text-primary" : "text-slate-400"}>
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </span>
    </div>
  );
}
