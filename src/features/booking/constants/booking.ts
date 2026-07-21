export const BOOKING_API_PATHS = {
  GET_SLOTS: (expertId: string) => `/bookings/${expertId}`,
  CREATE_BOOKING: "/bookings",
  GET_BOOKINGS: "/bookings/me",
};

export const LOCAL_STORAGE_KEY_BOOKINGS = "glowscan_bookings_v2";
export const DEFAULT_CONSULTATION_FEE = 300000;
