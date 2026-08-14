"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useProduct } from "@/features/commerce/hooks/useProducts";
import { useAddToCart } from "@/features/commerce/hooks/useCart";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import { resolveProductImageUrls } from "@/features/commerce/mapper/product-image";
import { formatVnd } from "@/shared/utils/format";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";
import {
  buildProductsHref,
  type ProductFilterPatch,
} from "@/features/commerce/lib/product-filters";
import { ProductImageGallery } from "@/features/commerce/components/product-image-gallery";
import { RelatedProducts } from "@/features/commerce/components/related-products";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/domain";
import { showAddToCartError } from "@/features/commerce/lib/cart-errors";
import { trackCommerceEvent } from "@/features/commerce/lib/commerce-analytics";

const d = {
  quantity: "Số lượng",
  ingredients: "Thành phần",
  description: "Mô tả",
  noDescription: "Sản phẩm này chưa có mô tả.",
  noIngredients: "Chưa có thông tin thành phần.",
  related: "Sản phẩm liên quan",
  relatedInCategory: "Sản phẩm cùng danh mục",
  backToShop: "Quay lại cửa hàng",
  breadcrumbHome: "Trang chủ",
  breadcrumbShop: "Sản phẩm",
  variantLabel: "Phân loại",
  sku: "Mã SKU",
  keyIngredients: "Thành phần chính",
  seeCategory: (name: string) => `Xem sản phẩm thuộc danh mục ${name}`,
  seeBrand: (name: string) => `Xem sản phẩm của thương hiệu ${name}`,
  seeVolume: (volume: string) => `Tìm sản phẩm dung tích ${volume}`,
  seeIngredient: (name: string) => `Xem sản phẩm chứa ${name}`,
  trustGenuine: "Chính hãng",
  trustShipping: "Miễn phí vận chuyển",
  trustReturn: "Đổi trả trong 7 ngày",
};

function variantLabel(variant: ProductVariant): string {
  return (
    [variant.volume, variant.packaging].filter(Boolean).join(" · ") ||
    variant.sku
  );
}

/**
 * Detail-page tags link into a freshly filtered catalog, so they build from
 * empty params — nothing about the product being viewed should leak in.
 */
function catalogHref(patch: ProductFilterPatch): string {
  return buildProductsHref(new URLSearchParams(), patch);
}

/**
 * A product attribute rendered as a link into the filtered catalog. The shared
 * transition + focus ring is what tells the user these tags are clickable at
 * all; each caller supplies its own resting and hover colours.
 */
function TagLink({
  href,
  title,
  className,
  children,
}: {
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={cn(
        "focus-visible:ring-primary inline-flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const { data: detail, isLoading } = useProduct(id);
  const addToCart = useAddToCart();
  const session = useSession();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!detail) return;
    trackCommerceEvent({
      eventType: "PRODUCT_VIEWED",
      productId: detail.product.id,
      productVariantId: primaryVariant(detail.product)?.id,
    });
  }, [detail]);

  if (isLoading || !detail) {
    return <DetailSkeleton />;
  }

  const { product, ingredients } = detail;

  const userAllergies = profile?.allergies ?? [];
  const allergicIngredients = ingredients.filter((ing) =>
    userAllergies.some((a) => ing.name.toLowerCase().includes(a.toLowerCase())),
  );

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    primaryVariant(product);
  const categoryIcon = getCategoryIcon(product.categoryName);
  const keyIngredients = ingredients.filter((i) => i.isKeyIngredient);
  const productImages = resolveProductImageUrls(product.variants);

  const handleAdd = () => {
    if (!selectedVariant) return;
    addToCart.mutate(
      { productVariantId: selectedVariant.id, quantity },
      {
        onSuccess: () => {
          trackCommerceEvent({
            eventType: "ADDED_TO_CART",
            productId: product.id,
            productVariantId: selectedVariant.id,
          });
          toast.success(`${"Đã thêm vào giỏ"}: ${product.name}`);
        },
        onError: showAddToCartError,
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <nav className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <Link href="/" className="hover:text-primary">
          {d.breadcrumbHome}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-primary">
          {d.breadcrumbShop}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 font-medium text-slate-700">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProductImageGallery
          images={productImages}
          categoryName={product.categoryName}
          selectedImageUrl={selectedVariant?.imageUrl ?? null}
          selectedVariantId={selectedVariantId}
        />

        <div className="flex h-fit flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <TagLink
                href={catalogHref({ categoryId: product.categoryId })}
                title={d.seeCategory(getCategoryLabel(product.categoryName))}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              >
                {categoryIcon && (
                  <Image src={categoryIcon} alt="" width={14} height={14} />
                )}
                {getCategoryLabel(product.categoryName)}
              </TagLink>
              <TagLink
                // brandId is an exact FK match; brandName would be a fuzzy ILIKE.
                href={catalogHref({ brandId: product.brandId })}
                title={d.seeBrand(product.brandName)}
                className="text-muted-foreground hover:text-primary text-xs font-semibold tracking-wide uppercase underline-offset-4 hover:underline"
              >
                {product.brandName}
              </TagLink>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="text-primary text-2xl font-bold">
              {selectedVariant ? formatVnd(selectedVariant.priceVnd) : "—"}
            </p>
          </div>

          {allergicIngredients.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <span className="font-bold">⚠️ Cảnh báo Dị Ứng Cá Nhân:</span> Sản
              phẩm này chứa thành phần (
              {allergicIngredients.map((i) => i.name).join(", ")}) trùng với
              danh mục dị ứng trong Hồ sơ Da của bạn!
            </div>
          )}

          {product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {d.variantLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    aria-pressed={selectedVariant?.id === v.id}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      selectedVariant?.id === v.id
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-slate-200 text-slate-700 hover:border-slate-300",
                    )}
                  >
                    {variantLabel(v)}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>
                    {d.sku}: {selectedVariant.sku}
                  </span>
                  {/* The variant chips above are selectors, so volume gets its
                      own tag here — a chip cannot both switch variant and
                      navigate away. */}
                  {selectedVariant.volume ? (
                    <TagLink
                      href={catalogHref({ query: selectedVariant.volume })}
                      title={d.seeVolume(selectedVariant.volume)}
                      className="hover:border-primary hover:text-primary rounded-full border border-slate-200 px-2 py-0.5 font-medium"
                    >
                      {selectedVariant.volume}
                    </TagLink>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">
              {d.quantity}
            </span>
            <div className="flex items-center rounded-lg border border-slate-200">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            disabled={
              !selectedVariant || addToCart.isPending || session.isLoading
            }
            onClick={handleAdd}
            className="rounded-lg font-semibold"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {"Thêm vào giỏ"}
          </Button>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="text-primary h-4 w-4" />
              {d.trustGenuine}
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="text-primary h-4 w-4" />
              {d.trustShipping}
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="text-primary h-4 w-4" />
              {d.trustReturn}
            </span>
          </div>
        </div>
      </div>

      {keyIngredients.length > 0 && (
        <Card className="border-slate-200 p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">
            {d.keyIngredients}
          </h2>
          <div className="flex flex-wrap gap-2">
            {keyIngredients.map((ingredient) => (
              <TagLink
                key={ingredient.name}
                href={catalogHref({ ingredientName: ingredient.name })}
                title={d.seeIngredient(ingredient.name)}
                className="bg-primary-soft text-primary hover:bg-primary rounded-full px-3 py-1.5 text-sm font-semibold hover:text-white"
              >
                {ingredient.name}
                {ingredient.concentrationPct !== null
                  ? ` ${ingredient.concentrationPct}%`
                  : ""}
              </TagLink>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">{d.description}</TabsTrigger>
          <TabsTrigger value="ingredients">{d.ingredients}</TabsTrigger>
        </TabsList>
        <TabsContent
          value="description"
          className="text-sm leading-relaxed text-slate-700"
        >
          {product.description || d.noDescription}
        </TabsContent>
        <TabsContent value="ingredients">
          <div className="flex flex-wrap gap-2">
            {ingredients.length === 0 && (
              <span className="text-muted-foreground text-sm">
                {d.noIngredients}
              </span>
            )}
            {ingredients.map((ingredient) => (
              <TagLink
                key={ingredient.name}
                href={catalogHref({ ingredientName: ingredient.name })}
                title={d.seeIngredient(ingredient.name)}
                className={
                  ingredient.isKeyIngredient
                    ? "bg-primary-soft text-primary hover:bg-primary rounded-full px-3 py-1 text-xs font-bold hover:text-white"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }
              >
                {ingredient.name}
                {ingredient.concentrationPct !== null
                  ? ` ${ingredient.concentrationPct}%`
                  : ""}
              </TagLink>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <RelatedProducts
        categoryId={product.categoryId}
        currentProductId={product.id}
      />

      <Link
        href="/products"
        className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        {d.backToShop}
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Skeleton className="h-4 w-48 bg-slate-300" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl bg-slate-300" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24 bg-slate-300" />
          <Skeleton className="h-8 w-3/4 bg-slate-300" />
          <Skeleton className="h-6 w-32 bg-slate-300" />
          <Skeleton className="h-20 w-full bg-slate-300" />
          <Skeleton className="h-10 w-full rounded-lg bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
