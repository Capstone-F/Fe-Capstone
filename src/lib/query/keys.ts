export const queryKeys = {
  session: ["session"] as const,
  experts: (filters: unknown) => ["experts", filters] as const,
  expert: (id: string) => ["expert", id] as const,
  specialties: ["specialties"] as const,
  slots: (expertId: string) => ["slots", expertId] as const,
  bookings: ["bookings"] as const,
  booking: (id: string) => ["booking", id] as const,
  consultationVideoToken: (bookingId: string) =>
    ["consultation", bookingId, "video-token"] as const,
  consultationChatToken: (bookingId: string) =>
    ["consultation", bookingId, "chat-token"] as const,
  consultationContext: (customerId: string) =>
    ["customers", customerId, "consultation-context"] as const,
  treatmentPlans: (as?: "customer" | "expert") =>
    ["treatments", "mine", as ?? "customer"] as const,
  treatment: (id: string) => ["treatments", id] as const,
  treatmentChart: (id: string) => ["treatments", id, "chart"] as const,
  treatmentEvents: (id: string, type?: string) =>
    ["treatments", id, "events", type ?? "all"] as const,
  profile: ["profile"] as const,
  surveyHistory: ["surveyHistory"] as const,
  allergyOptions: ["allergyOptions"] as const,
  routines: ["routines"] as const,
  routineToday: (period: string) => ["routines", "today", period] as const,
  routineHistory: (routineId: string, from: string, to: string) =>
    ["routines", routineId, "history", from, to] as const,
  routineCheckIns: (routineId: string, from: string, to: string) =>
    ["routines", routineId, "check-ins", from, to] as const,
  routineHistoryDay: (routineId: string, date: string, period: string) =>
    ["routines", routineId, "history-day", date, period] as const,
  products: (filters: unknown) => ["products", filters] as const,
  suggestions: (limit: number) => ["products", "suggestions", limit] as const,
  product: (id: string) => ["product", id] as const,
  productCategories: ["productCategories"] as const,
  productPool: ["productPool"] as const,
  cart: ["cart"] as const,
  provinces: ["delivery", "provinces"] as const,
  districts: (provinceId: number | null) =>
    ["delivery", "districts", provinceId] as const,
  wards: (districtId: number | null) =>
    ["delivery", "wards", districtId] as const,
  shippingFeeQuote: (address: unknown) =>
    ["delivery", "fee-quote", address] as const,
  orderDelivery: (orderId: string) => ["delivery", "order", orderId] as const,
  orders: (query: unknown) => ["orders", query] as const,
  ordersAll: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  payment: (id: string) => ["payment", id] as const,
};
