"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { vi } from "@/config/locales/vi";
import { useProduct } from "@/features/commerce/hooks/use-products";
import { useAddToCart, useCart } from "@/features/commerce/hooks/use-cart";
import { detectCartConflicts } from "@/features/commerce/lib/conflicts";
import { formatVnd } from "@/features/commerce/lib/format";
import { CompatibilityBadges } from "@/features/commerce/components/compatibility-badges";
import { StockBadge } from "@/features/commerce/components/stock-badge";
import { ConflictWarning } from "@/features/commerce/components/conflict-warning";
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

  const { data: product, isLoading } = useProduct(id);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();

  if (isLoading || !product) {
    return <DetailSkeleton />;
  }

  const outOfStock = product.stockStatus === "out_of_stock";
  const cartProducts = cart?.lines.map((line) => line.product) ?? [];
  const conflicts = detectCartConflicts([product, ...cartProducts]);

  const handleAdd = () => {
    addToCart.mutate(
      { productId: product.id, quantity },
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
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {product.brand}
              </span>
              <StockBadge status={product.stockStatus} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {product.name}
            </h1>
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviews} đánh giá)
              </span>
            </div>
            <p className="text-primary text-2xl font-bold">
              {formatVnd(product.priceVnd)}
            </p>
          </div>

          <CompatibilityBadges product={product} />

          <ConflictWarning conflicts={conflicts} />

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
            disabled={outOfStock || addToCart.isPending}
            onClick={handleAdd}
            className="rounded-lg font-semibold"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {outOfStock
              ? vi.commerce.products.outOfStock
              : vi.commerce.products.addToCart}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">{d.description}</TabsTrigger>
          <TabsTrigger value="ingredients">{d.ingredients}</TabsTrigger>
          <TabsTrigger value="howto">{d.howToUse}</TabsTrigger>
        </TabsList>
        <TabsContent
          value="description"
          className="text-sm leading-relaxed text-slate-700"
        >
          {product.description}
        </TabsContent>
        <TabsContent value="ingredients">
          <div className="flex flex-wrap gap-2">
            {product.ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className={
                  ingredient === product.activeIngredient
                    ? "bg-primary-soft text-primary rounded-full px-3 py-1 text-xs font-bold"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                }
              >
                {ingredient}
                {ingredient === product.activeIngredient &&
                product.concentration
                  ? ` ${product.concentration}`
                  : ""}
              </span>
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="howto"
          className="text-sm leading-relaxed text-slate-700"
        >
          {product.howToUse}
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
