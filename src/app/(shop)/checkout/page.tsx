"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Truck, AlertTriangle } from "lucide-react";
import { PaymentMethod, Order, ShippingAddress } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { useCart } from "@/features/commerce/hooks/use-cart";
import { useCreateOrder } from "@/features/commerce/hooks/use-checkout";
import { checkoutVnpay } from "@/features/commerce/api/orders-client";
import { toast } from "sonner";
import { checkStock } from "@/features/commerce/lib/stock";
import { formatVnd } from "@/features/commerce/lib/format";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { CheckoutStepper } from "@/features/commerce/components/checkout-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ck = vi.commerce.checkout;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    line: "",
    city: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isVnpayRedirecting, setIsVnpayRedirecting] = useState(false);

  const lines = useMemo(() => cart?.lines ?? [], [cart]);
  const stockIssues = useMemo(() => checkStock(lines), [lines]);
  const addressValid =
    address.fullName.trim() !== "" &&
    address.phone.trim() !== "" &&
    address.line.trim() !== "" &&
    address.city.trim() !== "";

  // Success screen (step 4)
  if (placedOrder) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <CheckoutStepper current={4} />
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <CheckCircle2 className="text-success h-14 w-14" />
            <h2 className="text-xl font-bold text-slate-900">
              {ck.successTitle}
            </h2>
            <p className="text-muted-foreground text-sm">{ck.successHint}</p>
            <div className="mt-2 flex flex-col gap-1 rounded-xl bg-slate-50 px-6 py-4 text-sm">
              <span>
                {ck.orderCode}:{" "}
                <span className="font-bold">{placedOrder.id}</span>
              </span>
              <span>
                {ck.tracking}:{" "}
                <span className="font-bold">{placedOrder.trackingNumber}</span>{" "}
                ({placedOrder.carrier})
              </span>
              <span className="text-primary font-bold">
                {formatVnd(placedOrder.total)}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <Link href="/orders">
                <Button size="sm" className="rounded-lg text-xs font-semibold">
                  {ck.viewOrders}
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                >
                  {vi.commerce.cart.continueShopping}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <CheckoutStepper current={0} />
        <div className="text-muted-foreground rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-bold text-slate-700">
            {vi.commerce.cart.emptyTitle}
          </p>
          <Link href="/products">
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              {vi.commerce.cart.continueShopping}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    createOrder.mutate(
      { summary: cart, paymentMethod: payment, address },
      {
        onSuccess: async (order) => {
          if (payment === "vnpay") {
            // Redirect to VNPay gateway for real payment
            try {
              setIsVnpayRedirecting(true);
              const { paymentUrl } = await checkoutVnpay(order.id);
              window.location.href = paymentUrl;
            } catch {
              setIsVnpayRedirecting(false);
              toast.error(
                "Không thể kết nối cổng thanh toán VNPay. Vui lòng thử lại.",
              );
            }
          } else {
            // COD: show success screen directly
            setPlacedOrder(order);
          }
        },
      },
    );
  };

  const canProceed =
    step === 0 ||
    (step === 1 && addressValid) ||
    step === 2 ||
    (step === 3 && stockIssues.length === 0);

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
                {lines.map((line) => (
                  <div
                    key={line.product.id}
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
                  {ck.steps.address}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                <AddressField
                  label={ck.address.fullName}
                  value={address.fullName}
                  onChange={(v) => setAddress((a) => ({ ...a, fullName: v }))}
                />
                <AddressField
                  label={ck.address.phone}
                  value={address.phone}
                  onChange={(v) => setAddress((a) => ({ ...a, phone: v }))}
                />
                <div className="sm:col-span-2">
                  <AddressField
                    label={ck.address.line}
                    value={address.line}
                    onChange={(v) => setAddress((a) => ({ ...a, line: v }))}
                  />
                </div>
                <AddressField
                  label={ck.address.city}
                  value={address.city}
                  onChange={(v) => setAddress((a) => ({ ...a, city: v }))}
                />
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
                  selected={payment === "cod"}
                  onSelect={() => setPayment("cod")}
                  icon={<Truck className="h-5 w-5" />}
                  title={ck.payment.cod}
                  hint={ck.payment.codHint}
                />
                <PaymentOption
                  selected={payment === "vnpay"}
                  onSelect={() => setPayment("vnpay")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title={ck.payment.vnpay}
                  hint={ck.payment.vnpayHint}
                />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.steps.confirm}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 text-sm">
                {stockIssues.length > 0 && (
                  <div className="bg-destructive-soft border-destructive/20 flex flex-col gap-1 rounded-xl border p-3">
                    <div className="text-destructive flex items-center gap-2 text-sm font-bold">
                      <AlertTriangle className="h-4 w-4" />
                      {ck.stockIssueTitle}
                    </div>
                    <p className="text-xs text-slate-600">
                      {ck.stockIssueHint}
                    </p>
                    <ul className="list-inside list-disc text-xs text-slate-700">
                      {stockIssues.map((issue) => (
                        <li key={issue.productId}>{issue.name}</li>
                      ))}
                    </ul>
                    <Link
                      href="/cart"
                      className="text-primary mt-1 text-xs font-semibold"
                    >
                      → {vi.commerce.cart.title}
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700">
                    {ck.steps.address}
                  </span>
                  <span className="text-muted-foreground">
                    {address.fullName} · {address.phone} · {address.line},{" "}
                    {address.city}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700">
                    {ck.steps.payment}
                  </span>
                  <span className="text-muted-foreground">
                    {payment === "cod" ? ck.payment.cod : ck.payment.vnpay}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nav buttons */}
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
            {step < 3 ? (
              <Button
                size="sm"
                disabled={!canProceed}
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.next}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={
                  !canProceed || createOrder.isPending || isVnpayRedirecting
                }
                onClick={handlePlaceOrder}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.placeOrder}
              </Button>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-6">
            <OrderSummary summary={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
      />
    </div>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary-soft"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <span
        className={cn(
          "text-primary",
          selected ? "text-primary" : "text-slate-400",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </span>
    </button>
  );
}
