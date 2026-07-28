export interface TimeSlot {
  id: string;
  expertId: string;
  dateTime: string;
  isBooked: boolean;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  expertName: string;
  customerName?: string | null;
  userId: string;
  slotId: string;
  dateTime: string;
  symptoms: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  isPaid: boolean;
  isFollowUp: boolean;
  feeChargedVnd: number;
  amount: number;
  createdAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledBy?: string | null;
  feedback?: { rating: number; comment?: string | null } | null;
}

export interface BackendSlot {
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface BackendDaySlots {
  date: string;
  slots: BackendSlot[];
}

export interface BackendSlotsResponse {
  expertId: string;
  sessionLengthHours: number;
  range: string;
  from: string;
  to: string;
  days: BackendDaySlots[];
}

export interface BackendBooking {
  id: string;
  customerId: string;
  expertId: string;
  expertName: string | null;
  customerName: string | null;
  reason: string | null;
  status: string;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledBy?: string | null;
  feeChargedVnd?: number | null;
  isPaid?: boolean;
  isFollowUp?: boolean;
  treatmentId?: string | null;
  createdAt: string;
  updatedAt: string;
  feedback?: { rating: number; comment?: string | null } | null;
}

export interface BackendBookingsResponse {
  items: BackendBooking[];
  total: number;
  page: number;
  limit: number;
}
