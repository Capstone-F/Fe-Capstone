"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { configureApiAuth } from "@/core/api/auth-handlers";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/core/api/errors";
import { guestSurveyStorage } from "@/features/survey/lib/guest-survey-storage";

// Register Core auth handlers once at client-side bootstrap
if (typeof window !== "undefined") {
  configureApiAuth({
    getAccessToken: tokenStorage.getAccessToken,
    getGuestToken: () => guestSurveyStorage.get()?.guestToken,
    refreshAccessToken: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError({
          message: "Refresh token không tồn tại.",
          status: 401,
        });
      }
      const response = await authApi.refreshToken({ refreshToken });
      const tokenData = response.data;
      tokenStorage.setAccessToken(tokenData.accessToken);
      if (tokenData.refreshToken) {
        tokenStorage.setRefreshToken(tokenData.refreshToken);
      }
      return tokenData.accessToken;
    },
    onSessionExpired: () => {
      tokenStorage.clear();
      guestSurveyStorage.clear();
      try {
        localStorage.removeItem("glowscan_treatment_data_v2");
      } catch {
        // ignore
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("glowscan-logout"));
      }
      window.location.assign("/login");
    },
  });
}

export function AppProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
