"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/domain";
import { formatVnd } from "@/shared/utils/format";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import { resolvePrimaryProductImageUrl } from "@/features/commerce/mapper/product-image";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { ProductImage } from "./product-image";

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
  const variant = primaryVariant(product);

  return (
    <Card className="hover:border-primary/40 flex flex-col justify-between overflow-hidden border-slate-200 py-0 shadow-xs transition-colors">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full bg-slate-50">
          <ProductImage
            imageUrl={resolvePrimaryProductImageUrl(product.variants)}
            categoryName={product.categoryName}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          {product.brandName}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
            {product.name}
          </h3>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3">
        <span className="text-sm font-bold text-slate-800">
          {variant ? formatVnd(variant.priceVnd) : "—"}
        </span>
        <Button
          size="sm"
          disabled={!variant || isAdding}
          onClick={() => onAddToCart(product)}
          className="rounded-lg text-xs font-semibold"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          {"Thêm vào giỏ"}
        </Button>
      </CardFooter>
    </Card>
  );
}
