export type TreatmentStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type TreatmentPhaseType =
  | "INITIAL_ASSESSMENT"
  | "ACTIVE_TREATMENT"
  | "MAINTENANCE"
  | "RECOVERY";

export type TreatmentPhaseStatus = "PENDING" | "ACTIVE" | "COMPLETED";

export type TreatmentEventType =
  | "CONSULTATION"
  | "PROGRESS_PHOTO"
  | "MEDICATION_CHANGE"
  | "INGREDIENT_OVERRIDE"
  | "MILESTONE"
  | "FOLLOW_UP";

export interface Ingredient {
  id: string;
  name: string;
  code?: string;
  category?: string;
  description?: string | null;
}

export interface ProductCandidate {
  productVariantId: string;
  productId: string;
  productName: string;
  sku: string;
  priceVnd: number;
  matchScore: number;
  matchedIngredientIds: string[];
  stockQuantity: number;
}

export interface TreatmentPhaseIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
}

export interface TreatmentPhaseProduct {
  id: string;
  productVariantId: string;
  matchScore: number | null;
  productName: string | null;
  sku: string | null;
  priceVnd: number | null;
}

export interface TreatmentRoutineSummary {
  id: string;
  title: string;
  status: string;
  type: string;
}

export interface TreatmentPhase {
  id: string;
  treatmentId: string;
  phaseType: TreatmentPhaseType;
  phaseOrder: number;
  title: string | null;
  goals: string | null;
  notes: string | null;
  noteByExpert: string | null;
  priceVnd: number;
  status: TreatmentPhaseStatus;
  startDate: string | null;
  endDate: string | null;
  ingredients: TreatmentPhaseIngredient[];
  products: TreatmentPhaseProduct[];
  routines: TreatmentRoutineSummary[];
}

export interface TreatmentPlan {
  id: string;
  customerId: string;
  expertId: string;
  clinicId: string | null;
  title: string;
  description: string | null;
  status: TreatmentStatus;
  startDate: string | null;
  endDate: string | null;
  totalPriceVnd: number | null;
  paidAt: string | null;
  paidTransactionId: string | null;
  sourceConsultationId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: "CUSTOMER" | "EXPERT" | null;
  refundTransactionId: string | null;
  refundedAmountVnd: number | null;
  phases: TreatmentPhase[];
  createdAt: string;
  updatedAt: string;
  readyForPayment: boolean;
}

export interface CreateTreatmentPayload {
  customerId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  sourceConsultationId?: string;
}

export interface TreatmentPhasePayload {
  phaseType: TreatmentPhaseType;
  phaseOrder?: number;
  title?: string | null;
  goals?: string | null;
  notes?: string | null;
  noteByExpert?: string | null;
  priceVnd: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TreatmentEvent {
  id: string;
  treatmentId: string;
  type: TreatmentEventType;
  title: string;
  note: string | null;
  photoUrl: string | null;
  occurredAt: string;
  createdByExpertId: string | null;
  createdAt: string;
}

export interface TreatmentChartSession {
  id: string;
  status: string;
  isFollowUp: boolean;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  reason: string | null;
  feedbackRating: number | null;
  feedbackComment: string | null;
}

export interface TreatmentChart {
  treatmentId: string;
  title: string;
  status: TreatmentStatus;
  startDate: string | null;
  endDate: string | null;
  paidAt: string | null;
  phases: Array<{
    id: string;
    phaseType: TreatmentPhaseType;
    phaseOrder: number;
    title: string | null;
    status: TreatmentPhaseStatus;
    noteByExpert: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  progressPhotos: TreatmentEvent[];
  productsUsed: Array<{
    productVariantId: string;
    productName: string | null;
    sku: string | null;
    completedCount: number;
    lastUsedAt: string | null;
    phaseIds: string[];
  }>;
  inPersonSessions: TreatmentChartSession[];
  consultationResults: {
    sourceConsultation: TreatmentChartSession | null;
    followUpSessions: TreatmentChartSession[];
  };
  phaseDetails?: TreatmentPhase[];
}

export interface UploadImageResponse {
  url: string;
  key: string;
}
