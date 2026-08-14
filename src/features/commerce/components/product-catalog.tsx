"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RefreshCw, PackageSearch, Search, Layers } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/domain";
import {
  useBrands,
  useCategories,
  useProducts,
  useProductSuggestions,
} from "@/features/commerce/hooks/useProducts";
import { useAddToCart } from "@/features/commerce/hooks/useCart";
import { useSession } from "@/features/auth/hooks/useSession";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";
import { ProductCard } from "@/features/commerce/components/product-card";
import { ProductCardSkeleton } from "@/features/commerce/components/product-card-skeleton";
import { ProductPagination } from "@/features/commerce/components/product-pagination";
import { ActiveFilterBar } from "@/features/commerce/components/active-filter-bar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { cn } from "@/lib/utils";
import useDebounce from "@/shared/hooks/useDebounce";
import { showAddToCartError } from "@/features/commerce/lib/cart-errors";
import {
  buildProductsHref,
  parseProductFilters,
  toProductQuery,
  type ProductFilterPatch,
} from "@/features/commerce/lib/product-filters";

const c = {
  filters: "Bộ lọc",
  reset: "Đặt lại",
  searchLabel: "Tìm kiếm",
  searchPlaceholder: "Tên, thương hiệu, hoạt chất...",
  category: "Danh mục",
  brand: "Thương hiệu",
  ingredient: "Thành phần",
  ingredientPlaceholder: "VD: Niacinamide, Retinol...",
  all: "Tất cả",
  addToCart: "Thêm vào giỏ",
  added: "Đã thêm vào giỏ",
  addError: "Không thể thêm vào giỏ hàng. Vui lòng thử lại.",
  emptyTitle: "Không tìm thấy sản phẩm phù hợp",
  emptyHint: "Thử nới lỏng bộ lọc của bạn.",
  perPage: "sản phẩm/trang",
  pageLabel: "Trang",
};
const ALL = "Tất cả";

export function ProductCatalog(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseProductFilters(searchParams);

  // Text inputs stay local so typing is not gated by a round trip through the
  // router; the debounced value is what reaches the URL.
  const [searchDraft, setSearchDraft] = useState(filters.query ?? "");
  const [ingredientDraft, setIngredientDraft] = useState(
    filters.ingredientName ?? "",
  );
  const debouncedSearch = useDebounce(searchDraft.trim(), 350);
  const debouncedIngredient = useDebounce(ingredientDraft.trim(), 350);

  // Resync the drafts when the URL value changes from outside typing (e.g. a
  // browser back/forward soft navigation, or a reset). Adjusting state during
  // render — same pattern the old `prevParamCategoryId` block used — instead
  // of an effect, so the draft never renders one frame stale.
  //
  // The extra `!== debounced*` check tells apart "the URL changed because our
  // own write effect just echoed back" from "the URL changed under us" (back/
  // forward, a link, a reset): a soft navigation is not instant, so between
  // the effect calling `router.replace` and `searchParams` actually updating,
  // the user may type another character, moving the draft ahead of the URL
  // value we wrote. `debouncedSearch`/`debouncedIngredient` are exactly the
  // values the write effect below would push (or just pushed), so comparing
  // the incoming URL value against them — instead of a separate ref, which
  // `react-hooks/refs` forbids reading during render — distinguishes our own
  // echo from a real external change. Back/forward still resyncs correctly,
  // because a URL the user navigated to generally won't match the debounced
  // value still sitting in this component from unrelated local typing.
  const urlQuery = filters.query ?? "";
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== debouncedSearch) setSearchDraft(urlQuery);
  }

  const urlIngredient = filters.ingredientName ?? "";
  const [prevUrlIngredient, setPrevUrlIngredient] = useState(urlIngredient);
  if (urlIngredient !== prevUrlIngredient) {
    setPrevUrlIngredient(urlIngredient);
    if (urlIngredient !== debouncedIngredient)
      setIngredientDraft(urlIngredient);
  }

  const pushFilter = useCallback(
    (patch: ProductFilterPatch) => {
      router.push(buildProductsHref(searchParams, patch));
    },
    [router, searchParams],
  );

  // Debounced text uses `replace`: `push` would add one history entry per
  // keystroke and make the browser back button useless. Both fields are
  // merged into a single effect writing a single patch: if both debounces
  // settle in the same commit (e.g. paste into both fields), two separate
  // `router.replace` calls built from the same `searchParams` snapshot would
  // each drop the other's just-written param.
  useEffect(() => {
    // The debounce has not caught up with the draft yet — writing now would
    // push a value the user has already navigated away from.
    const searchSettled = searchDraft.trim() === debouncedSearch;
    const ingredientSettled = ingredientDraft.trim() === debouncedIngredient;

    const patch: ProductFilterPatch = {};
    if (searchSettled && debouncedSearch !== (filters.query ?? "")) {
      patch.query = debouncedSearch || null;
    }
    if (
      ingredientSettled &&
      debouncedIngredient !== (filters.ingredientName ?? "")
    ) {
      patch.ingredientName = debouncedIngredient || null;
    }
    if (Object.keys(patch).length === 0) return;

    router.replace(buildProductsHref(searchParams, patch));
  }, [
    searchDraft,
    debouncedSearch,
    ingredientDraft,
    debouncedIngredient,
    filters.query,
    filters.ingredientName,
    router,
    searchParams,
  ]);

  const { data: categories } = useCategories();
  // Resolves `brandId` -> brand name so the chip and the Select show the real
  // name instead of a raw UUID. Shares the `catalogScan` cache with the brand
  // bento, so this does not add a new request. Only fetched when `brandId` is
  // actually set — most catalog views have no need for the 100-product scan.
  const { data: brands } = useBrands(!!filters.brandId);
  const brandLabel = filters.brandId
    ? brands?.find((brand) => brand.id === filters.brandId)?.name
    : undefined;
  const session = useSession();
  const isAuthenticated = !!session.data;

  const isRecommendedSection = filters.section === "recommended";

  const { data: recommendedData, isLoading: isRecsLoading } =
    useProductSuggestions(20, isAuthenticated && isRecommendedSection);

  const { data: normalData, isLoading: isNormalLoading } = useProducts(
    toProductQuery(filters),
  );
  const addToCart = useAddToCart();

  const data = useMemo(() => {
    return isRecommendedSection
      ? { products: recommendedData ?? [], total: recommendedData?.length ?? 0 }
      : normalData;
  }, [isRecommendedSection, recommendedData, normalData]);
  const isLoading = isRecommendedSection ? isRecsLoading : isNormalLoading;

  const pageItems = useMemo(() => data?.products ?? [], [data]);

  const brandOptions = useMemo(() => {
    const names = new Set((data?.products ?? []).map((p) => p.brandName));
    return Array.from(names).sort();
  }, [data]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / filters.limit));

  // Stay in catalog mode (view=all) instead of "/products" — that would unmount
  // this component and exit to discovery. "‹ Khám phá" (ActiveFilterBar) is the
  // dedicated way out.
  // setSearchDraft/setIngredientDraft still matter here even though the
  // render-phase resync below reacts to URL changes: if the user is mid-typing
  // and Reset is clicked before the 350ms debounce has written the draft to the
  // URL, urlQuery/urlIngredient never changed, so the resync guard sees no diff
  // and would leave the stale draft in the input. Clearing them here handles
  // that case directly.
  const handleReset = () => {
    router.push("/products?view=all");
    setSearchDraft("");
    setIngredientDraft("");
  };

  const handleAdd = (product: Product) => {
    const variant = primaryVariant(product);
    if (!variant) return;
    addToCart.mutate(
      { productVariantId: variant.id },
      {
        onSuccess: () => toast.success(`${c.added}: ${product.name}`),
        onError: showAddToCartError,
      },
    );
  };

  return (
    <div className="flex flex-col gap-4" data-testid="product-catalog">
      <ActiveFilterBar brandLabel={brandLabel} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="h-fit border-slate-200 shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Filter className="text-primary h-4 w-4" />
              {c.filters}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-primary h-8 px-2 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              {c.reset}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4">
            <FilterField label={c.searchLabel}>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder={c.searchPlaceholder}
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </FilterField>

            <FilterField label={c.category}>
              <div className="flex flex-col gap-1">
                <CategoryItem
                  active={!filters.categoryId}
                  label={c.all}
                  onClick={() => pushFilter({ categoryId: null })}
                />
                {(categories ?? []).map((option) => (
                  <CategoryItem
                    key={option.id}
                    active={filters.categoryId === option.id}
                    label={getCategoryLabel(option.name)}
                    icon={getCategoryIcon(option.name)}
                    onClick={() => pushFilter({ categoryId: option.id })}
                  />
                ))}
              </div>
            </FilterField>

            <FilterField label={c.brand}>
              <Select
                // `brandName` wins when set (the legacy filter); otherwise fall
                // back to the resolved `brandId` name so the control reflects a
                // `?brandId=` filter instead of reading "Tất cả". Leave it as ALL
                // while the brand list has not loaded yet, rather than flashing
                // the wrong value.
                value={filters.brandName ?? brandLabel ?? ALL}
                onValueChange={(v) =>
                  pushFilter({
                    brandName: v === ALL ? null : v,
                    brandId: null,
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{c.all}</SelectItem>
                  {brandOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label={c.ingredient}>
              <Input
                placeholder={c.ingredientPlaceholder}
                value={ingredientDraft}
                onChange={(e) => setIngredientDraft(e.target.value)}
                className="text-sm"
              />
            </FilterField>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {data ? `${data.total} ${"sản phẩm"}` : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : pageItems.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAdd}
                    isAdding={addToCart.isPending || session.isLoading}
                  />
                ))}
              </div>
              {!isRecommendedSection && (
                <ProductPagination
                  page={filters.page}
                  totalPages={totalPages}
                  pageSize={filters.limit}
                  onPageChange={(page) =>
                    router.push(
                      buildProductsHref(searchParams, {
                        page: page === 1 ? null : page,
                      }),
                    )
                  }
                  onPageSizeChange={(limit) =>
                    router.push(
                      buildProductsHref(searchParams, { limit, page: null }),
                    )
                  }
                />
              )}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={c.emptyTitle}
              description={c.emptyHint}
              action={{ label: c.reset, onClick: handleReset }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {children}
    </div>
  );
}

function CategoryItem({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {icon ? (
          <Image src={icon} alt="" width={20} height={20} />
        ) : (
          <Layers className="h-4 w-4 text-slate-400" />
        )}
      </span>
      {label}
    </button>
  );
}
