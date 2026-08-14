"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import {
  buildProductsHref,
  parseProductFilters,
  type ProductFilterPatch,
} from "@/features/commerce/lib/product-filters";
import { useCategories } from "@/features/commerce/hooks/useProducts";
import { getCategoryLabel } from "@/features/commerce/mapper/category-mapper";
import { Button } from "@/shared/components/ui/button";

const c = {
  back: "Khám phá",
  category: "Danh mục",
  brand: "Thương hiệu",
  ingredient: "Thành phần",
  query: "Từ khoá",
  all: "Tất cả sản phẩm",
  remove: (label: string) => `Bỏ lọc ${label}`,
};

interface ActiveChip {
  key: string;
  label: string;
  /** The patch that removes this chip. Held as a whole object rather than a key,
   *  because a computed key widens to `{ [x: string]: null }` and stops matching
   *  ProductFilterPatch. */
  clear: ProductFilterPatch;
}

export function ActiveFilterBar({
  brandLabel,
}: {
  brandLabel?: string;
}): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseProductFilters(searchParams);
  const { data: categories } = useCategories();

  const chips: ActiveChip[] = [];
  if (filters.categoryId) {
    const match = categories?.find((item) => item.id === filters.categoryId);
    chips.push({
      key: "categoryId",
      label: `${c.category}: ${match ? getCategoryLabel(match.name) : filters.categoryId}`,
      clear: { categoryId: null },
    });
  }
  if (filters.brandId) {
    chips.push({
      key: "brandId",
      label: `${c.brand}: ${brandLabel ?? filters.brandId}`,
      clear: { brandId: null },
    });
  }
  if (filters.brandName) {
    chips.push({
      key: "brandName",
      label: `${c.brand}: ${filters.brandName}`,
      clear: { brandName: null },
    });
  }
  if (filters.ingredientName) {
    chips.push({
      key: "ingredientName",
      label: `${c.ingredient}: ${filters.ingredientName}`,
      clear: { ingredientName: null },
    });
  }
  if (filters.query) {
    chips.push({
      key: "query",
      label: `${c.query}: ${filters.query}`,
      clear: { query: null },
    });
  }
  if (filters.view === "all" && chips.length === 0) {
    chips.push({ key: "view", label: c.all, clear: { view: null } });
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="active-filters"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/products")}
        className="text-muted-foreground hover:text-primary h-8 px-2 text-xs font-semibold"
      >
        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
        {c.back}
      </Button>
      {chips.map((chip) => (
        <span
          key={chip.key}
          data-testid="filter-chip"
          className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-xs font-semibold"
        >
          {chip.label}
          <button
            type="button"
            aria-label={c.remove(chip.label)}
            onClick={() =>
              router.push(buildProductsHref(searchParams, chip.clear))
            }
            className="hover:bg-primary/20 focus-visible:ring-primary rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
