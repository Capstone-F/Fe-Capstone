const apiTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000);

if (!Number.isFinite(apiTimeout) || apiTimeout <= 0) {
  throw new Error("NEXT_PUBLIC_API_TIMEOUT must be a positive number");
}

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/be", // Matches the project's actual API path config
  API_TIMEOUT: apiTimeout,
  NODE_ENV: process.env.NODE_ENV,
} as const;

export const isDevelopment = ENV.NODE_ENV === "development";
export const isProduction = ENV.NODE_ENV === "production";
