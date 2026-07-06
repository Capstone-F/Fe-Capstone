"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { formatVnd } from "../lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StockBadge } from "./stock-badge";
import { CardBadges } from "./compatibility-badges";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isAdding,
}: ProductCardProps) {
  const outOfStock = product.stockStatus === "out_of_stock";

  return (
    <Card className="hover:border-primary/40 flex flex-col justify-between overflow-hidden border-slate-200 py-0 shadow-xs transition-colors">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full bg-slate-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover"
          />
          <div className="absolute top-2 left-2">
            <StockBadge status={product.stockStatus} />
          </div>
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          {product.brand}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
            {product.name}
          </h3>
        </Link>
        <CardBadges product={product} />
        <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-yellow-600">
          <Star className="h-3 w-3 fill-current" />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3">
        <span className="text-sm font-bold text-slate-800">
          {formatVnd(product.priceVnd)}
        </span>
        <Button
          size="sm"
          disabled={outOfStock || isAdding}
          onClick={() => onAddToCart(product)}
          className="rounded-lg text-xs font-semibold"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          {outOfStock
            ? vi.commerce.products.outOfStock
            : vi.commerce.products.addToCart}
        </Button>
      </CardFooter>
    </Card>
  );
}
