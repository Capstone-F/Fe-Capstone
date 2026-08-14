"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useBrands } from "@/features/commerce/hooks/useProducts";
import { getBrandAccent } from "@/features/commerce/constants/discovery";
import { buildProductsHref } from "@/features/commerce/lib/product-filters";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MAX_TILES = 5;

const c = {
  title: "Thương hiệu",
  count: (total: number) => `${total} sản phẩm`,
};

export function BrandBento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: brands, isLoading } = useBrands();

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: MAX_TILES }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) return null;

  const tiles = brands.slice(0, MAX_TILES);

  return (
    <section className="flex flex-col gap-3" data-testid="brand-bento">
      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
      <div className="grid auto-rows-[96px] grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((brand, index) => (
          <button
            key={brand.id}
            type="button"
            onClick={() =>
              router.push(
                // brandId is an exact FK match; brandName is ILIKE %...%. Clear the
                // stale name so the two params cannot contradict each other.
                buildProductsHref(searchParams, {
                  brandId: brand.id,
                  brandName: null,
                }),
              )
            }
            className={cn(
              "focus-visible:ring-primary flex flex-col items-start justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
              // The lead tile takes a 2x2 cell on desktop; on narrow screens the
              // bento collapses to two columns and the lead returns to one row.
              index === 0 && "sm:col-span-2 sm:row-span-2",
            )}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white"
              style={{ backgroundColor: getBrandAccent(brand.name) }}
              aria-hidden="true"
            >
              {brand.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex flex-col">
              <span className="line-clamp-1 text-sm font-bold text-slate-900">
                {brand.name}
              </span>
              <span className="text-[11px] text-slate-500">
                {c.count(brand.productCount)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
