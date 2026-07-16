export const MOCK_FLAGS = {
  commerce: false, // E-commerce wired to real BE
  booking: true,
  survey: true,
  routine: true,
  clinic: true,
  consultation: true,
  treatment: true,
  admin: true,
} as const;

export const appConfig = {
  appName: "GlowScan Admin",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/be",
  backendApiUrl: process.env.BE_API_URL ?? "http://localhost:3000",
  devBypassAuth:
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true",
  useMockApi: MOCK_FLAGS.commerce,
} as const;
