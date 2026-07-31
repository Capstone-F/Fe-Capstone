/** GHN master data, mapped out of the provider's PascalCase wire format. */
export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export interface Ward {
  code: string;
  name: string;
  districtId: number;
}

/**
 * A complete GHN shipping address, ready for POST /orders and POST /delivery/fee-quote.
 * The three location fields must come from the GHN master-data endpoints — free text
 * cannot be turned into a valid GHN order.
 */
export interface ShippingAddressInput {
  recipientName: string;
  recipientPhone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  streetAddress: string;
}

/** The in-progress form state, before the cascading selects have all been answered. */
export interface ShippingAddressDraft {
  recipientName: string;
  recipientPhone: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  streetAddress: string;
}

export type DeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface DeliveryStatusEvent {
  /** Raw GHN status, e.g. "delivering". */
  providerStatus: string;
  occurredAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  /** GHN order_code. Null until the payment IPN has created the GHN order. */
  providerOrderCode: string | null;
  shippingFeeVnd: number;
  expectedDeliveryTime: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  recipientName: string | null;
  streetAddress: string | null;
  statusEvents: DeliveryStatusEvent[];
}
