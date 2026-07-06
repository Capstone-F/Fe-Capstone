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

/** Deterministic-ish mock id from timestamp (no Math.random in comments needed). */
function mockId(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `${prefix}_${stamp}`;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
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
