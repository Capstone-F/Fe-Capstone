import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ProductFilters, ProductQuery } from "../types/product.types";

/** Params that put the page into catalog mode. `section` MUST stay in this list:
 *  shop-home links to `/products?section=recommended` and `?section=newest`, and
 *  dropping it would send those links into discovery mode. */
export const CATALOG_PARAMS = [
  "categoryId",
  "brandId",
  "brandName",
  "ingredientName",
  "query",
  "view",
  "section",
] as const;

/** Filter params a patch may write. `view` is cleared automatically whenever any
 *  other filter is set, so it is patchable but rarely patched directly. */
export const FILTER_PARAMS = CATALOG_PARAMS;

export const DEFAULT_PAGE_SIZE = 8;

export type ProductFilterPatch = Partial<
  Record<(typeof FILTER_PARAMS)[number], string | null>
> & { page?: number | null; limit?: number | null };

type AnyParams = URLSearchParams | ReadonlyURLSearchParams;

function readString(params: AnyParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

function readPositiveInt(
  params: AnyParams,
  key: string,
  fallback: number,
): number {
  const parsed = Number(params.get(key));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function isCatalogMode(params: AnyParams): boolean {
  return CATALOG_PARAMS.some((key) => Boolean(readString(params, key)));
}

export function parseProductFilters(params: AnyParams): ProductFilters {
  return {
    categoryId: readString(params, "categoryId"),
    brandId: readString(params, "brandId"),
    brandName: readString(params, "brandName"),
    ingredientName: readString(params, "ingredientName"),
    query: readString(params, "query"),
    view: readString(params, "view") === "all" ? "all" : undefined,
    section: readString(params, "section"),
    page: readPositiveInt(params, "page", 1),
    limit: readPositiveInt(params, "limit", DEFAULT_PAGE_SIZE),
  };
}

/** Any patch that touches a filter key drops `page` (back to page 1), whether it
 *  sets or clears the filter. `view` is only dropped when a filter is actually
 *  SET (a non-empty value) — a clear-patch (e.g. removing a chip) must not drop
 *  `view`, or `?view=all` plus clearing the last real filter would fall out of
 *  catalog mode instead of landing back on the "all products" view. Passing
 *  `null` removes a param.
 *
 *  Once the user is in catalog mode they stay there: clearing the LAST filter
 *  falls back to `?view=all` rather than `/products`, which would unmount the
 *  catalog and drop them on the discovery page mid-browse. "‹ Khám phá" is the
 *  only way out. Links built from empty params (detail-page tags) are unaffected,
 *  since they were never in catalog mode to begin with. */
export function buildProductsHref(
  params: AnyParams,
  patch: ProductFilterPatch,
): string {
  const next = new URLSearchParams(params.toString());
  const wasCatalog = isCatalogMode(params);
  const touchesFilter = FILTER_PARAMS.some((key) => key in patch);
  const setsFilter = FILTER_PARAMS.some(
    (key) => key in patch && patch[key] != null && patch[key] !== "",
  );

  if (touchesFilter) next.delete("page");
  if (setsFilter && !("view" in patch)) next.delete("view");

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }

  if (wasCatalog && !isCatalogMode(next)) next.set("view", "all");

  const queryString = next.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

/** Filters -> the shape `productsApi.getProducts` wants. `section` and `view`
 *  are page concerns, not API params, so they are dropped here. */
export function toProductQuery(filters: ProductFilters): ProductQuery {
  return {
    categoryId: filters.categoryId,
    brandId: filters.brandId,
    brandName: filters.brandName,
    ingredientName: filters.ingredientName,
    query: filters.query,
    page: filters.page,
    limit: filters.limit,
  };
}
