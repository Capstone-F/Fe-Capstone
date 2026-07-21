"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";

export function PurchaseScreen() {
  const {
    state,
    setFlowState,
    getRecommendedProducts,
    addRecommendationsToCart,
  } = useTreatment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"checkout" | "processing">(
    "checkout",
  );

  const answers = state.surveyAnswers;
  const isPregnant = answers.pregnancy === "yes";
  const isLowHydration = answers.hydration !== "" && answers.hydration <= 25;

  // Retrieve dynamic recommended products based on survey rules
  const dynamicProducts = getRecommendedProducts();

  // State to track selected product IDs
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    dynamicProducts.map((p) => p.id),
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const selectedProducts = dynamicProducts.filter((p) =>
    selectedProductIds.includes(p.id),
  );

  const totalOriginal = selectedProducts.reduce(
    (acc, p) => acc + (p.originalPrice || p.price),
    0,
  );
  const totalDiscounted = selectedProducts.reduce((acc, p) => acc + p.price, 0);
  const totalSavings = totalOriginal - totalDiscounted;

  const handleAddToCart = async () => {
    if (selectedProductIds.length === 0) return;
    setIsAddingToCart(true);
    setCartMessage(null);
    try {
      await addRecommendationsToCart(selectedProductIds);
      setCartMessage("Đã thêm các sản phẩm vào giỏ hàng thành công!");
    } catch (e) {
      console.error(e);
      setCartMessage("Có lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");
    try {
      if (selectedProductIds.length > 0) {
        await addRecommendationsToCart(selectedProductIds);
      }
    } catch (e) {
      console.error("Lỗi khi thêm vào giỏ trước checkout:", e);
    }

    // Simulate Payment processing transition to tracker
    setTimeout(() => {
      setIsProcessing(false);
      setFlowState("success");
    }, 1500);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (paymentStep === "processing") {
    return (
      <div className="animate-in fade-in flex flex-1 flex-col items-center justify-center px-6 text-center duration-300">
        <div className="max-w-sm space-y-6 sm:max-w-md md:max-w-xl">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CreditCard className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-heading text-foreground text-lg font-bold">
              Đang xử lý giao dịch...
            </h4>
            <p className="text-muted-foreground text-xs">
              Vui lòng không tắt hoặc tải lại trang trong khi hệ thống kết nối
              với Cổng Thanh Toán VNPay.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-1 flex-col justify-between px-4 duration-300">
      {/* Header */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlowState("plan")}
            className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            Mua Hàng Phác Đồ (Combo Ưu Đãi)
          </span>
          <div className="h-8 w-8 shrink-0" />
        </div>

        <div className="space-y-1 text-center">
          <h3 className="font-heading text-foreground text-lg font-extrabold">
            Sản Phẩm Khuyến Nghị Theo Phác Đồ
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Sản phẩm được tự động map từ các hoạt chất khuyên dùng trong Routine
            của bạn.
          </p>
        </div>
      </div>

      {/* Safety / Hydration Special Badges */}
      <div className="my-2 shrink-0 space-y-1.5">
        {isPregnant && (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[9px] font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Đã loại trừ hoạt chất mạnh không an toàn cho thai kỳ.</span>
          </div>
        )}
        {isLowHydration && (
          <div className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] font-semibold text-blue-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              Tự động nâng cấp kem dưỡng phục hồi lipid sâu (độ ẩm &le; 25%).
            </span>
          </div>
        )}
      </div>

      {/* Product List (Scrollable) */}
      <div className="my-2 grid max-h-[220px] flex-1 gap-2 overflow-y-auto py-1 pr-1">
        {dynamicProducts.map((prod) => {
          const isSelected = selectedProductIds.includes(prod.id);
          return (
            <div
              key={prod.id}
              onClick={() => toggleProduct(prod.id)}
              className={`border-border/50 shadow-inner-sm flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 transition-all duration-200 select-none ${
                isSelected
                  ? "border-primary/40 ring-primary/10 bg-white/90 shadow-md ring-1"
                  : "border-border/30 bg-white/30 opacity-70 hover:opacity-90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Custom checkbox indicator */}
                  <div
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  {/* Mock product thumbnail */}
                  <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary/5 border-primary/10 text-primary"
                        : "bg-muted border-border/20 text-muted-foreground"
                    }`}
                  >
                    <ShoppingBag className="h-4.5 w-4.5 opacity-70" />
                  </div>
                  <div className="flex max-w-[190px] flex-col gap-0.5">
                    <span
                      className={`text-xs leading-tight font-bold transition-all ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {prod.name}
                    </span>
                    <span className="text-muted-foreground text-[9px] font-semibold">
                      {prod.brand} • {prod.category}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`text-xs font-extrabold transition-all ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {formatPrice(prod.price)}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-muted-foreground block text-[9px] line-through">
                      {formatPrice(prod.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Reason for recommendation */}
              <div className="text-muted-foreground pl-7 text-[9px] leading-relaxed">
                <strong>Lý do kê đơn:</strong> {prod.reason}
              </div>

              {/* Active ingredient conflict warning */}
              {prod.conflict && prod.conflictWarning && (
                <div className="mt-1 ml-7 flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-[9px] leading-relaxed text-amber-800">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{prod.conflictWarning}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Breakdown and checkout */}
      <div className="border-border/60 shrink-0 space-y-3 border-t pt-3">
        <div className="space-y-1.5 rounded-2xl border border-white/50 bg-white/40 p-3 text-[10px] shadow-sm">
          <div className="text-muted-foreground flex justify-between">
            <span>Tạm tính ({selectedProducts.length} sản phẩm):</span>
            <span>{formatPrice(totalOriginal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-600">
            <span>Giảm giá theo quy trình chăm sóc da combo:</span>
            <span>-{formatPrice(totalSavings)}</span>
          </div>
          <div className="text-muted-foreground flex justify-between">
            <span>Vận chuyển (GHTK):</span>
            <span className="font-semibold text-emerald-600">Miễn phí</span>
          </div>
          <div className="bg-border/50 my-1 h-[1px]" />
          <div className="text-foreground flex justify-between text-xs font-bold">
            <span>Tổng thanh toán:</span>
            <span className="text-primary text-sm font-black">
              {formatPrice(totalDiscounted)}
            </span>
          </div>
        </div>

        {cartMessage && (
          <div className="border-primary/20 bg-primary/10 text-primary animate-in fade-in rounded-xl border p-2.5 text-center text-xs font-semibold">
            {cartMessage}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={
              isProcessing || isAddingToCart || selectedProductIds.length === 0
            }
            className="border-primary/40 hover:bg-primary/5 text-primary flex items-center justify-center gap-1.5 rounded-2xl py-6 text-xs font-bold transition-all duration-300"
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4.5 w-4.5" />
            )}
            <span>Thêm vào giỏ ({selectedProductIds.length})</span>
          </Button>

          <Button
            onClick={handleCheckout}
            disabled={
              isProcessing || isAddingToCart || selectedProductIds.length === 0
            }
            className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 flex items-center justify-center gap-1.5 rounded-2xl py-6 text-xs font-bold text-white shadow-lg transition-all duration-300"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4.5 w-4.5" />
            )}
            <span>Mua combo & Kích hoạt</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
