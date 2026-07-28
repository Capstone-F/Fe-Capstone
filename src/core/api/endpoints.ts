export const API_ENDPOINTS = {
  AUTH: {
    MOBILE_LOGIN: "/auth/mobile/login",
    MOBILE_REGISTER: "/auth/mobile/register",
    MOBILE_REFRESH: "/auth/mobile/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    ME: "/users/me",
    CREATE: "/users",
    LIST: "/users",
  },
  CLINICS: {
    LIST: "/clinics",
  },
  CUSTOMERS: { ME: "/customers/me", ALLERGIES: "/customers/allergies" },
  PRODUCTS: {
    LIST: "/products",
    CATEGORIES: "/products/categories",
    DETAIL: (id: string | number) => `/products/${id}`,
    SUGGESTION: "/products/suggestion",
  },
  EXPERTS: {
    LIST: "/experts",
    ME: "/experts/me",
    DETAIL: (id: string | number) => `/experts/${id}`,
  },
  BOOKINGS: {
    CREATE: "/bookings",
    ME: "/bookings/me",
    DETAIL: (id: string | number) => `/bookings/me/${id}`,
    PAY: (id: string | number) => `/bookings/${id}/pay`,
    SLOTS: (expertId: string | number) => `/bookings/${expertId}`,
    CONFIRM: (id: string | number) => `/bookings/${id}/confirm`,
    CANCEL: (id: string | number) => `/bookings/${id}/cancel`,
    START: (id: string | number) => `/bookings/${id}/start`,
    COMPLETE: (id: string | number) => `/bookings/${id}/complete`,
    FEEDBACK: (id: string | number) => `/bookings/${id}/feedback`,
  },
  WALLET: {
    ME: "/wallet/me",
    TOP_UP: "/wallet/top-up",
    TRANSACTIONS: "/wallet/me/transactions",
  },
  INGREDIENTS: {
    LIST: "/ingredients",
  },
  TREATMENTS: {
    CREATE: "/treatments",
    LIST_MINE: "/treatments/me",
    DETAIL: (id: string) => `/treatments/${id}`,
    PHASES: (id: string) => `/treatments/${id}/phases`,
    PHASE_DETAIL: (phaseId: string) => `/treatments/phases/${phaseId}`,
    SUBMIT: (id: string) => `/treatments/${id}/submit`,
    PAY: (id: string) => `/treatments/${id}/pay`,
    SET_INGREDIENTS: (phaseId: string) =>
      `/treatments/phases/${phaseId}/ingredients`,
    PRODUCT_CANDIDATES: (phaseId: string) =>
      `/treatments/phases/${phaseId}/product-candidates`,
    SET_PRODUCTS: (phaseId: string) => `/treatments/phases/${phaseId}/products`,
    ROUTINE_GENERATE: (phaseId: string) =>
      `/treatments/phases/${phaseId}/routines/generate`,
    ROUTINE_SAVE: (routineId: string) =>
      `/treatments/routines/${routineId}/save`,
    ROUTINE_UPDATE: (routineId: string) => `/treatments/routines/${routineId}`,
    ACTIVATE_PHASE: (phaseId: string) =>
      `/treatments/phases/${phaseId}/activate`,
  },
  PROVINCES: { LIST: "https://provinces.open-api.vn/api/v2/" },
  CART: {
    GET: "/cart",
    ITEMS: "/cart/items",
    ITEM: (variantId: string | number) => `/cart/items/${variantId}`,
  },
  ORDERS: {
    CREATE: "/orders",
    LIST: "/orders",
    DETAIL: (id: string | number) => `/orders/${id}`,
  },
  DELIVERY: {
    OPTIONS: "/delivery/options",
    ATTACH: (orderId: string | number) => `/orders/${orderId}/delivery`,
    DETAIL: (orderId: string | number) => `/orders/${orderId}/delivery`,
  },
  PAYMENTS: {
    CHECKOUT: "/payments/checkout",
    STATUS: (paymentId: string | number) => `/payments/${paymentId}`,
  },
  SURVEYS: { BASE: "/surveys", QUESTIONS: "/surveys/questions" },
  RECOMMENDATIONS: { LATEST: "/recommendations/latest" },
  ROUTINES: { GENERATE: "/routines/generate", ME: "/routines/me" },
  FILES: {
    UPLOAD: "/files",
  },
} as const;
