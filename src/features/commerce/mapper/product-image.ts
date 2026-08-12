import { Product, ProductVariant } from "@/types/domain";

/**
 * Product images live on the variants, not the product: BE stores `imageUrl` per
 * `product_variants` row. These two resolvers mirror `Mo-Capstone`'s
 * `features/shop/mappers/product.mapper.ts` so web and mobile pick the same image.
 */

/**
 * Every distinct image across a product's variants, in variant order.
 * De-duplicated: variants of one product usually share a single photo, and
 * without the Set the gallery would page through identical images.
 */
export function resolveProductImageUrls(variants: ProductVariant[]): string[] {
  return Array.from(
    new Set(
      variants
        .map((variant) => variant.imageUrl?.trim())
        .filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
    ),
  );
}

/**
 * The single image that represents the product in lists and cards: the active
 * variant's photo when there is one, else any variant's photo, else nothing —
 * callers fall back to the category placeholder.
 */
export function resolvePrimaryProductImageUrl(
  variants: ProductVariant[],
): string | null {
  const activeWithImage = variants.find(
    (variant) => variant.isActive && variant.imageUrl?.trim(),
  );
  if (activeWithImage?.imageUrl) return activeWithImage.imageUrl.trim();

  const firstWithImage = variants.find((variant) => variant.imageUrl?.trim());
  return firstWithImage?.imageUrl?.trim() ?? null;
}

/**
 * The image for a line that names one specific variant — a cart line or an order
 * item. The bought variant's own photo wins; a sibling variant's photo is a better
 * stand-in than the category icon when that variant has none.
 */
export function resolveLineImageUrl(
  variant: ProductVariant | null,
  product: Product | null,
): string | null {
  const own = variant?.imageUrl?.trim();
  if (own) return own;
  return product ? resolvePrimaryProductImageUrl(product.variants) : null;
}
