export interface Ingredient {
  id: string;
  name: string;
  category?: string; // e.g. "Exfoliant", "Moisturizer", "Anti-acne"
  description?: string;
}

export interface ProductCandidate {
  productVariantId: string;
  sku: string;
  productName: string;
  variantName?: string;
  brand?: string;
  priceVnd: number;
  imageUrl?: string;
  overlapScore: number;
  matchedIngredients: string[];
}

export interface RoutineStep {
  id: string;
  order: number;
  timeOfDay: "AM" | "PM" | "BOTH";
  stepName: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  frequencyPreset: string;
  frequencyCustom?: string;
  instructionPreset: string;
  instructionCustom?: string;
}

export interface TreatmentPhase {
  id: string;
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  priceVnd?: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "DRAFT";
  targetIngredients: Ingredient[];
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  consultationId?: string;
  customerId: string;
  customerName?: string;
  expertId: string;
  expertName?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalFeeVnd: number;
  status: "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  phases: TreatmentPhase[];
  currentPhaseNumber: number;
  createdAt: string;
  updatedAt: string;
}
