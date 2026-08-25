export const API_ENDPOINTS = {
  ANALYTICS: {
    COMMERCE_EVENTS: "/analytics/commerce/events/batch",
  },
  DASHBOARDS: {
    ADMIN: "/admin/dashboard",
    EXPERT: "/experts/me/dashboard",
    STAFF: "/staff/dashboard",
  },
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
    DETAIL: (id: string) => `/users/${id}`,
    ROLES: (id: string) => `/users/${id}/roles`,
    STATUS: (id: string) => `/users/${id}/status`,
  },
  ADMIN_WALLETS: {
    DETAIL: (userId: string) => `/admin/wallets/${userId}`,
    TOP_UP: (userId: string) => `/admin/wallets/${userId}/top-up`,
  },
  ADMIN_CLINICS: {
    LIST: "/admin/clinics",
    DETAIL: (id: string) => `/admin/clinics/${id}`,
    CREATE: "/admin/clinics",
    UPDATE: (id: string) => `/admin/clinics/${id}`,
    DEACTIVATE: (id: string) => `/admin/clinics/${id}`,
    COMMISSION: (id: string) => `/admin/clinics/${id}/commission`,
    BALANCES: "/admin/clinics/balances",
  },
  ADMIN_EXPERT_CANCELLATIONS: {
    STATS: "/admin/experts/cancellation-stats",
  },
  ADMIN_TRANSACTIONS: {
    LIST: "/admin/transactions",
    EXPORT: "/admin/transactions/export",
  },
  ADMIN_ACTIVITY: {
    LIST: "/admin/activity",
  },
  ADMIN_SURVEY_QUESTIONS: {
    LIST: "/admin/survey-questions",
    DETAIL: (id: string) => `/admin/survey-questions/${id}`,
    CREATE: "/admin/survey-questions",
    UPDATE: (id: string) => `/admin/survey-questions/${id}`,
    DELETE: (id: string) => `/admin/survey-questions/${id}`,
    OPTIONS: (id: string) => `/admin/survey-questions/${id}/options`,
  },
  ADMIN_COMMERCE: {
    COMBO_DISCOUNT: "/admin/commerce-settings/survey-combo-discount",
  },
  ADMIN_QA_CHEATS: {
    CUSTOMER_PROFILE: (id: string) => `/admin/customers/${id}/profile`,
    CUSTOMER_SURVEY: (id: string) => `/admin/customers/${id}/survey`,
    SEED_DEMO_CUSTOMER: "/admin/demo/customers",
  },
  CLINICS: {
    LIST: "/clinics",
    DETAIL: (id: string) => `/clinics/${id}`,
    EXPERTS: (id: string) => `/clinics/${id}/experts`,
  },
  CUSTOMERS: {
    ME: "/customers/me",
    SKIN_TYPE: "/customers/me/skin-type",
    ALLERGIES: "/customers/allergies",
    CONSULTATION_CONTEXT: (id: string) =>
      `/customers/${id}/consultation-context`,
  },
  PRODUCTS: {
    LIST: "/products",
    CATEGORIES: "/products/categories",
    DETAIL: (id: string | number) => `/products/${id}`,
    SUGGESTION: "/products/suggestion",
    VARIANT_UPDATE: (variantId: string) => `/products/variants/${variantId}`,
  },
  STOCK: {
    IMPORT_FORMS: "/stock/import-forms",
    IMPORT_FORM_DETAIL: (id: string) => `/stock/import-forms/${id}`,
    SUBMIT_IMPORT_FORM: (id: string) => `/stock/import-forms/${id}/submit`,
    CONFIRM_IMPORT_FORM: (id: string) => `/stock/import-forms/${id}/confirm`,
    CANCEL_IMPORT_FORM: (id: string) => `/stock/import-forms/${id}/cancel`,
    REJECT_IMPORT_FORM: (id: string) => `/stock/import-forms/${id}/reject`,
    BATCHES: "/stock/batches",
    ADJUST_BATCH: (id: string) => `/stock/batches/${id}/adjust`,
    INVENTORY: "/stock/inventory",
    LOW_STOCK_THRESHOLD: "/stock/low-stock-threshold",
  },
  SUPPORT: {
    SESSIONS: "/support/sessions",
    LIVE_SESSION: "/support/sessions/me",
    SESSION_DETAIL: (id: string) => `/support/sessions/${id}`,
    CLAIM_SESSION: (id: string) => `/support/sessions/${id}/claim`,
    SESSION_MESSAGES: (id: string) => `/support/sessions/${id}/messages`,
    READ_SESSION: (id: string) => `/support/sessions/${id}/read`,
    CLOSE_SESSION: (id: string) => `/support/sessions/${id}/close`,
  },
  EXPERTS: {
    LIST: "/experts",
    CREATE: "/experts",
    ME: "/experts/me",
    DETAIL: (id: string | number) => `/experts/${id}`,
    // These take the expert PROFILE id (from GET /experts), not the user id.
    CONSULTATION_FEE: (id: string) => `/experts/${id}/consultation-fee`,
    AVAILABILITY: (expertId: string) => `/experts/${expertId}/availability`,
    AVAILABILITY_DETAIL: (expertId: string, id: string) =>
      `/experts/${expertId}/availability/${id}`,
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
  CONSULTATIONS: {
    VIDEO_TOKEN: (bookingId: string) =>
      `/consultations/${bookingId}/video-token`,
    CHAT_TOKEN: (bookingId: string) => `/consultations/${bookingId}/chat-token`,
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
    CHART: (id: string) => `/treatments/${id}/chart`,
    EVENTS: (id: string) => `/treatments/${id}/events`,
    EVENT: (id: string, eventId: string) =>
      `/treatments/${id}/events/${eventId}`,
    CANCEL: (id: string) => `/treatments/${id}/cancel`,
  },
  UPLOADS: {
    IMAGE: "/uploads/images",
  },
  FILES: {
    UPLOAD: "/files",
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
    CANCEL: (id: string | number) => `/orders/${id}/cancel`,
    REORDER: (id: string | number) => `/orders/${id}/reorder`,
  },
  DELIVERY: {
    PROVINCES: "/delivery/provinces",
    DISTRICTS: "/delivery/districts",
    WARDS: "/delivery/wards",
    FEE_QUOTE: "/delivery/fee-quote",
    BY_ORDER: (orderId: string | number) => `/delivery/order/${orderId}`,
  },
  PAYMENTS: {
    CHECKOUT: "/payments/checkout",
    CHECKOUT_WALLET: "/payments/checkout/wallet",
    STATUS: (paymentId: string | number) => `/payments/${paymentId}`,
  },
  SURVEYS: {
    BASE: "/surveys",
    CLAIM: "/surveys/claim",
    QUESTIONS: "/surveys/questions",
    FACE_SCAN: (id: string) => `/surveys/${id}/face-scan`,
  },
  RECOMMENDATIONS: { LATEST: "/recommendations/latest" },
  ROUTINES: {
    GENERATE: "/routines/generate",
    ME: "/routines/me",
    TODAY: "/routines/me/today",
    STEP_COMPLETE: (routineId: string, stepId: string) =>
      `/routines/${routineId}/steps/${stepId}/complete`,
    STEP_SKIP: (routineId: string, stepId: string) =>
      `/routines/${routineId}/steps/${stepId}/skip`,
    CHECK_INS: (routineId: string) => `/routines/${routineId}/check-ins`,
    WEEKLY_CHECK_IN: (routineId: string) =>
      `/routines/${routineId}/weekly-check-in`,
    SIDE_EFFECT: (routineId: string) => `/routines/${routineId}/side-effects`,
    HISTORY: (routineId: string) => `/routines/${routineId}/history`,
    HISTORY_DAY: (routineId: string, date: string) =>
      `/routines/${routineId}/history/${date}`,
  },
  ADMIN_ORDER_CANCELLATIONS: {
    LIST: "/admin/order-cancellations",
    DETAIL: (id: string) => `/admin/order-cancellations/${id}`,
    CONFIRM_RETURN: (id: string) =>
      `/admin/order-cancellations/${id}/confirm-return`,
    CANCEL: "/admin/order-cancellations",
    ADVANCE: (id: string) => `/admin/order-cancellations/${id}/advance`,
    TICK: "/admin/order-cancellations/tick",
  },
  ADMIN_DELIVERIES: {
    LIST: "/admin/deliveries",
    DETAIL: (id: string) => `/admin/deliveries/${id}`,
    CREATE_GHN_ORDER: (id: string) =>
      `/admin/deliveries/${id}/create-ghn-order`,
    ADVANCE: (id: string) => `/admin/deliveries/${id}/advance`,
    TICK: "/admin/deliveries/tick",
    FORCE_STATUS: (id: string) => `/admin/deliveries/${id}/force-status`,
  },
  ADMIN_ORDERS: {
    HANDOVER: (orderId: string) => `/admin/orders/${orderId}/handover`,
  },
  ADMIN_CLINIC_WITHDRAWALS: {
    LIST: "/admin/clinic-withdrawals",
    MARK_PAID: (id: string) => `/admin/clinic-withdrawals/${id}/mark-paid`,
    REJECT: (id: string) => `/admin/clinic-withdrawals/${id}/reject`,
  },
  CLINIC: {
    WALLET: "/clinic/wallet",
    BANK_ACCOUNT: "/clinic/bank-account",
    WITHDRAWALS: "/clinic/withdrawals",
    EXPERTS: "/clinic/experts",
    EXPERT_CANCELLATION_STATS: "/clinic/experts/cancellation-stats",
    BOOKINGS: "/clinic/bookings",
    BOOKING_DETAIL: (id: string) => `/clinic/bookings/${id}`,
    TREATMENTS: "/clinic/treatments",
    TREATMENT_DETAIL: (id: string) => `/clinic/treatments/${id}`,
    TRANSACTIONS: "/clinic/transactions",
    TRANSACTIONS_EXPORT: "/clinic/transactions/export",
  },
} as const;
