"use client";

import { useSearchParams } from "next/navigation";
import { isCatalogMode } from "@/features/commerce/lib/product-filters";
import { ProductCatalog } from "@/features/commerce/components/product-catalog";
import { ProductsDiscovery } from "@/features/commerce/components/products-discovery";

const c = {
  catalogTitle: "Cửa hàng sản phẩm",
  catalogSubtitle:
    "Chọn sản phẩm skincare phù hợp với làn da của bạn — đã được kiểm tra hoạt chất.",
  discoveryTitle: "Khám phá sản phẩm",
  discoverySubtitle:
    "Tìm theo danh mục, thương hiệu hoặc hoạt chất bạn đang quan tâm.",
};

export function ProductsPage() {
  const searchParams = useSearchParams();
  // Catalog and discovery never render together: a collapsed discovery strip on
  // top of the filtered grid just pushes the results off the fold.
  const catalog = isCatalogMode(searchParams);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {catalog ? c.catalogTitle : c.discoveryTitle}
        </h2>
        <p className="text-muted-foreground text-sm">
          {catalog ? c.catalogSubtitle : c.discoverySubtitle}
        </p>
      </div>
      {catalog ? <ProductCatalog /> : <ProductsDiscovery />}
    </div>
  );
}
