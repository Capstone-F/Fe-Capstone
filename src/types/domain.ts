export interface Expert {
  id: string;
  name: string;
  title: string;
  clinic: string;
  rating: number;
  reviews: number;
  fee: number;
  specialties: string[];
  avatar?: string;
  bio?: string;
  distance?: number; // in km
}

export interface TimeSlot {
  id: string;
  expertId: string;
  dateTime: string; // ISO string
  isBooked: boolean;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  expertName: string;
  userId: string;
  slotId: string;
  dateTime: string;
  symptoms: string;
  status: "pending" | "confirmed" | "cancelled" | "paid";
  amount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  allergies: string[];
  baumannCode?: string;
}

export interface SurveyAnswers {
  baumannOilyDry: "O" | "D" | "";
  baumannSensitiveResistant: "S" | "R" | "";
  baumannPigmentNon: "P" | "N" | "";
  baumannWrinkleTight: "W" | "T" | "";
  hydration: 0 | 25 | 50 | 75 | 100 | "";
  currentRoutineProducts: string;
  currentActiveIngredients: string[];
  morningRoutineText: string;
  eveningRoutineText: string;
  irritationStatus: "none" | "mild" | "redness" | "burning" | "itchy" | "";
  treatmentGoals: string[];
  primaryConcern: string;
  pregnancy: "yes" | "no" | "declined" | "";
  breastfeeding: "yes" | "no" | "declined" | "";
  menstruation: "yes" | "no" | "declined" | "";
  hormonalChanges: "yes" | "no" | "declined" | "";
  otherDermatology: "yes" | "no" | "declined" | "";
  prescriptionMeds: "yes" | "no" | "declined" | "";
  photoUploaded: boolean;
  photoFile: string | null;
}

export interface SurveyRecord {
  id: string;
  userId: string;
  baumannCode: string;
  answers: SurveyAnswers;
  createdAt: string;
}

// ----- E-commerce domain -----

export interface ProductVariant {
  id: string;
  sku: string;
  volume: string | null;
  packaging: string | null;
  priceVnd: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredient {
  name: string;
  concentrationPct: number | null;
  isKeyIngredient: boolean;
}

export interface ProductDetail {
  product: Product;
  ingredients: ProductIngredient[];
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
}

export interface CartItem {
  productVariantId: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  /** productVariantIds present in the cart but not resolvable against the
   * fetched product pool (see cart-hydration.ts) — surfaced, not silently
   * dropped. */
  unresolvedVariantIds: string[];
}

export type PaymentMethod = "vnpay" | "cod";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line: string; // street + ward
  city: string;
}

export type DeliveryType = "STANDARD" | "EXPRESS" | "SAME_DAY";

/** A priced shipping option from GET /delivery/options. */
export interface DeliveryOption {
  providerId: string;
  providerCode: string;
  providerName: string;
  type: DeliveryType;
  feeVnd: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderSource = "SURVEY" | "CATALOG";

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
  source: OrderSource;
  subtotalVnd: number;
  discountVnd: number;
  discountType: string | null;
  shippingFeeVnd: number;
  totalVnd: number;
  items: OrderItem[];
  createdAt: string;
}

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
  amountVnd: string; // BE bigint column serializes as string
  paidAt: string | null;
}
