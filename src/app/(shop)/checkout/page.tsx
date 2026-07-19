"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { DeliveryOption, PaymentMethod, ShippingAddress } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { useCart } from "@/features/commerce/hooks/use-cart";
import { useCreateOrder } from "@/features/commerce/hooks/use-checkout";
import { useDeliveryOptions } from "@/features/commerce/hooks/use-delivery";
import { attachDelivery } from "@/features/commerce/api/delivery-client";
import { startCheckout } from "@/features/commerce/api/payments-client";
import { formatVnd } from "@/features/commerce/lib/format";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { CheckoutStepper } from "@/features/commerce/components/checkout-stepper";
import { useSession } from "@/features/auth/hooks/use-session";
import { startLogin } from "@/features/auth/api/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ck = vi.commerce.checkout;

/** Stable identity for a delivery option (a provider can offer several types). */
function optionKey(option: DeliveryOption): string {
  return `${option.providerId}:${option.type}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();
  const deliveryOptions = useDeliveryOptions();
  const session = useSession();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    line: "",
    city: "",
  });
  const [selectedDeliveryKey, setSelectedDeliveryKey] = useState<string | null>(
    null,
  );
  // COD is disabled — Be-Capstone's PaymentProvider enum has only VNPAY.
  const [payment] = useState<PaymentMethod>("vnpay");
  const [isPlacing, setIsPlacing] = useState(false);

  const lines = cart?.lines ?? [];
  const options = deliveryOptions.data ?? [];
  const selectedOption =
    options.find((o) => optionKey(o) === selectedDeliveryKey) ?? null;

  const isAddressValid =
    address.fullName.trim() !== "" &&
    address.phone.trim() !== "" &&
    address.line.trim() !== "" &&
    address.city.trim() !== "";
  const isShippingValid = isAddressValid && selectedOption !== null;

  // Summary reflects the chosen shipping fee (the cart's own fee heuristic is
  // replaced by the real fee from the selected delivery option).
  const summary =
    cart && selectedOption
      ? {
          ...cart,
          shippingFee: selectedOption.feeVnd,
          total: cart.subtotal + selectedOption.feeVnd,
        }
      : cart;

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
            onClick={() => void startLogin({ redirectTo: "/checkout" })}
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

  const handlePlaceOrder = async () => {
    if (!isAddressValid) {
      toast.error(ck.errors.address);
      return;
    }
    if (!selectedOption) {
      toast.error(ck.errors.delivery);
      return;
    }
    // Recipient details are folded into the single shippingAddress string the
    // Delivery row stores (Order itself has no address column).
    const shippingAddress = `${address.fullName} — ${address.phone} — ${address.line}, ${address.city}`;

    setIsPlacing(true);
    try {
      const order = await createOrder.mutateAsync();
      // BE requires a shipping selection before checkout — attach it first,
      // otherwise POST /payments/checkout returns 400 and VNPay never opens.
      await attachDelivery(order.id, {
        providerId: selectedOption.providerId,
        type: selectedOption.type,
        shippingAddress,
      });
      const { paymentUrl } = await startCheckout(order.id);
      window.location.assign(paymentUrl);
    } catch {
      setIsPlacing(false);
      toast.error(ck.errors.placeOrder);
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
                  {ck.address.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                  <span className="text-sm font-bold text-slate-900">
                    {ck.delivery.heading}
                  </span>
                  {deliveryOptions.isLoading ? (
                    <p className="text-muted-foreground text-sm">
                      {ck.delivery.loading}
                    </p>
                  ) : options.length === 0 ? (
                    <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">
                      {ck.delivery.empty}
                    </p>
                  ) : (
                    options.map((option) => (
                      <DeliveryMethodOption
                        key={optionKey(option)}
                        option={option}
                        selected={optionKey(option) === selectedDeliveryKey}
                        onSelect={() =>
                          setSelectedDeliveryKey(optionKey(option))
                        }
                      />
                    ))
                  )}
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
                <ConfirmRow
                  label={ck.address.heading}
                  value={`${address.fullName} — ${address.phone} — ${address.line}, ${address.city}`}
                />
                <ConfirmRow
                  label={ck.delivery.heading}
                  value={
                    selectedOption
                      ? `${selectedOption.providerName} · ${ck.delivery.types[selectedOption.type]} · ${formatVnd(selectedOption.feeVnd)}`
                      : ck.notSelected
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
            {step < 3 ? (
              <Button
                size="sm"
                disabled={step === 1 && !isShippingValid}
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
            {summary && <OrderSummary summary={summary} />}
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
        placeholder="—"
        className="text-sm"
      />
    </div>
  );
}

function DeliveryMethodOption({
  option,
  selected,
  onSelect,
}: {
  option: DeliveryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary-soft"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm font-bold text-slate-900">
          {ck.delivery.types[option.type]}
        </span>
        <span className="text-muted-foreground text-xs">
          {option.providerName}
        </span>
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          selected ? "text-primary" : "text-slate-700",
        )}
      >
        {formatVnd(option.feeVnd)}
      </span>
    </button>
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
