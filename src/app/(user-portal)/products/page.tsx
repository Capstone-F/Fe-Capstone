"use client";

import { useState } from "react";
import {
  Filter,
  RefreshCw,
  PackageSearch,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Product, ProductCategory } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import {
  useFilterMeta,
  useProducts,
  useRecommended,
} from "@/features/commerce/hooks/use-products";
import { useAddToCart } from "@/features/commerce/hooks/use-cart";
import { ProductSort } from "@/features/commerce/api/products-client";
import { ProductCard } from "@/features/commerce/components/product-card";
import { ProductCardSkeleton } from "@/features/commerce/components/product-card-skeleton";
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

const c = vi.commerce.products;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [skinType, setSkinType] = useState("Tất cả");
  const [concern, setConcern] = useState("Tất cả");
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sort, setSort] = useState<ProductSort>("featured");

  const filters = {
    search: search || undefined,
    category: category !== "Tất cả" ? (category as ProductCategory) : undefined,
    brand: brand !== "Tất cả" ? brand : undefined,
    skinType: skinType !== "Tất cả" ? skinType : undefined,
    concern: concern !== "Tất cả" ? concern : undefined,
    maxPrice,
    sort,
  } as const;

  const { data: products, isLoading } = useProducts(filters);
  const { data: recommended } = useRecommended();
  const { data: meta } = useFilterMeta();
  const addToCart = useAddToCart();

  const handleReset = () => {
    setSearch("");
    setCategory("Tất cả");
    setBrand("Tất cả");
    setSkinType("Tất cả");
    setConcern("Tất cả");
    setMaxPrice(1000000);
    setSort("featured");
  };

  const handleAdd = (product: Product) => {
    addToCart.mutate(
      { productId: product.id },
      { onSuccess: () => toast.success(`${c.added}: ${product.name}`) },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {c.title}
        </h2>
        <p className="text-muted-foreground text-sm">{c.subtitle}</p>
      </div>

      {recommended && recommended.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="text-primary flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" />
            {c.recommendedTitle}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAdd}
                isAdding={addToCart.isPending}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Filters */}
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

            <FilterSelect
              label={c.category}
              value={category}
              onChange={setCategory}
              options={meta?.categories ?? []}
            />
            <FilterSelect
              label={c.brand}
              value={brand}
              onChange={setBrand}
              options={meta?.brands ?? []}
            />
            <FilterSelect
              label={c.skinType}
              value={skinType}
              onChange={setSkinType}
              options={meta?.skinTypes ?? []}
            />
            <FilterSelect
              label={c.concern}
              value={concern}
              onChange={setConcern}
              options={meta?.concerns ?? []}
            />

            <FilterField
              label={`${c.maxPrice}: ${maxPrice.toLocaleString("vi-VN")}đ`}
            >
              <input
                type="range"
                min={100000}
                max={1000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
              />
            </FilterField>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex flex-col gap-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {products
                ? `${products.length} ${vi.commerce.cart.itemsCount}`
                : ""}
            </span>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as ProductSort)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder={c.sort} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{c.sortFeatured}</SelectItem>
                <SelectItem value="price_asc">{c.sortPriceAsc}</SelectItem>
                <SelectItem value="price_desc">{c.sortPriceDesc}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAdd}
                  isAdding={addToCart.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <PackageSearch className="mb-3 h-12 w-12 text-slate-300" />
              <p className="font-bold text-slate-700">{c.emptyTitle}</p>
              <p className="mt-1 text-xs">{c.emptyHint}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-4 text-xs"
              >
                {c.reset}
              </Button>
            </div>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <FilterField label={label}>
      <Select value={value} onValueChange={(v) => onChange(v || "Tất cả")}>
        <SelectTrigger className="text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Tất cả">{vi.commerce.products.all}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  );
}
