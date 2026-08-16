"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShoppingBag, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethod } from "@/types/domain";
import { queryKeys } from "@/lib/query/keys";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { walletBalance } from "@/features/wallet/lib/wallet-ledger";
import { WalletTopUpModal } from "@/features/wallet/components/wallet-topup-modal";
import { useCart } from "@/features/commerce/hooks/useCart";
import { useCreateOrder } from "@/features/commerce/hooks/useCheckout";
import { trackCommerceEvent } from "@/features/commerce/lib/commerce-analytics";
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
import {
  isInsufficientWalletBalance,
  toPaymentErrorMessage,
  toWalletPaymentErrorMessage,
} from "@/features/commerce/lib/payment-errors";
import { formatVnd } from "@/shared/utils/format";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { CartConflictAlert } from "@/features/commerce/components/cart-conflict-alert";
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
import {
  shippingAddressSchema,
  type ShippingAddressFormValues,
} from "@/features/commerce/schemas/commerce-forms.schema";

const ck = {
  title: "Thanh toán",
  loginRequiredTitle: "Vui lòng đăng nhập để thanh toán",
  loginRequiredHint: "Đơn hàng của bạn sẽ được lưu vào tài khoản cá nhân.",
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
    vnpay: "PayOS",
    vnpayHint: "Thanh toán qua ngân hàng/thẻ",
    wallet: "Ví GlowScan",
    walletLocked: "Ví đang tạm khoá. Vui lòng liên hệ hỗ trợ.",
    walletLoginRequired: "Đăng nhập để dùng số dư ví.",
    topUp: "Nạp tiền",
  },
  back: "Quay lại",
  next: "Tiếp tục",
  placeOrder: "Đặt hàng",
  notSelected: "Chưa chọn",
  errors: {
    address: "Vui lòng nhập đầy đủ và đúng thông tin nhận hàng.",
    placeOrder: "Không thể đặt hàng. Vui lòng thử lại.",
    walletPay: "Không thể thanh toán bằng ví. Vui lòng thử lại.",
  },
  emptyCartTitle: "Giỏ hàng đang trống",
  continueShopping: "Tiếp tục mua sắm",
};

const LAST_STEP = 3;

export function CheckoutPage() {
  const router = useRouter();
  const {
    data: cart,
    conflicts,
    source: cartSource,
    isLoading: isCartLoading,
  } = useCart();
  const createOrder = useCreateOrder();
  const session = useSession();

  const [step, setStep] = useState(0);
  const addressForm = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: emptyShippingAddressDraft(),
  });
  const draft = useWatch({
    control: addressForm.control,
  }) as ShippingAddressFormValues;
  const [payment, setPayment] = useState<PaymentMethod>("vnpay");
  const [isPlacing, setIsPlacing] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: wallet, refetch: refetchWallet } = useWallet({
    enabled: Boolean(session.data),
  });
  // POST /orders consumes the cart, so a payment that fails afterwards must reuse the
  // order it already created — creating a second one would find an empty cart.
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Null until every field is present and valid — this is what gates both the fee
  // preview and the place-order call.
  const address = useMemo(() => toShippingAddressInput(draft), [draft]);
  // Deliberately not debounced: the quote is keyed on district + ward alone, so typing
  // cannot refetch it. A debounce here only held the fee back behind the whole typing
  // session and showed the previous destination's price meanwhile.
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
  const shippingPlaceholder = feeQuote.isFetching
    ? ck.summary.feeCalculating
    : ck.summary.feeNeedsAddress;

  // The backend re-prices the order, so this is only what gates the wallet option in
  // the UI; the authoritative "enough balance?" check runs server-side.
  const orderTotal = summary?.total ?? 0;
  const balanceVnd = walletBalance(wallet);
  const walletLocked = Boolean(wallet && !wallet.isActive);
  const walletShortfall = Math.max(0, orderTotal - balanceVnd);
  const canPayWithWallet =
    Boolean(wallet) && !walletLocked && walletShortfall === 0;
  const walletHint = walletLocked ? (
    ck.payment.walletLocked
  ) : (
    <span>
      Số dư{" "}
      <span className="font-extrabold text-emerald-500 dark:text-emerald-400">
        {formatVnd(balanceVnd)}
      </span>
      {" · "}
      {walletShortfall > 0
        ? `Còn thiếu ${formatVnd(walletShortfall)}`
        : `Đơn hàng ${formatVnd(orderTotal)}`}
    </span>
  );

  // 1. Placing order / redirecting to VNPay state: Keep loading spinner, NEVER fallback to empty cart
  if (isPlacing || createOrder.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6">
        <CheckoutStepper current={2} />
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-12 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            <CreditCard className="absolute h-6 w-6 animate-pulse text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-6 font-bold text-slate-900 dark:text-slate-100">
            {payment === "wallet"
              ? "Đang thanh toán bằng Ví GlowScan..."
              : "Đang chuyển hướng đến cổng thanh toán PayOS..."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Vui lòng không tắt hoặc tải lại trang
          </p>
        </div>
      </div>
    );
  }

  // 2. Loading Spin Page state: Never show empty cart while fetching
  if (session.isLoading || isCartLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6">
        <CheckoutStepper current={0} />
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-12 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            <ShoppingBag className="absolute h-6 w-6 animate-pulse text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-6 font-semibold text-slate-900 dark:text-slate-100">
            Đang tải thông tin giỏ hàng & thanh toán...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

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
      trackCommerceEvent({
        eventType: "CHECKOUT_STARTED",
        source: cartSource,
      });
      // POST /orders locks the GHN fee and creates the Delivery the payment needs.
      const orderId =
        pendingOrderId ?? (await createOrder.mutateAsync(address)).id;
      setPendingOrderId(orderId);

      if (payment === "wallet") {
        const walletResponse = await paymentsApi.checkoutWithWallet(orderId);
        await queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
        // The wallet settles server-side, so there is nothing to poll — but the
        // confirmation screen is also what generates the routine for SURVEY orders,
        // so wallet payments go through it too.
        router.push(
          `/vnpay_return?paymentId=${walletResponse.data.paymentId}&status=success`,
        );
        return;
      }

      const checkoutResponse = await paymentsApi.startCheckout(orderId);
      window.location.assign(checkoutResponse.data.paymentUrl);
    } catch (error) {
      setIsPlacing(false);

      if (payment === "wallet") {
        void refetchWallet();
        toast.error(toWalletPaymentErrorMessage(error, ck.errors.walletPay));
        if (isInsufficientWalletBalance(error)) {
          setTopUpOpen(true);
        }
        return;
      }

      toast.error(toPaymentErrorMessage(error, ck.errors.placeOrder));
    }
  };

  const continueCheckout = async () => {
    if (step === 1) {
      const valid = await addressForm.trigger(undefined, { shouldFocus: true });
      if (!valid) return;
    }
    setStep((current) => current + 1);
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
                {/* Informational only — conflicts never block placing the order. */}
                <CartConflictAlert conflicts={conflicts} />
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
                <GhnAddressForm
                  control={addressForm.control}
                  setValue={addressForm.setValue}
                />
                {address && feeQuote.isFetching && (
                  <p className="text-muted-foreground min-h-4 text-xs">
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
                  onSelect={() => setPayment("vnpay")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title={ck.payment.vnpay}
                  hint={ck.payment.vnpayHint}
                />
                <div className="flex flex-col gap-2">
                  <PaymentOption
                    selected={payment === "wallet"}
                    disabled={!canPayWithWallet}
                    onSelect={() => setPayment("wallet")}
                    icon={<WalletIcon className="h-5 w-5" />}
                    title={ck.payment.wallet}
                    hint={walletHint}
                  />
                  {!walletLocked && walletShortfall > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTopUpOpen(true)}
                      className="self-end rounded-lg text-xs font-semibold"
                    >
                      {ck.payment.topUp}
                    </Button>
                  )}
                </div>
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
                <ConfirmRow
                  label={ck.steps.payment}
                  value={
                    payment === "wallet" ? ck.payment.wallet : ck.payment.vnpay
                  }
                />
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
                onClick={() => void continueCheckout()}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.next}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={
                  createOrder.isPending ||
                  isPlacing ||
                  (payment === "wallet" && !canPayWithWallet)
                }
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

      <WalletTopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        requiredAmountVnd={walletShortfall}
        // An order already exists once a payment attempt failed, and the cart is gone
        // with it — send the user to that order instead of an empty checkout.
        returnTo={pendingOrderId ? `/orders/${pendingOrderId}` : "/checkout"}
      />

      {isPlacing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            <p className="mt-4 font-bold text-slate-900 dark:text-slate-100">
              {payment === "wallet"
                ? "Đang thanh toán bằng Ví GlowScan..."
                : "Đang chuyển hướng đến cổng thanh toán PayOS..."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Vui lòng không tắt hoặc tải lại trang
            </p>
          </div>
        </div>
      )}
    </div>
  );
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
  onSelect,
}: {
  selected: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  hint: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled || !onSelect}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left",
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
    </button>
  );
}
