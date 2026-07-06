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

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type ProductCategory =
  | "Cleanser"
  | "Toner"
  | "Serum"
  | "Moisturizer"
  | "Sunscreen"
  | "Mask";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  priceVnd: number;
  images: string[]; // placeholder urls
  shortDescription: string;
  description: string;
  ingredients: string[]; // ingredient slugs, e.g. "retinol", "niacinamide"
  activeIngredient?: string; // primary active slug
  concentration?: string; // e.g. "5%"
  skinTypes: string[]; // e.g. ["Da dầu", "Da hỗn hợp"]
  concerns: string[]; // e.g. ["Mụn", "Thâm"]
  goals: string[]; // e.g. ["Giảm mụn"]
  howToUse: string;
  rating: number;
  reviews: number;
  stockStatus: StockStatus;
  quantityOnHand: number;
  matchesUserSkin?: boolean; // drives the "Hợp da bạn" badge
  previouslyPurchased?: boolean; // drives the "Đã mua trước đây" badge
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface IngredientConflict {
  a: string;
  b: string;
  productA: string;
  productB: string;
  reason: string;
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export type PaymentMethod = "vnpay" | "cod";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line: string; // street + ward
  city: string;
}

export type OrderStatus =
  | "created"
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  createdAt: string; // ISO
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  status: OrderStatus;
  trackingNumber: string;
  carrier: "GHN" | "GHTK";
}
