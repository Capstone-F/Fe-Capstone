import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ordersApi, type OrderResponse } from "../api/orders.api";
import type { ShippingAddressInput } from "../types/delivery";
import type { Order } from "@/types/domain";

function toOrder(response: OrderResponse): Order {
  return {
    id: response.id,
    status: response.status as Order["status"],
    source: response.source as Order["source"],
    subtotalVnd: response.subtotalVnd,
    discountVnd: response.discountVnd,
    discountType: response.discountType,
    shippingFeeVnd: response.shippingFeeVnd,
    totalVnd: response.totalVnd,
    items: response.items.map((item) => ({
      id: item.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPriceVnd: item.unitPriceVnd,
      lineTotalVnd: item.lineTotalVnd,
    })),
    createdAt: response.createdAt,
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    // The address is required: it is what locks shippingFeeVnd onto the order and
    // creates the Delivery row the payment step needs.
    mutationFn: async (shippingAddress: ShippingAddressInput) => {
      const response = await ordersApi.createOrder(shippingAddress);
      return toOrder(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersAll });
    },
  });
}
