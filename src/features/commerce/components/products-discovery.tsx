"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/features/auth/hooks/useSession";
import {
  useFeaturedProducts,
  useProductSuggestions,
} from "@/features/commerce/hooks/useProducts";
import { buildProductsHref } from "@/features/commerce/lib/product-filters";
import { ProductSearchHero } from "@/features/commerce/components/product-search-hero";
import { SearchSuggestionChips } from "@/features/commerce/components/search-suggestion-chips";
import { CategoryCarousel } from "@/features/commerce/components/category-carousel";
import { BrandBento } from "@/features/commerce/components/brand-bento";
import { ProductRail } from "@/features/commerce/components/product-rail";
import { Button } from "@/shared/components/ui/button";

const RECOMMENDED_LIMIT = 12;

const c = {
  recommended: "Dành cho bạn",
  featured: "Sản phẩm nổi bật",
  scanTitle: "Chưa biết bắt đầu từ đâu?",
  scanBody:
    "Quét da 60 giây để GlowScan gợi ý sản phẩm hợp với làn da của bạn.",
  scanCta: "Quét da ngay",
};

export function ProductsDiscovery() {
  const searchParams = useSearchParams();
  const session = useSession();
  const isAuthenticated = !!session.data;

  const { data: recommended, isLoading: isRecommendedLoading } =
    useProductSuggestions(RECOMMENDED_LIMIT, isAuthenticated);
  const { products: featured, isLoading: isFeaturedLoading } =
    useFeaturedProducts();

  return (
    <div className="flex flex-col gap-8" data-testid="products-discovery">
      <ProductSearchHero />
      <SearchSuggestionChips />
      <CategoryCarousel />
      <BrandBento />

      {session.isLoading || isAuthenticated ? (
        <ProductRail
          testId="rail-recommended"
          title={c.recommended}
          products={recommended ?? []}
          // While the session is still resolving, force the skeleton state so a
          // signed-in user does not flash the guest CTA below before the
          // personalised rail replaces it.
          isLoading={isRecommendedLoading || session.isLoading}
          viewAllHref={buildProductsHref(searchParams, {
            section: "recommended",
          })}
        />
      ) : (
        // Nothing to personalise for a guest, so offer the scan instead of a rail.
        <section className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{c.scanTitle}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{c.scanBody}</p>
          </div>
          <Link href="/scan">
            <Button size="sm" className="text-xs font-semibold">
              {c.scanCta}
            </Button>
          </Link>
        </section>
      )}

      <ProductRail
        testId="rail-featured"
        title={c.featured}
        products={featured}
        isLoading={isFeaturedLoading}
        viewAllHref={buildProductsHref(searchParams, { view: "all" })}
      />
    </div>
  );
}
