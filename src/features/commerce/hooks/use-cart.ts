import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { CartSummary } from "@/types/domain";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  updateQuantity,
} from "../api/cart-client";
import {
  addGuestItem,
  readGuestCart,
  removeGuestItem,
  setGuestQty,
} from "@/features/commerce/api/guest-cart";
import { getProducts } from "../api/products-client";
import {
  hydrateCart,
  indexProductVariants,
} from "@/features/commerce/mapper/cart-hydration";

const CART_PRODUCT_POOL_LIMIT = 100; // Be-Capstone's own max `limit` value

export function useCart(): {
  data: CartSummary | undefined;
  isLoading: boolean;
  error: unknown;
} {
  const session = useSession();
  const isAuthed = Boolean(session.data);

  // Gate the cart read until we know the auth state, so the first fetch uses
  // the correct source (server vs localStorage) and doesn't flicker.
  const itemsQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: isAuthed ? getCartItems : () => Promise.resolve(readGuestCart()),
    enabled: !session.isLoading,
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
    isLoading: session.isLoading || itemsQuery.isLoading || poolQuery.isLoading,
    error: itemsQuery.error ?? poolQuery.error,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const session = useSession();
  const isAuthed = Boolean(session.data);
  return useMutation({
    mutationFn: ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity?: number;
    }) =>
      isAuthed
        ? addToCart(productVariantId, quantity)
        : Promise.resolve(addGuestItem(productVariantId, quantity ?? 1)),
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
    mutationFn: ({
      productVariantId,
      quantity,
    }: {
      productVariantId: string;
      quantity: number;
    }) =>
      isAuthed
        ? updateQuantity(productVariantId, quantity)
        : Promise.resolve(setGuestQty(productVariantId, quantity)),
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
    mutationFn: (productVariantId: string) =>
      isAuthed
        ? removeFromCart(productVariantId)
        : Promise.resolve(removeGuestItem(productVariantId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
