import type {
  TreatmentPhase,
  TreatmentPhaseStatus,
  TreatmentPhaseType,
  TreatmentPlan,
  TreatmentStatus,
} from "../types/treatment.types";

interface BackendTreatmentPhase {
  id: string;
  treatmentId: string;
  phaseType: TreatmentPhaseType;
  phaseOrder: number;
  title: string | null;
  goals: string | null;
  notes: string | null;
  noteByExpert: string | null;
  priceVnd: string | number;
  status: TreatmentPhaseStatus;
  startDate: string | null;
  endDate: string | null;
  ingredients?: TreatmentPhase["ingredients"];
  products?: TreatmentPhase["products"];
  routines?: TreatmentPhase["routines"];
  conflicts?: TreatmentPhase["conflicts"];
}

export interface BackendTreatmentResponse {
  id: string;
  customerId: string;
  customerName?: string | null;
  expertId: string;
  clinicId: string | null;
  title: string;
  description: string | null;
  status: TreatmentStatus;
  startDate: string | null;
  endDate: string | null;
  totalPriceVnd: string | number | null;
  submittedAt?: string | null;
  paidAt: string | null;
  paidTransactionId: string | null;
  sourceConsultationId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: "CUSTOMER" | "EXPERT" | null;
  refundTransactionId: string | null;
  refundedAmountVnd: string | number | null;
  phases: BackendTreatmentPhase[];
  createdAt: string;
  updatedAt: string;
}

function toMoney(value: string | number | null): number | null {
  if (value === null) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function mapBackendPhase(phase: BackendTreatmentPhase): TreatmentPhase {
  return {
    id: phase.id,
    treatmentId: phase.treatmentId,
    phaseType: phase.phaseType,
    phaseOrder: phase.phaseOrder,
    title: phase.title,
    goals: phase.goals,
    notes: phase.notes,
    noteByExpert: phase.noteByExpert,
    priceVnd: toMoney(phase.priceVnd) ?? 0,
    status: phase.status,
    startDate: phase.startDate,
    endDate: phase.endDate,
    ingredients: phase.ingredients ?? [],
    products: phase.products ?? [],
    routines: phase.routines ?? [],
    ...(phase.conflicts ? { conflicts: phase.conflicts } : {}),
  };
}

export function mapBackendTreatmentToFrontend(
  treatment: BackendTreatmentResponse,
): TreatmentPlan {
  const phases = [...(treatment.phases ?? [])]
    .sort((a, b) => a.phaseOrder - b.phaseOrder)
    .map(mapBackendPhase);
  const calculatedPhaseTotal = phases.reduce(
    (sum, phase) => sum + (phase.priceVnd ?? 0),
    0,
  );
  const totalPriceVnd =
    toMoney(treatment.totalPriceVnd) ?? calculatedPhaseTotal;

  return {
    id: treatment.id,
    customerId: treatment.customerId,
    customerName: treatment.customerName ?? null,
    expertId: treatment.expertId,
    clinicId: treatment.clinicId,
    title: treatment.title,
    description: treatment.description,
    status: treatment.status,
    startDate: treatment.startDate,
    endDate: treatment.endDate,
    totalPriceVnd,
    submittedAt: treatment.submittedAt ?? null,
    paidAt: treatment.paidAt,
    paidTransactionId: treatment.paidTransactionId,
    sourceConsultationId: treatment.sourceConsultationId,
    cancelledAt: treatment.cancelledAt,
    cancelReason: treatment.cancelReason,
    cancelledBy: treatment.cancelledBy,
    refundTransactionId: treatment.refundTransactionId,
    refundedAmountVnd: toMoney(treatment.refundedAmountVnd),
    phases,
    createdAt: treatment.createdAt,
    updatedAt: treatment.updatedAt,
    canSubmitForPayment:
      treatment.status === "DRAFT" &&
      Boolean(treatment.startDate && treatment.endDate) &&
      phases.length > 0 &&
      phases.every(
        (phase) => phase.noteByExpert?.trim() && phase.priceVnd >= 0,
      ) &&
      (totalPriceVnd ?? 0) > 0,
    isSubmittedForPayment: Boolean(treatment.submittedAt),
  };
}
