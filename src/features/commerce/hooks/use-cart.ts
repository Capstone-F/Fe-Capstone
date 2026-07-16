import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { CartSummary } from "@/types/domain";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  updateQuantity,
} from "../api/cart-client";
import { getProducts } from "../api/products-client";
import { hydrateCart, indexProductVariants } from "../lib/cart-hydration";

const CART_PRODUCT_POOL_LIMIT = 100; // Be-Capstone's own max `limit` value

export function useCart(): {
  data: CartSummary | undefined;
  isLoading: boolean;
  error: unknown;
} {
  const itemsQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCartItems,
  });
  const poolQuery = useQuery({
    queryKey: queryKeys.productPool,
    queryFn: () => getProducts({ limit: CART_PRODUCT_POOL_LIMIT }),
    staleTime: 60_000,
  });

  const data =
    itemsQuery.data && poolQuery.data
      ? hydrateCart(
          itemsQuery.data,
          indexProductVariants(poolQuery.data.products),
        )
      : undefined;

  return {
    data,
    isLoading: itemsQuery.isLoading || poolQuery.isLoading,
    error: itemsQuery.error ?? poolQuery.error,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity?: number;
    }) => addToCart(productVariantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity: number;
    }) => updateQuantity(productVariantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productVariantId: string) => removeFromCart(productVariantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
