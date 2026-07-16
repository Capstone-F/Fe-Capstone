import { apiJson } from "@/lib/api/client";
import { Order } from "@/types/domain";

export const ORDER_API_PATHS = {
  CREATE_ORDER: "/orders",
  GET_ORDER_DETAIL: (id: string) => `/orders/${id}`,
};

interface OrderItemResponse {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPriceVnd: number;
  lineTotalVnd: number;
  surveyRecommendationItemId: string | null;
}

interface OrderResponse {
  id: string;
  status: string;
  source: string;
  customerSurveyId: string | null;
  surveyRecommendationId: string | null;
  subtotalVnd: number;
  discountVnd: number;
  discountType: string | null;
  totalVnd: number;
  items: OrderItemResponse[];
  createdAt: string;
}

function toOrder(response: OrderResponse): Order {
  return {
    id: response.id,
    status: response.status as Order["status"],
    subtotalVnd: response.subtotalVnd,
    discountVnd: response.discountVnd,
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

/** Be-Capstone creates the order from the session's server-side cart — no body. */
export async function createOrder(): Promise<Order> {
  const response = await apiJson<OrderResponse>(ORDER_API_PATHS.CREATE_ORDER, {
    method: "POST",
  });
  return toOrder(response);
}

export async function getOrder(id: string): Promise<Order> {
  const response = await apiJson<OrderResponse>(
    ORDER_API_PATHS.GET_ORDER_DETAIL(id),
  );
  return toOrder(response);
}
