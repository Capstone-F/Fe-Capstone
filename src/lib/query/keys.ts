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
  consultationContext: (customerId: string, consultationId: string) =>
    ["customers", customerId, "consultation-context", consultationId] as const,
  treatmentPlans: (as?: "customer" | "expert", filters?: unknown) =>
    ["treatments", "mine", as ?? "customer", filters ?? {}] as const,
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
  // Keyed by destination only — GHN prices a quote from district + ward, so the
  // recipient and street fields must stay out of the key.
  shippingFeeQuote: (districtId: number | null, wardCode: string | null) =>
    ["delivery", "fee-quote", districtId, wardCode] as const,
  orderDelivery: (orderId: string) => ["delivery", "order", orderId] as const,
  orders: (query: unknown) => ["orders", query] as const,
  ordersAll: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  payment: (id: string) => ["payment", id] as const,
  stockImportForms: (query: unknown) =>
    ["stock", "import-forms", query] as const,
  stockImportForm: (id: string) => ["stock", "import-form", id] as const,
  supportSessions: (query: unknown) => ["support", "sessions", query] as const,
  supportSession: (id: string) => ["support", "session", id] as const,
  supportMessages: (sessionId: string, afterSeq?: number) =>
    ["support", "messages", sessionId, afterSeq ?? 0] as const,
};
