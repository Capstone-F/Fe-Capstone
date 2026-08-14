"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import {
  useCategories,
  useCategoryProductCounts,
} from "@/features/commerce/hooks/useProducts";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";
import { buildProductsHref } from "@/features/commerce/lib/product-filters";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Skeleton } from "@/shared/components/ui/skeleton";

const c = {
  title: "Danh mục",
  count: (total: number) => `${total} sản phẩm`,
};

export function CategoryCarousel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories, isLoading } = useCategories();
  const { data: counts } = useCategoryProductCounts();

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[106px] w-[130px] rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  // A discovery rail with nothing in it tells the user nothing — hide the section.
  if (!categories || categories.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" data-testid="category-carousel">
      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
        <CarouselContent className="-ml-3">
          {categories.map((category) => {
            const icon = getCategoryIcon(category.name);
            const total = counts?.[category.id];
            return (
              <CarouselItem
                key={category.id}
                className="basis-1/2 pl-3 sm:basis-1/3 lg:basis-1/6"
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      buildProductsHref(searchParams, {
                        categoryId: category.id,
                      }),
                    )
                  }
                  className="focus-visible:ring-primary flex h-[106px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                    {icon ? (
                      <Image
                        src={icon}
                        alt=""
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <Layers className="h-5 w-5 text-slate-400" />
                    )}
                  </span>
                  <span className="line-clamp-1 text-xs font-semibold text-slate-800">
                    {getCategoryLabel(category.name)}
                  </span>
                  {typeof total === "number" ? (
                    <span className="text-[10px] text-slate-500">
                      {c.count(total)}
                    </span>
                  ) : null}
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-1 bg-white/95 shadow-md" />
        <CarouselNext className="right-1 bg-white/95 shadow-md" />
      </Carousel>
    </section>
  );
}
