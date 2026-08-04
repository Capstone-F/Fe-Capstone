import type {
  TreatmentPhaseStatus,
  TreatmentPhaseType,
  TreatmentPlan,
  TreatmentStatus,
} from "../types/treatment.types";

export const treatmentStatusLabel: Record<TreatmentStatus, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang điều trị",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export const treatmentPhaseStatusLabel: Record<TreatmentPhaseStatus, string> = {
  PENDING: "Chờ thực hiện",
  ACTIVE: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
};

export const treatmentPhaseTypeLabel: Record<TreatmentPhaseType, string> = {
  INITIAL_ASSESSMENT: "Đánh giá ban đầu",
  ACTIVE_TREATMENT: "Điều trị tích cực",
  MAINTENANCE: "Duy trì",
  RECOVERY: "Phục hồi",
};

export function getTreatmentStatusLabel(plan: TreatmentPlan): string {
  if (plan.status === "DRAFT" && plan.isSubmittedForPayment) {
    return "Chờ thanh toán";
  }
  return treatmentStatusLabel[plan.status];
}
