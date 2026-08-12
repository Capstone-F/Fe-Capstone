"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import { useSession } from "@/features/auth/hooks/useSession";
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
  const sessionQuery = useSession();

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

  const router = useRouter();

  const handleAddToCart = async () => {
    if (selectedProductIds.length === 0) return;
    if (!sessionQuery.data) {
      router.push("/login?redirectTo=/checkout");
      return;
    }
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
    if (selectedProductIds.length === 0) return;

    if (!sessionQuery.data) {
      router.push("/login?redirectTo=/checkout");
      return;
    }

    setIsProcessing(true);
    try {
      await addRecommendationsToCart(selectedProductIds);
      setPaymentStep("processing");
      router.push("/checkout");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ trước checkout:", error);
      setIsProcessing(false);
      setPaymentStep("checkout");
      setCartMessage("Có lỗi khi chuyển sang thanh toán. Vui lòng thử lại.");
    }
  };

  if (recommendationStatus !== "ok" || dynamicProducts.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h3 className="font-heading text-2xl font-bold text-[#131336]">
          Chưa có sản phẩm hợp lệ để thanh toán
        </h3>
        <p className="text-sm text-[#131336]/70">
          Phiên khảo sát này chưa có sản phẩm phù hợp để thêm vào giỏ hoặc tạo
          checkout.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => setFlowState("plan")}
            className="rounded-full bg-[#6b5cf6] px-6 text-sm font-bold text-white hover:bg-[#5a4ae5]"
          >
            Quay lại kết quả khảo sát
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
            Sản phẩm gợi ý cho bạn
          </h3>
          <p className="text-muted-foreground text-[10px]">
            Chọn các sản phẩm phù hợp trước khi thêm vào giỏ hàng.
          </p>
        </div>
      </div>

      <div className="my-4 flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden px-1 py-1 pb-3 [scrollbar-width:thin]">
        {dynamicProducts.map((product) => {
          const isSelected = selectedProductIds.includes(product.id);
          return (
            <button
              type="button"
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              aria-pressed={isSelected}
              className={`border-border/50 shadow-inner-sm relative flex aspect-square w-52 shrink-0 cursor-pointer flex-col rounded-2xl border p-4 text-left transition-all duration-200 select-none sm:w-60 ${
                isSelected
                  ? "border-primary/40 ring-primary/10 bg-white shadow-md ring-1"
                  : "border-border/30 bg-white/30 opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/30 bg-white/80 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary/10 bg-primary/5 text-primary"
                    : "border-border/20 bg-muted text-muted-foreground"
                }`}
              >
                <ShoppingBag className="h-5 w-5 opacity-80" />
              </div>

              <div className="mt-3 min-w-0 space-y-1">
                <p
                  className={`line-clamp-2 text-sm leading-snug font-bold transition-all ${
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {product.name}
                </p>
                <p className="text-muted-foreground truncate text-[10px] font-medium">
                  {product.category}
                </p>
              </div>

              <div className="mt-auto space-y-2 pt-3">
                <p className="text-muted-foreground line-clamp-2 text-[10px] leading-relaxed">
                  <span className="font-semibold">Phù hợp vì: </span>
                  {product.reason}
                </p>
                <div className="border-border/50 flex items-center justify-between border-t pt-2.5">
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {isSelected ? "Đã chọn" : "Chọn sản phẩm"}
                  </span>
                  <span className="text-foreground text-sm font-extrabold">
                    {formatVnd(product.price)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-border/60 shrink-0 space-y-3 border-t pt-3">
        <div className="space-y-1.5 rounded-2xl border border-white/50 bg-white/40 p-3 text-[10px] shadow-sm">
          <div className="text-muted-foreground flex justify-between">
            <span>Tạm tính ({selectedProducts.length} sản phẩm):</span>
            <span>{formatVnd(totalSelected)}</span>
          </div>

          <div className="text-muted-foreground flex justify-between">
            <span>Vận chuyển:</span>
            <span className="font-semibold">Tính theo địa chỉ nhận hàng</span>
          </div>
          <div className="bg-border/50 my-1 h-[1px]" />
          <div className="text-foreground flex justify-between text-xs font-bold">
            <span>Tổng thanh toán trước checkout:</span>
            <span className="text-primary text-sm font-black">
              {formatVnd(totalSelected)}
            </span>
          </div>
        </div>

        {cartMessage && (
          <div className="border-primary/20 bg-primary/10 text-primary animate-in fade-in rounded-xl border p-2.5 text-center text-xs font-semibold">
            {cartMessage}
          </div>
        )}

        {!sessionQuery.data ? (
          <div className="space-y-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 p-4 text-left shadow-sm">
            <div className="flex items-center gap-2 text-[#6b5cf6]">
              <LogIn className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Vui lòng Đăng Nhập để Thêm Sản Phẩm Vào Giỏ Hàng
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Bạn đang xem sản phẩm gợi ý dưới dạng khách. Đăng nhập hoặc đăng
              ký tài khoản để tự động lưu kết quả khảo sát và đưa sản phẩm kê
              hàng vào giỏ hàng.
            </p>
            <Button
              onClick={() => router.push("/login?redirectTo=/checkout")}
              className="h-12 w-full gap-2 rounded-2xl bg-[#6b5cf6] text-xs font-bold text-white shadow-md hover:bg-[#5a4ae5]"
            >
              <LogIn className="h-4 w-4" />
              <span>Vui lòng Đăng Nhập / Đăng Ký để thêm vào giỏ</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleAddToCart}
              disabled={
                isProcessing ||
                isAddingToCart ||
                selectedProductIds.length === 0
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
                isProcessing ||
                isAddingToCart ||
                selectedProductIds.length === 0
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
        )}
      </div>
    </div>
  );
}
