import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";

// --- Backend response types (matching BE DTOs) ---

export interface RoutineStep {
  id: string;
  name: string;
  period: "MORNING" | "EVENING";
  stepOrder: number;
  instructions: string | null;
  productVariantId: string | null;
  protocolId: string | null;
}

export interface Routine {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  sourceOrderId: string | null;
  customerSurveyId: string | null;
  surveyRecommendationId: string | null;
  steps: RoutineStep[];
  createdAt: string;
}

// ============================================================
// PUBLIC API
// ============================================================

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
