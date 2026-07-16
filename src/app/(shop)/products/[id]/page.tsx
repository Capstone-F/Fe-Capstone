"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { vi } from "@/config/locales/vi";
import { useProduct } from "@/features/commerce/hooks/use-products";
import { useAddToCart } from "@/features/commerce/hooks/use-cart";
import { primaryVariant } from "@/features/commerce/lib/variant";
import { formatVnd } from "@/features/commerce/lib/format";
import { CategoryPlaceholder } from "@/features/commerce/components/category-placeholder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const d = vi.commerce.detail;

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quantity, setQuantity] = useState(1);

  const { data: detail, isLoading } = useProduct(id);
  const addToCart = useAddToCart();

  if (isLoading || !detail) {
    return <DetailSkeleton />;
  }

  const { product, ingredients } = detail;
  const variant = primaryVariant(product);

  const handleAdd = () => {
    if (!variant) return;
    addToCart.mutate(
      { productVariantId: variant.id, quantity },
      {
        onSuccess: () =>
          toast.success(`${vi.commerce.products.added}: ${product.name}`),
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/products"
        className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        {d.backToShop}
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-slate-200 py-0 shadow-sm">
          <div className="relative aspect-square w-full bg-slate-50">
            <CategoryPlaceholder categoryName={product.categoryName} />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {product.brandName}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="text-primary text-2xl font-bold">
              {variant ? formatVnd(variant.priceVnd) : "—"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">
              {d.quantity}
            </span>
            <div className="flex items-center rounded-lg border border-slate-200">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            disabled={!variant || addToCart.isPending}
            onClick={handleAdd}
            className="rounded-lg font-semibold"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {vi.commerce.products.addToCart}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">{d.description}</TabsTrigger>
          <TabsTrigger value="ingredients">{d.ingredients}</TabsTrigger>
        </TabsList>
        <TabsContent
          value="description"
          className="text-sm leading-relaxed text-slate-700"
        >
          {product.description || d.noDescription}
        </TabsContent>
        <TabsContent value="ingredients">
          <div className="flex flex-wrap gap-2">
            {ingredients.length === 0 && (
              <span className="text-muted-foreground text-sm">
                {d.noIngredients}
              </span>
            )}
            {ingredients.map((ingredient) => (
              <span
                key={ingredient.name}
                className={
                  ingredient.isKeyIngredient
                    ? "bg-primary-soft text-primary rounded-full px-3 py-1 text-xs font-bold"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                }
              >
                {ingredient.name}
                {ingredient.concentrationPct !== null
                  ? ` ${ingredient.concentrationPct}%`
                  : ""}
              </span>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Skeleton className="h-4 w-32 bg-slate-300" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl bg-slate-300" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24 bg-slate-300" />
          <Skeleton className="h-8 w-3/4 bg-slate-300" />
          <Skeleton className="h-6 w-32 bg-slate-300" />
          <Skeleton className="h-20 w-full bg-slate-300" />
          <Skeleton className="h-10 w-full rounded-lg bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
