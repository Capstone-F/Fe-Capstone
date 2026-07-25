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
    DETAIL: (id: string | number) => `/experts/${id}`,
  },
  BOOKINGS: {
    CREATE: "/bookings",
    ME: "/bookings/me",
    SLOTS: (expertId: string | number) => `/bookings/${expertId}`,
    CONFIRM: (id: string | number) => `/bookings/${id}/confirm`,
    CANCEL: (id: string | number) => `/bookings/${id}/cancel`,
    START: (id: string | number) => `/bookings/${id}/start`,
    COMPLETE: (id: string | number) => `/bookings/${id}/complete`,
    FEEDBACK: (id: string | number) => `/bookings/${id}/feedback`,
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
