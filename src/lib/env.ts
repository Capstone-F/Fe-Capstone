export const MOCK_FLAGS = {
  commerce: false, // E-commerce wired to real BE
  booking: false,
  survey: false,
  routine: false, // Routine + tracking wired to real BE (ADR-040)
  clinic: false,
  consultation: false,
  treatment: false,
  admin: false,
} as const;

export const appConfig = {
  appName: "GlowScan",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/be",
  backendApiUrl: process.env.BE_API_URL ?? "https://api.medion.asia/api/",
  devBypassAuth:
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true",
  useMockApi: MOCK_FLAGS.commerce,
} as const;
