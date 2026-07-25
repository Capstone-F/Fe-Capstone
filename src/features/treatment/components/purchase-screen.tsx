"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { validateSurveyRecommendation } from "@/features/treatment/lib/survey-flow";

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

  const dynamicProducts = getRecommendedProducts();
  const recommendationStatus = validateSurveyRecommendation(
    state.recommendations,
    state.surveySessionId,
  );

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    dynamicProducts.map((product) => product.id),
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const selectedProducts = dynamicProducts.filter((product) =>
    selectedProductIds.includes(product.id),
  );

  const totalSelected = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  const totalProtocolsCount = state.recommendations?.protocols?.length ?? 0;
  const selectedProtocolIdsSet = new Set(
    selectedProducts.map((p) => p.protocolId).filter(Boolean),
  );
  const selectedProtocolCount = selectedProtocolIdsSet.size;
  const isComboEligible =
    totalProtocolsCount > 0 && selectedProtocolCount >= totalProtocolsCount;

  const comboDiscount = isComboEligible ? Math.floor(totalSelected * 0.1) : 0;
  const finalTotal = Math.max(0, totalSelected - comboDiscount);

  const router = useRouter();

  const handleAddToCart = async () => {
    if (selectedProductIds.length === 0) return;
    setIsAddingToCart(true);
    setCartMessage(null);
    try {
      await addRecommendationsToCart(selectedProductIds);
      setCartMessage("Đã thêm các sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
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
      router.push("/checkout");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ trước checkout:", error);
      setIsProcessing(false);
      setPaymentStep("checkout");
      setCartMessage("Có lỗi khi chuyển sang thanh toán. Vui lòng thử lại.");
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (recommendationStatus !== "ok" || dynamicProducts.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Chưa có sản phẩm hợp lệ để thanh toán
        </h3>
        <p className="text-sm text-[#131336]/70">
          Phiên khảo sát này chưa có danh sách variant thật từ backend nên không
          thể thêm vào giỏ hoặc tạo checkout.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => setFlowState("plan")}
            className="rounded-full bg-[#6b5cf6] px-6 text-sm font-bold text-white hover:bg-[#5a4ae5]"
          >
            Quay lại protocol
          </Button>
        </div>
      </div>
    );
  }

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
            Mua Hàng Theo Survey
          </span>
          <div className="h-8 w-8 shrink-0" />
        </div>

        <div className="space-y-1 text-center">
          <h3 className="font-heading text-foreground text-lg font-extrabold">
            Sản Phẩm Khuyến Nghị Theo Backend
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Chỉ các variant thật từ recommendation hiện tại mới được chuyển vào
            giỏ hàng.
          </p>
        </div>
      </div>

      <div className="my-2 shrink-0 space-y-1.5">
        {isComboEligible ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/90 px-3 py-2 text-[10px] font-semibold text-emerald-800 shadow-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              🎉 <strong>Ưu đãi Combo Survey:</strong> Đã chọn đủ{" "}
              {selectedProtocolCount}/{totalProtocolsCount} phác đồ — Giảm trực
              tiếp 10% khi đặt đơn!
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-3 py-2 text-[10px] font-semibold text-amber-800 shadow-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              💡 <strong>Mẹo tiết kiệm:</strong> Chọn đủ sản phẩm cho tất cả{" "}
              {totalProtocolsCount} phác đồ (hiện có {selectedProtocolCount}/
              {totalProtocolsCount}) để nhận ngay Ưu đãi Combo 10%!
            </span>
          </div>
        )}
      </div>

      <div className="my-2 grid max-h-[220px] flex-1 gap-2 overflow-y-auto py-1 pr-1">
        {dynamicProducts.map((product) => {
          const isSelected = selectedProductIds.includes(product.id);
          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`border-border/50 shadow-inner-sm flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 transition-all duration-200 select-none ${
                isSelected
                  ? "border-primary/40 ring-primary/10 bg-white/90 shadow-md ring-1"
                  : "border-border/30 bg-white/30 opacity-70 hover:opacity-90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

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
                      {product.name}
                    </span>
                    <span className="text-muted-foreground text-[9px] font-semibold">
                      {product.brand} • {product.category}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`text-xs font-extrabold transition-all ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              <div className="text-muted-foreground pl-7 text-[9px] leading-relaxed">
                <strong>Lý do kê đơn:</strong> {product.reason}
              </div>

              {product.conflict && product.conflictWarning && (
                <div className="mt-1 ml-7 flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-[9px] leading-relaxed text-amber-800">
                  <span>{product.conflictWarning}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-border/60 shrink-0 space-y-3 border-t pt-3">
        <div className="space-y-1.5 rounded-2xl border border-white/50 bg-white/40 p-3 text-[10px] shadow-sm">
          <div className="text-muted-foreground flex justify-between">
            <span>Tạm tính ({selectedProducts.length} sản phẩm):</span>
            <span>{formatPrice(totalSelected)}</span>
          </div>

          {isComboEligible ? (
            <div className="flex justify-between font-bold text-emerald-700">
              <span>Giảm giá Combo Survey (10%):</span>
              <span>-{formatPrice(comboDiscount)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-amber-700">
              <span>Giảm giá Combo Survey:</span>
              <span className="text-muted-foreground font-semibold">
                0 đ (Chưa đủ điều kiện)
              </span>
            </div>
          )}

          <div className="text-muted-foreground flex justify-between">
            <span>Vận chuyển (GHTK):</span>
            <span className="font-semibold text-emerald-600">Miễn phí</span>
          </div>
          <div className="bg-border/50 my-1 h-[1px]" />
          <div className="text-foreground flex justify-between text-xs font-bold">
            <span>Tổng thanh toán trước checkout:</span>
            <span className="text-primary text-sm font-black">
              {formatPrice(finalTotal)}
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
            <span>Qua Checkout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
