"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethod, ShippingAddress } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { useCart } from "@/features/commerce/hooks/use-cart";
import { useCreateOrder } from "@/features/commerce/hooks/use-checkout";
import { startCheckout } from "@/features/commerce/api/payments-client";
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
  // Address is display-only — Be-Capstone has no column to send it to
  // (order.entity.ts). Fields render disabled; nothing here is submitted.
  const [address] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    line: "",
    city: "",
  });
  // COD is disabled — Be-Capstone's PaymentProvider enum has only VNPAY.
  const [payment] = useState<PaymentMethod>("vnpay");
  const [isVnpayRedirecting, setIsVnpayRedirecting] = useState(false);

  const lines = cart?.lines ?? [];

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
    createOrder.mutate(undefined, {
      onSuccess: async (order) => {
        try {
          setIsVnpayRedirecting(true);
          const { paymentUrl } = await startCheckout(order.id);
          window.location.href = paymentUrl;
        } catch {
          setIsVnpayRedirecting(false);
          toast.error(
            "Không thể kết nối cổng thanh toán VNPay. Vui lòng thử lại.",
          );
        }
      },
      onError: () => {
        toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
      },
    });
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
                    {vi.commerce.cart.unresolvedItemsNote}
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
                  {ck.steps.address}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">
                  {ck.address.unavailableNote}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AddressField
                    label={ck.address.fullName}
                    value={address.fullName}
                  />
                  <AddressField
                    label={ck.address.phone}
                    value={address.phone}
                  />
                  <div className="sm:col-span-2">
                    <AddressField
                      label={ck.address.line}
                      value={address.line}
                    />
                  </div>
                  <AddressField label={ck.address.city} value={address.city} />
                </div>
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

          {step === 3 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="text-base font-bold">
                  {ck.steps.confirm}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700">
                    {ck.steps.address}
                  </span>
                  <span className="text-muted-foreground">
                    {ck.address.unavailableNote}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700">
                    {ck.steps.payment}
                  </span>
                  <span className="text-muted-foreground">
                    {ck.payment.vnpay}
                  </span>
                </div>
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
            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg text-xs font-semibold"
              >
                {ck.next}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={createOrder.isPending || isVnpayRedirecting}
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

function AddressField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      <Input value={value} disabled placeholder="—" className="text-sm" />
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
