export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPriceVnd: number;
  lineTotalVnd: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotalVnd: number;
  discountVnd: number;
  totalVnd: number;
  items: OrderItem[];
  createdAt: string;
}

export type PaymentMethod = "vnpay" | "cod";

export type PaymentStatusValue =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface PaymentStatus {
  id: string;
  orderId: string;
  status: PaymentStatusValue;
  provider: "VNPAY";
  amountVnd: string;
  paidAt: string | null;
}
