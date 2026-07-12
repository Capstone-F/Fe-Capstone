import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import {
  CartSummary,
  Order,
  PaymentMethod,
  ShippingAddress,
} from "@/types/domain";
import { clearCart } from "./cart-client";

export const ORDER_API_PATHS = {
  CREATE_ORDER: "/orders",
  GET_ORDER_DETAIL: (id: string) => `/orders/${id}`,
};

export interface CreateOrderInput {
  summary: CartSummary;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
}

// --- Backend response types (matching BE DTOs) ---

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

// --- Checkout response from VNPay ---
export interface CheckoutResponse {
  paymentId: string;
  paymentUrl: string;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Create an order from the current cart.
 * Backend: POST /orders — creates a PENDING order from the active Redis cart.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (appConfig.useMockApi) {
    return createOrderMock(input);
  }

  // Backend creates order from the server-side cart (Redis).
  // No body needed — cart is identified by session cookie.
  const backendOrder = await apiJson<OrderResponse>("/orders", {
    method: "POST",
  });

  // Clear the client-side cart mirror
  await clearCart();

  // Map backend response to FE Order shape
  return {
    id: backendOrder.id,
    createdAt: backendOrder.createdAt,
    lines: input.summary.lines, // Keep the rich FE cart lines for display
    subtotal: backendOrder.subtotalVnd,
    shippingFee: 0, // Shipping is handled separately in the backend
    total: backendOrder.totalVnd,
    paymentMethod: input.paymentMethod,
    address: input.address,
    status: backendOrder.status as Order["status"],
    trackingNumber: "",
    carrier: "GHN",
  };
}

/**
 * Initiate VNPay checkout for a pending order.
 * Backend: POST /payments/checkout — returns the VNPay redirect URL.
 */
export async function checkoutVnpay(
  orderId: string,
): Promise<CheckoutResponse> {
  return apiJson<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: { orderId, client: "web" },
  });
}

/**
 * Fetch a single order by ID.
 */
export async function getOrder(id: string): Promise<OrderResponse> {
  return apiJson<OrderResponse>(`/orders/${id}`);
}

// ============================================================
// MOCK implementation (localStorage — kept for dev/demo)
// ============================================================

function mockId(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `${prefix}_${stamp}`;
}

async function createOrderMock(input: CreateOrderInput): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const { summary, paymentMethod, address } = input;
  const order: Order = {
    id: mockId("ORD"),
    createdAt: new Date().toISOString(),
    lines: summary.lines,
    subtotal: summary.subtotal,
    shippingFee: summary.shippingFee,
    total: summary.total,
    paymentMethod,
    address,
    status: paymentMethod === "cod" ? "created" : "paid",
    trackingNumber: mockId("TRK"),
    carrier: "GHN",
  };
  await clearCart();
  return order;
}
