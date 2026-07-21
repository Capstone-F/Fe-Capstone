export type DeliveryType = "STANDARD" | "EXPRESS" | "SAME_DAY";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line: string;
  city: string;
}

export interface DeliveryOption {
  providerId: string;
  providerCode: string;
  providerName: string;
  type: DeliveryType;
  feeVnd: number;
}
