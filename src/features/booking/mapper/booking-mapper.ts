import type {
  BackendBooking,
  ConsultationBooking,
} from "../types/booking.types";
import { DEFAULT_CONSULTATION_FEE } from "../constants/booking";

export function mapBackendBookingToFrontend(
  be: BackendBooking,
): ConsultationBooking {
  let status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled" = "pending";
  const beStatus = (be.status || "").toLowerCase();

  if (beStatus === "confirmed") {
    status = "confirmed";
  } else if (beStatus === "in_progress") {
    status = "in_progress";
  } else if (beStatus === "completed") {
    status = "completed";
  } else if (beStatus === "cancelled" || beStatus === "failed") {
    status = "cancelled";
  } else {
    status = "pending";
  }

  const isFollowUp = Boolean(be.isFollowUp);
  const isPaid = Boolean(be.isPaid || isFollowUp);
  const feeChargedVnd =
    be.feeChargedVnd !== null && be.feeChargedVnd !== undefined
      ? Number(be.feeChargedVnd)
      : isFollowUp
        ? 0
        : DEFAULT_CONSULTATION_FEE;

  return {
    id: be.id,
    expertId: be.expertId,
    customerId: be.customerId,
    expertName: be.expertName || "Chuyên gia da liễu",
    customerName: be.customerName || "Bệnh nhân",
    slotId: `${be.expertId}_${be.scheduledAt}`,
    dateTime: be.scheduledAt,
    symptoms: be.reason || "",
    status,
    isPaid,
    isFollowUp,
    feeChargedVnd,
    amount: feeChargedVnd,
    createdAt: be.createdAt,
    startedAt: be.startedAt,
    completedAt: be.completedAt,
    treatmentId: be.treatmentId ?? null,
    cancelledAt: be.cancelledAt,
    cancelReason: be.cancelReason,
    cancelledBy: be.cancelledBy,
    feedback: be.feedback,
  };
}
