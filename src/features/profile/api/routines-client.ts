import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";

import type { Routine, RoutineStep } from "../types/routine";

export type { Routine, RoutineStep };

/**
 * Fetch all routines for the current user.
 * Backend: GET /routines/me
 */
export async function getMyRoutines(): Promise<Routine[]> {
  if (appConfig.useMockApi) {
    return [];
  }
  return apiJson<Routine[]>("/routines/me");
}

/**
 * Generate a routine from a paid survey order.
 * Backend: POST /routines/generate
 */
export async function generateRoutine(orderId: string): Promise<Routine> {
  return apiJson<Routine>("/routines/generate", {
    method: "POST",
    body: { orderId },
  });
}
