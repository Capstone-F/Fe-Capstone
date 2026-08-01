import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/commerce/api/products.api";
import { queryKeys } from "@/lib/query/keys";

/** A same-category alternative shown under a low-stock product. */
export interface SimilarProduct {
  productId: string;
  name: string;
  /** Cheapest signal available: the first active variant's price. Null if unsellable. */
  priceVnd: number | null;
}

const SUGGESTION_FETCH_LIMIT = 4;
const SUGGESTION_DISPLAY_LIMIT = 3;

/**
 * Same-category alternatives for a product the user is running out of.
 *
 * Deliberately lazy: `enabled` stays false until the user expands the suggestions
 * section, so a dialog listing several low-stock products does not fan out into
 * twice as many requests on open.
 */
export function useSimilarProducts(productId: string | null, enabled: boolean) {
  return useQuery<SimilarProduct[]>({
    queryKey: queryKeys.products({ similarTo: productId }),
    queryFn: async () => {
      const detail = await productsApi.getProductById(productId as string);
      const { categoryId } = detail.data.product;

      const siblings = await productsApi.getProducts({
        categoryId,
        limit: SUGGESTION_FETCH_LIMIT,
      });

      return siblings.data.items
        .map((item) => item.product)
        .filter((product) => product.id !== productId)
        .slice(0, SUGGESTION_DISPLAY_LIMIT)
        .map((product) => ({
          productId: product.id,
          name: product.name,
          priceVnd:
            product.variants.find((candidate) => candidate.isActive)
              ?.priceVnd ?? null,
        }));
    },
    enabled: enabled && productId !== null,
    staleTime: 60_000,
  });
}
