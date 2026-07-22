"use client";

import { useQuery } from "@tanstack/react-query";

import { appConfig } from "@/lib/env";
import { queryKeys } from "@/lib/query/keys";

import { getSession } from "../api/auth-client";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    staleTime: appConfig.devBypassAuth ? Infinity : 60_000,
    retry: false,
  });
}
