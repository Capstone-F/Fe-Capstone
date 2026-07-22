"use client";

import Link from "next/link";
import { AlertTriangle, Plus, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useProductSelection } from "../hooks/useProductSelection";
import { useAddToCart } from "../hooks/useCart";
import { useProducts } from "../hooks/useProducts";
import { primaryVariant } from "../mapper/variant";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import { Product } from "@/types/domain";

const SMART_CATALOG_SPECS = [
  {
    id: "centella",
    ingredientName: "Centella",
    label: "Phục hồi da",
    labelColor: "bg-green-500/10 text-green-600",
    caution: "Lựa chọn an toàn",
    cautionColor: "text-muted-foreground",
    name: "Kem dưỡng làm dịu rau má GlowScan",
    desc: "Chứa 5% Centella và 2% Niacinamide giúp phục hồi nhanh chóng làn da đang bị kích ứng, nhạy cảm.",
    tags: ["Rau má", "B5"],
    price: "320.000 đ",
  },
  {
    id: "bha",
    ingredientName: "Salicylic Acid",
    label: "Tẩy tế bào chết",
    labelColor: "bg-red-500/10 text-red-600",
    caution: "Hoạt chất mạnh",
    cautionColor: "text-red-500",
    name: "Dung dịch tẩy da chết hóa học BHA 2%",
    desc: "Thấm sâu làm sạch bã nhờn, loại bỏ tế bào sừng gây bít tắc cồi mụn ẩn.",
    tags: ["Salicylic Acid 2%"],
    price: "390.000 đ",
  },
  {
    id: "retinol",
    ingredientName: "Retinol",
    label: "Trẻ hóa & Chống lão hóa",
    labelColor: "bg-blue-500/10 text-blue-600",
    caution: "Hoạt chất mạnh",
    cautionColor: "text-red-500",
    name: "Tinh chất Retinol tinh khiết 1%",
    desc: "Kích thích sản sinh collagen thế hệ mới, mờ nếp nhăn mảnh và giúp căng bóng da.",
    tags: ["Retinol 1%"],
    price: "550.000 đ",
  },
] as const;

type SmartCatalogCard = (typeof SMART_CATALOG_SPECS)[number] & {
  product: Product | null;
};

function buildCatalogCard(
  spec: (typeof SMART_CATALOG_SPECS)[number],
  product: Product | null,
): SmartCatalogCard {
  return {
    ...spec,
    product,
  };
}

export function SmartCatalogSection() {
  const { selectedProduct, hasConflict, handleProductSelect } =
    useProductSelection();
  const addToCart = useAddToCart();

  const centellaQuery = useProducts({ ingredientName: "Centella", limit: 1 });
  const bhaQuery = useProducts({ ingredientName: "Salicylic Acid", limit: 1 });
  const retinolQuery = useProducts({ ingredientName: "Retinol", limit: 1 });

  const catalogCards = [
    buildCatalogCard(
      SMART_CATALOG_SPECS[0],
      centellaQuery.data?.products[0] ?? null,
    ),
    buildCatalogCard(
      SMART_CATALOG_SPECS[1],
      bhaQuery.data?.products[0] ?? null,
    ),
    buildCatalogCard(
      SMART_CATALOG_SPECS[2],
      retinolQuery.data?.products[0] ?? null,
    ),
  ];

  const handleAddToCart = (card: SmartCatalogCard) => {
    const variant = card.product ? primaryVariant(card.product) : undefined;

    if (!variant) {
      toast.error("Sản phẩm này hiện chưa sẵn sàng để thêm vào giỏ hàng.");
      return;
    }

    addToCart.mutate(
      { productVariantId: variant.id },
      {
        onSuccess: () => {
          handleProductSelect(card.id);
          toast.success(`Đã thêm vào giỏ: ${card.product?.name ?? card.name}`, {
            description: "Xem giỏ hàng để hoàn tất đơn.",
          });
        },
        onError: () => {
          toast.error(
            "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  return (
    <section
      id="products"
      className="bg-secondary/10 border-border/30 border-t py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl space-y-3 text-left">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Cửa hàng thông minh
            </span>
            <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Cảnh báo thông minh chống xung đột hoạt chất
            </h2>
            <p className="text-muted-foreground text-sm">
              GlowScan áp dụng cơ chế phân tích thành phần tự động. Thử click
              chọn đồng thời cả 2 hoạt chất <strong>BHA</strong> và{" "}
              <strong>Retinol</strong> phía dưới để kiểm tra chức năng cảnh báo
              xung đột của giỏ hàng!
            </p>
          </div>

          {/* View all link */}
          <Link href="/products" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-border/80 hover:bg-secondary/40 gap-1.5 rounded-xl font-semibold"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {catalogCards.map((product) => {
            const isSelected = selectedProduct.includes(product.id);
            const variant = product.product
              ? primaryVariant(product.product)
              : undefined;
            return (
              <div
                key={product.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                  isSelected
                    ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${product.labelColor}`}
                    >
                      {product.label}
                    </span>
                    <span
                      className={`text-xs font-medium ${product.cautionColor}`}
                    >
                      {product.caution}
                    </span>
                  </div>
                  <h3 className="font-heading text-foreground text-base font-bold">
                    {product.product?.name ?? product.name}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-normal">
                    {product.product?.description ?? product.desc}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                  <span className="text-foreground font-bold">
                    {variant ? formatVnd(variant.priceVnd) : product.price}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!variant || addToCart.isPending}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    } ${!variant ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Đã thêm
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Thêm vào giỏ
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conflict Warning banner demo */}
        {hasConflict && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 duration-300">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-yellow-800">
                  Cảnh báo xung đột hoạt chất phát hiện!
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-yellow-700">
                  Bạn đang thêm cả <strong>BHA 2%</strong> và{" "}
                  <strong>Retinol 1%</strong> vào routine/giỏ hàng. Việc sử dụng
                  đồng thời cả hai hoạt chất tẩy sừng và tái tạo mạnh mẽ này
                  trong cùng một thời điểm có thể gây kích ứng mạnh.
                </p>
                <p className="mt-2 text-[11px] font-semibold text-yellow-900">
                  💡 Khuyên dùng: Sử dụng xen kẽ cách ngày (ví dụ: BHA tối thứ
                  2, 4, 6; Retinol tối thứ 3, 5, 7) và tăng cường cấp ẩm phục
                  hồi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
