"use client";

import { useProducts } from "../hooks/useProducts";
import { ProductRail } from "./product-rail";

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
 * Renders as the shared looping rail; `ProductRail` itself renders nothing when
 * the category holds no other product.
 */
export function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const { data, isLoading } = useProducts({ categoryId, limit: 8 });

  const items = (data?.products ?? []).filter((p) => p.id !== currentProductId);

  return (
    <ProductRail
      title={d.relatedInCategory}
      products={items}
      isLoading={isLoading}
    />
  );
}
