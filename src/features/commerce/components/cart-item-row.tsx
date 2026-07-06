"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartLine } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { formatVnd } from "../lib/format";
import { Button } from "@/components/ui/button";

interface CartItemRowProps {
  line: CartLine;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({
  line,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const { product, quantity, lineTotal } = line;
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Link
        href={`/products/${product.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-50"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-muted-foreground text-[10px] font-semibold uppercase">
          {product.brand}
        </span>
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-bold text-slate-900"
        >
          {product.name}
        </Link>
        <span className="text-sm font-bold text-slate-800">
          {formatVnd(lineTotal)}
        </span>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(product.id)}
          aria-label={vi.commerce.cart.remove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex items-center rounded-lg border border-slate-200">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            aria-label="Giảm số lượng"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-xs font-semibold">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            aria-label="Tăng số lượng"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
