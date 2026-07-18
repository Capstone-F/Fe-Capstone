"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Filter, RefreshCw, PackageSearch, Search, Layers } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import {
  useCategories,
  useProducts,
} from "@/features/commerce/hooks/use-products";
import { useAddToCart } from "@/features/commerce/hooks/use-cart";
import { primaryVariant } from "@/features/commerce/lib/variant";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/lib/category-mapper";
import { ProductCard } from "@/features/commerce/components/product-card";
import { ProductCardSkeleton } from "@/features/commerce/components/product-card-skeleton";
import { ProductPagination } from "@/features/commerce/components/product-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const c = vi.commerce.products;
const ALL = "Tất cả";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [brand, setBrand] = useState(ALL);
  const [ingredient, setIngredient] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const { data: categories } = useCategories();

  // Every filter maps 1:1 to a real Be-Capstone ListProductsQueryDto param —
  // filtering and pagination happen server-side (BE has no price/sort param).
  const queryFilters = {
    categoryId: categoryId !== ALL ? categoryId : undefined,
    brandName: brand !== ALL ? brand : undefined,
    ingredientName: ingredient || undefined,
    query: search || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading } = useProducts(queryFilters);
  const addToCart = useAddToCart();

  const filterKey = `${search}|${categoryId}|${brand}|${ingredient}|${pageSize}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    if (page !== 1) setPage(1);
  }

  const pageItems = data?.products ?? [];

  // No "list brands" endpoint exists — options are derived from the
  // currently-fetched page only (accepted limitation, design doc §2).
  const brandOptions = useMemo(() => {
    const names = new Set((data?.products ?? []).map((p) => p.brandName));
    return Array.from(names).sort();
  }, [data]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  const handleReset = () => {
    setSearch("");
    setCategoryId(ALL);
    setBrand(ALL);
    setIngredient("");
  };

  const handleAdd = (product: Product) => {
    const variant = primaryVariant(product);
    if (!variant) return;
    addToCart.mutate(
      { productVariantId: variant.id },
      { onSuccess: () => toast.success(`${c.added}: ${product.name}`) },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {c.title}
        </h2>
        <p className="text-muted-foreground text-sm">{c.subtitle}</p>
      </div>

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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </FilterField>

            <FilterField label={c.category}>
              <div className="flex flex-col gap-1">
                <CategoryItem
                  active={categoryId === ALL}
                  label={c.all}
                  onClick={() => setCategoryId(ALL)}
                />
                {(categories ?? []).map((option) => (
                  <CategoryItem
                    key={option.id}
                    active={categoryId === option.id}
                    label={getCategoryLabel(option.name)}
                    icon={getCategoryIcon(option.name)}
                    onClick={() => setCategoryId(option.id)}
                  />
                ))}
              </div>
            </FilterField>

            <FilterField label={c.brand}>
              <Select value={brand} onValueChange={(v) => setBrand(v || ALL)}>
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
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="text-sm"
              />
            </FilterField>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {data ? `${data.total} ${vi.commerce.cart.itemsCount}` : ""}
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
                    isAdding={addToCart.isPending}
                  />
                ))}
              </div>
              <ProductPagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
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
