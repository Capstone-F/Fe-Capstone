"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { appConfig } from "@/lib/env";
import { queryKeys } from "@/lib/query/keys";
import { authApi } from "../api/auth.api";
import { authMock } from "../api/auth.mock";
import { tokenStorage } from "../utils/token-storage";

const subscribeToHydration = () => () => undefined;

export function useSession() {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const hasStoredAccessToken =
    appConfig.devBypassAuth ||
    (isHydrated && Boolean(tokenStorage.getAccessToken()));

  const query = useQuery({
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
    enabled: hasStoredAccessToken,
  });

  return {
    ...query,
    isLoading: !isHydrated || query.isLoading,
  };
}
