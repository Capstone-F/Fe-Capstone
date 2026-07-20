import { apiJson } from "@/lib/api/client";
import { Order, OrderStatus } from "@/types/domain";

export const ORDER_API_PATHS = {
  CREATE_ORDER: "/orders",
  LIST_ORDERS: "/orders",
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
  shippingFeeVnd: number;
  totalVnd: number;
  items: OrderItemResponse[];
  createdAt: string;
}

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

interface PaginatedOrdersResponse {
  items: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ListOrdersQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface OrdersPage {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

/**
 * List the session user's own orders. Be-Capstone scopes this to the caller's
 * customer row and always sorts createdAt DESC — there is no sort param.
 */
export async function getOrders(query?: ListOrdersQuery): Promise<OrdersPage> {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  params.set("page", String(query?.page ?? 1));
  params.set("limit", String(query?.limit ?? 10));

  const response = await apiJson<PaginatedOrdersResponse>(
    `${ORDER_API_PATHS.LIST_ORDERS}?${params.toString()}`,
  );

  return {
    orders: response.items.map(toOrder),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}
