"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/domain";
import { ProductCard } from "@/features/commerce/components/product-card";
import { ProductCardSkeleton } from "@/features/commerce/components/product-card-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/shared/components/ui/carousel";

const c = { viewAll: "Xem tất cả" };

const AUTOPLAY_INTERVAL_MS = 4000;
const SKELETON_COUNT = 6;

/** One slide's share of the track at each breakpoint. Kept in one place because
 *  the skeleton and the real cards must claim identical widths, or the rail
 *  visibly reflows the moment the data lands. */
const SLIDE_BASIS =
  "basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6";

interface ProductRailProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  viewAllHref?: string;
  testId?: string;
}

/** Looping product rail that reuses ProductCard as-is — no second card design.
 *  Built on the shared embla Carousel so it wraps around endlessly and advances
 *  on its own; cards stay focusable, so keyboard tabbing still walks the rail.
 *
 *  Cards here carry no add-to-cart button: a rail is a browsing surface, and a
 *  slide that moves under the pointer is the wrong place for a commit action —
 *  buying happens on the detail page or in the catalog grid. */
export function ProductRail({
  title,
  products,
  isLoading,
  viewAllHref,
  testId,
}: ProductRailProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api || isPaused) return;
    // An auto-advancing rail is exactly the unrequested movement the OS
    // "reduce motion" setting asks us to suppress, so leave it parked there.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [api, isPaused]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" data-testid={testId}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-primary inline-flex items-center text-xs font-semibold hover:underline"
          >
            {c.viewAll}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <Carousel
        opts={{ loop: true, align: "start" }}
        setApi={setApi}
        className="w-full"
        // Pause while the user is reading or tabbing through a card: a rail that
        // slides out from under the pointer makes the cards unclickable.
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        {/* items-stretch so every card fills the tallest slide's height */}
        <CarouselContent className="-ml-4 items-stretch">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <CarouselItem key={index} className={SLIDE_BASIS}>
                  <ProductCardSkeleton />
                </CarouselItem>
              ))
            : products.map((product) => (
                <CarouselItem key={product.id} className={SLIDE_BASIS}>
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 bg-white/95 shadow-md" />
        <CarouselNext className="right-1 bg-white/95 shadow-md" />
      </Carousel>
    </section>
  );
}
