"use client";

import { toast } from "sonner";
import { Product } from "@/types/domain";
import { useProducts } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import { ProductCard } from "./product-card";
import { showAddToCartError } from "../lib/cart-errors";

const d = {
  quantity: "Số lượng",
  ingredients: "Thành phần",
  description: "Mô tả",
  noDescription: "Sản phẩm này chưa có mô tả.",
  noIngredients: "Chưa có thông tin thành phần.",
  related: "Sản phẩm liên quan",
  relatedInCategory: "Sản phẩm cùng danh mục",
  backToShop: "Quay lại cửa hàng",
  breadcrumbHome: "Trang chủ",
  breadcrumbShop: "Sản phẩm",
  variantLabel: "Phân loại",
  sku: "Mã SKU",
  keyIngredients: "Thành phần chính",
  trustGenuine: "Chính hãng",
  trustShipping: "Miễn phí vận chuyển",
  trustReturn: "Đổi trả trong 7 ngày",
};

/**
 * "Sản phẩm cùng danh mục" — fetches active products in the same category via
 * the server-side `categoryId` filter and drops the product being viewed.
 * Renders nothing when there is no other product in the category.
 */
export function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const { data } = useProducts({ categoryId, limit: 8 });
  const addToCart = useAddToCart();

  const items = (data?.products ?? []).filter((p) => p.id !== currentProductId);

  if (items.length === 0) return null;

  const handleAdd = (product: Product) => {
    const variant = primaryVariant(product);
    if (!variant) return;
    addToCart.mutate(
      { productVariantId: variant.id },
      {
        onSuccess: () => toast.success(`${"Đã thêm vào giỏ"}: ${product.name}`),
        onError: showAddToCartError,
      },
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-900">
        {d.relatedInCategory}
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAdd}
            isAdding={addToCart.isPending}
          />
        ))}
      </div>
    </section>
  );
}
