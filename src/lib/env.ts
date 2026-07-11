export const appConfig = {
  appName: "GlowScan Admin",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/be",
  backendApiUrl: process.env.BE_API_URL ?? "http://localhost:3000",
  devBypassAuth:
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true",
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== "false",
} as const;
