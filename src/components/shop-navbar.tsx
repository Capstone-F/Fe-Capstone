"use client";

import Link from "next/link";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "@/features/commerce/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { vi } from "@/config/locales/vi";

export function ShopNavbar() {
  const { data: cart } = useCart();
  const itemCount = cart?.itemCount ?? 0;
  const n = vi.commerce.nav;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Glow<span className="text-primary">Scan</span>
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            {n.products}
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-primary relative flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {n.cart}
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-3 h-4 min-w-4 justify-center px-1 text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
