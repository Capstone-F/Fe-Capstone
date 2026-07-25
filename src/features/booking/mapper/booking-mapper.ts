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
    | "cancelled"
    | "paid" = "pending";
  const beStatus = (be.status || "").toLowerCase();

  if (beStatus === "confirmed") {
    status = "confirmed";
  } else if (beStatus === "in_progress") {
    status = "in_progress";
  } else if (beStatus === "completed") {
    status = "completed";
  } else if (beStatus === "cancelled" || beStatus === "failed") {
    status = "cancelled";
  } else if (beStatus === "paid") {
    status = "paid";
  } else if (beStatus === "pending") {
    status = "pending";
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
    feedback: be.feedback,
  };
}
