import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { CartSummary } from "@/types/domain";
import { useSession } from "@/features/auth/hooks/useSession";
import { cartApi } from "../api/cart.api";
import { customersApi } from "../api/customers.api";
import { productsApi } from "../api/products.api";
import {
  addGuestItem,
  readGuestCart,
  removeGuestItem,
  setGuestQty,
} from "@/features/commerce/api/guest-cart";
import {
  hydrateCart,
  indexProductVariants,
} from "@/features/commerce/mapper/cart-hydration";

let provisioned = false;
async function ensureProvisionedOnce(): Promise<void> {
  if (provisioned) return;
  try {
    const profile = await customersApi.getCustomerProfile();
    if (profile.data.customer === null) {
      await customersApi.provisionCustomer();
    }
    provisioned = true;
  } catch (error) {
    console.error("Failed to provision customer profile:", error);
  }
}

const CATALOG_PAGE_SIZE = 100;
async function getAllProducts() {
  const firstResponse = await productsApi.getProducts({
    page: 1,
    limit: CATALOG_PAGE_SIZE,
  });
  const first = firstResponse.data;
  const pageCount = Math.ceil(first.total / CATALOG_PAGE_SIZE);
  const products = first.items.map((item) => item.product);
  if (pageCount <= 1) return products;

  const restResponses = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, i) =>
      productsApi.getProducts({ page: i + 2, limit: CATALOG_PAGE_SIZE }),
    ),
  );
  return [
    ...products,
    ...restResponses.flatMap((res) =>
      res.data.items.map((item) => item.product),
    ),
  ];
}

export function useCart(): {
  data: CartSummary | undefined;
  isLoading: boolean;
  error: unknown;
} {
  const session = useSession();
  const isAuthed = Boolean(session.data);

  const itemsQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      if (isAuthed) {
        await ensureProvisionedOnce();
        const response = await cartApi.getCart();
        return response.data.items;
      }
      return readGuestCart();
    },
    enabled: !session.isLoading,
  });

  const poolQuery = useQuery({
    queryKey: queryKeys.productPool,
    queryFn: getAllProducts,
    staleTime: 60_000,
  });

  const data =
    itemsQuery.data && poolQuery.data
      ? hydrateCart(itemsQuery.data, indexProductVariants(poolQuery.data))
      : undefined;

  return {
    data,
    isLoading: session.isLoading || itemsQuery.isLoading || poolQuery.isLoading,
    error: itemsQuery.error ?? poolQuery.error,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const session = useSession();
  const isAuthed = Boolean(session.data);
  return useMutation({
    mutationFn: async ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity?: number;
    }) => {
      if (isAuthed) {
        await ensureProvisionedOnce();
        const res = await cartApi.addToCart(
          productVariantId,
          quantity ?? 1,
          "CATALOG",
        );
        return res.data.items;
      } else {
        return addGuestItem(productVariantId, quantity ?? 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();
  const session = useSession();
  const isAuthed = Boolean(session.data);
  return useMutation({
    mutationFn: async ({
      productVariantId,
      quantity,
      source,
      surveyRecommendationId,
    }: {
      productVariantId: string;
      quantity: number;
      source?: "CATALOG" | "SURVEY";
      surveyRecommendationId?: string;
    }) => {
      if (quantity <= 0) {
        if (isAuthed) {
          await ensureProvisionedOnce();
          const res = await cartApi.removeFromCart(productVariantId);
          return res.data.items;
        } else {
          return removeGuestItem(productVariantId);
        }
      }

      if (isAuthed) {
        await ensureProvisionedOnce();
        let finalSource = source;
        let finalRecId = surveyRecommendationId;

        if (!finalSource) {
          try {
            const response = await cartApi.getCart();
            finalSource = response.data.source || "CATALOG";
            finalRecId = response.data.surveyRecommendationId || undefined;
          } catch {
            finalSource = "CATALOG";
          }
        }

        const res = await cartApi.addToCart(
          productVariantId,
          quantity,
          finalSource,
          finalRecId,
        );
        return res.data.items;
      } else {
        return setGuestQty(productVariantId, quantity);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const session = useSession();
  const isAuthed = Boolean(session.data);
  return useMutation({
    mutationFn: async (productVariantId: string) => {
      if (isAuthed) {
        await ensureProvisionedOnce();
        const res = await cartApi.removeFromCart(productVariantId);
        return res.data.items;
      } else {
        return removeGuestItem(productVariantId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
export { getAllProducts };
