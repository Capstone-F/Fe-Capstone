import type { BackendBooking, ConsultationBooking } from "../types/booking";
import { DEFAULT_CONSULTATION_FEE } from "../constants/booking";

export function mapBackendBookingToFrontend(
  be: BackendBooking,
): ConsultationBooking {
  let status: "pending" | "confirmed" | "cancelled" | "paid" = "pending";
  const beStatus = be.status.toLowerCase();

  if (beStatus === "confirmed" || beStatus === "in_progress") {
    status = "confirmed";
  } else if (beStatus === "cancelled" || beStatus === "failed") {
    status = "cancelled";
  } else if (beStatus === "completed" || beStatus === "paid") {
    status = "paid";
  }

  return {
    id: be.id,
    expertId: be.expertId,
    expertName: be.expertName || "Chuyên gia da liễu",
    userId: be.customerId,
    slotId: `${be.expertId}_${be.scheduledAt}`,
    dateTime: be.scheduledAt,
    symptoms: be.reason || "",
    status,
    amount: DEFAULT_CONSULTATION_FEE,
    createdAt: be.createdAt,
  };
}
