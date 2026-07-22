"use client";

import { useQuery } from "@tanstack/react-query";
import { appConfig } from "@/lib/env";
import { queryKeys } from "@/lib/query/keys";
import { authApi } from "../api/auth.api";
import { authMock } from "../api/auth.mock";
import { tokenStorage } from "../utils/token-storage";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      if (appConfig.devBypassAuth) {
        return authMock.getSession();
      }

      if (typeof window !== "undefined" && !tokenStorage.getAccessToken()) {
        return null;
      }

      try {
        const response = await authApi.getSession();
        return response.data;
      } catch {
        return null;
      }
    },
    staleTime: appConfig.devBypassAuth ? Infinity : 60_000,
    retry: false,
  });
}
