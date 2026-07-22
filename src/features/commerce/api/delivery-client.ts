import { apiJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { DeliveryOption, DeliveryType, Order } from "@/types/domain";

interface DeliveryOptionResponse {
  providerId: string;
  providerCode: string;
  providerName: string;
  type: DeliveryType;
  feeVnd: number;
}

interface OrderResponse {
  id: string;
  status: string;
  source: string;
  subtotalVnd: number;
  discountVnd: number;
  discountType: string | null;
  shippingFeeVnd: number;
  totalVnd: number;
  items: {
    id: string;
    productVariantId: string;
    quantity: number;
    unitPriceVnd: number;
    lineTotalVnd: number;
  }[];
  createdAt: string;
}

export interface AttachDeliveryInput {
  providerId: string;
  type: DeliveryType;
  shippingAddress: string;
}

/** List active, priced shipping options (provider + type + feeVnd). */
export async function getDeliveryOptions(): Promise<DeliveryOption[]> {
  return apiJson<DeliveryOptionResponse[]>(API_ENDPOINTS.DELIVERY.OPTIONS);
}

/**
 * Attach a shipping selection to a PENDING order. Be-Capstone requires this
 * before POST /payments/checkout — without it, checkout returns 400 and the
 * VNPay URL is never created. Returns the order with recomputed totalVnd.
 */
export async function attachDelivery(
  orderId: string,
  input: AttachDeliveryInput,
): Promise<Order> {
  const response = await apiJson<OrderResponse>(
    API_ENDPOINTS.DELIVERY.ATTACH(orderId),
    { method: "POST", body: input },
  );
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
