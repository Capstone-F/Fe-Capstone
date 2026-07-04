import { ConsultationBooking, TimeSlot } from "@/types/domain";

// Centralized endpoints for Booking
export const BOOKING_API_PATHS = {
  GET_SLOTS: (expertId: string) => `/experts/${expertId}/slots`,
  CREATE_BOOKING: "/bookings",
  GET_BOOKINGS: "/bookings",
  GET_BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  PAY_CONSULTATION: (id: string) => `/payments/consultation/${id}`,
  PAYMENT_STATUS: (id: string) => `/payments/${id}/status`,
};

const LOCAL_STORAGE_KEY_BOOKINGS = "glowscan_bookings_v2";

// Helper to load/save bookings in localStorage
function loadBookings(): ConsultationBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: ConsultationBooking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
}

// Generate slots dynamically based on the current date
export async function getSlots(expertId: string): Promise<TimeSlot[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const slots: TimeSlot[] = [];
  const today = new Date();

  // Create 5 slots for the next 3 days
  for (let d = 0; d < 3; d++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + d);

    const formattedDate = targetDate.toISOString().split("T")[0];

    const hours = ["09:00", "10:30", "14:00", "15:30"];
    hours.forEach((h, idx) => {
      slots.push({
        id: `slot_${expertId}_${d}_${idx}`,
        expertId,
        dateTime: `${formattedDate}T${h}:00.000Z`,
        isBooked: false,
      });
    });
  }

  // Filter out slots that have already been booked in active bookings
  const activeBookings = loadBookings();
  return slots.map((s) => {
    const isBooked = activeBookings.some(
      (b) =>
        b.expertId === expertId &&
        b.slotId === s.id &&
        b.status !== "cancelled",
    );
    return { ...s, isBooked };
  });
}

export async function createBooking(input: {
  expertId: string;
  expertName: string;
  slotId: string;
  dateTime: string;
  symptoms: string;
  amount: number;
}): Promise<ConsultationBooking> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const bookings = loadBookings();
  const newBooking: ConsultationBooking = {
    id: `bk_${Math.random().toString(36).substring(2, 9)}`,
    expertId: input.expertId,
    expertName: input.expertName,
    userId: "dev-session-user", // default mock user ID
    slotId: input.slotId,
    dateTime: input.dateTime,
    symptoms: input.symptoms,
    status: "pending",
    amount: input.amount,
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  saveBookings(bookings);

  return newBooking;
}

export async function getBookings(): Promise<ConsultationBooking[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return loadBookings();
}

export async function getBookingById(id: string): Promise<ConsultationBooking> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const bookings = loadBookings();
  const bk = bookings.find((b) => b.id === id);
  if (!bk) {
    throw new Error(`Đơn đặt lịch ${id} không tồn tại.`);
  }
  return bk;
}

export async function payConsultation(
  bookingId: string,
): Promise<{ success: boolean; redirectUrl: string }> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  // Mock redirecting to checkout flow payment trigger URL
  return {
    success: true,
    redirectUrl: `/booking/success?bookingId=${bookingId}`,
  };
}

export async function updatePaymentStatus(
  bookingId: string,
  status: "paid" | "pending",
): Promise<ConsultationBooking> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const bookings = loadBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) {
    throw new Error(`Đôn đặt lịch ${bookingId} không tồn tại.`);
  }

  bookings[idx].status = status === "paid" ? "paid" : "pending";
  saveBookings(bookings);
  return bookings[idx];
}
