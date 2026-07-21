"use client";

import { toast } from "sonner";
import { Product } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { useProducts } from "../hooks/use-products";
import { useAddToCart } from "../hooks/use-cart";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import { ProductCard } from "./product-card";

const d = vi.commerce.detail;

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
        onSuccess: () =>
          toast.success(`${vi.commerce.products.added}: ${product.name}`),
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
