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
  userId: string;
  slotId: string;
  dateTime: string;
  symptoms: string;
  status: "pending" | "confirmed" | "cancelled" | "paid";
  amount: number;
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface BackendBookingsResponse {
  items: BackendBooking[];
  total: number;
  page: number;
  limit: number;
}
