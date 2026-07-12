import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { UserProfile, SurveyRecord, SurveyAnswers } from "@/types/domain";
import { DEV_BYPASS_SESSION_USER } from "@/types/auth";

export const PROFILE_API_PATHS = {
  GET_PROFILE: "/customers/me",
  UPDATE_PROFILE: "/customers/me",
  GET_ALLERGIES: "/customers/allergies",
  GET_SURVEY_HISTORY: "/survey/history",
  POST_SURVEY: "/survey",
};

// --- Backend response types (matching BE DTOs) ---

interface AllergyLabelResponse {
  id: string;
  code: string;
  name: string;
}

interface CustomerDetailsResponse {
  id: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string;
  skinType: { code: string; name: string } | null;
  baumannScores: {
    oilyDryScore: number | null;
    sensitiveResistantScore: number | null;
    pigmentedNonPigmentedScore: number | null;
    wrinkledTightScore: number | null;
    assessedAt: string | null;
  } | null;
}

interface SurveyAnswerResponse {
  questionCode: string;
  questionText: string;
  value: string | null;
  labels: { code: string; name: string }[];
}

interface SurveyHistoryItemResponse {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  answers: SurveyAnswerResponse[];
}

interface CustomerProfileResponse {
  customer: CustomerDetailsResponse | null;
  allergies: AllergyLabelResponse[];
  surveyHistory: SurveyHistoryItemResponse[];
}

// --- localStorage fallback keys (used only in mock mode) ---
const LOCAL_STORAGE_KEY_PROFILE = "glowscan_user_profile_v2";
const LOCAL_STORAGE_KEY_TREATMENT = "glowscan_treatment_data_v2";

function loadTreatmentData() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TREATMENT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// ============================================================
// PUBLIC API — delegates to real backend or localStorage mock
// ============================================================

/**
 * Fetch user profile. When connected to the backend this calls
 * `GET /customers/me` and maps the response to the FE `UserProfile` shape.
 */
export async function getProfile(): Promise<UserProfile> {
  if (appConfig.useMockApi) {
    return getProfileMock();
  }

  const data = await apiJson<CustomerProfileResponse>("/customers/me");

  return {
    id: data.customer?.id ?? DEV_BYPASS_SESSION_USER.id,
    name: DEV_BYPASS_SESSION_USER.name || "GlowScan User",
    email: DEV_BYPASS_SESSION_USER.email || "user@glowscan.local",
    phone: data.customer?.phone ?? "",
    allergies: data.allergies.map((a) => a.code),
    baumannCode: data.customer?.skinType?.code,
  };
}

/**
 * Update customer profile. Calls `PATCH /customers/me` with the BE DTO shape.
 */
export async function patchProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  if (appConfig.useMockApi) {
    return patchProfileMock(data);
  }

  const body: Record<string, unknown> = {};
  if (data.phone !== undefined) body.phone = data.phone;
  if (data.allergies !== undefined) body.allergyLabelCodes = data.allergies;

  await apiJson<CustomerProfileResponse>("/customers/me", {
    method: "PATCH",
    body,
  });

  // Re-fetch the canonical profile after update
  return getProfile();
}

/**
 * Get the list of available allergy options from the backend.
 */
export async function getAllergyOptions(): Promise<AllergyLabelResponse[]> {
  if (appConfig.useMockApi) {
    return [
      { id: "1", code: "RETINOIDS", name: "Retinoids" },
      { id: "2", code: "AHA", name: "AHA (Glycolic Acid)" },
      { id: "3", code: "BHA", name: "BHA (Salicylic Acid)" },
      { id: "4", code: "FRAGRANCE", name: "Hương liệu (Fragrance)" },
      { id: "5", code: "PARABENS", name: "Parabens" },
      { id: "6", code: "CORTICOID", name: "Corticoid" },
      { id: "7", code: "ALCOHOL", name: "Cồn khô (Alcohol Denat)" },
    ];
  }
  return apiJson<AllergyLabelResponse[]>("/customers/allergies");
}

/**
 * Get survey history from the customer profile endpoint.
 */
export async function getSurveyHistory(): Promise<SurveyRecord[]> {
  if (appConfig.useMockApi) {
    return getSurveyHistoryMock();
  }

  const data = await apiJson<CustomerProfileResponse>("/customers/me");

  return data.surveyHistory
    .filter((s) => s.isCompleted)
    .map((s) => ({
      id: s.id,
      userId: data.customer?.id ?? "",
      baumannCode: extractBaumannFromAnswers(s.answers),
      answers: {} as SurveyAnswers, // Full answers are backend-managed
      createdAt: s.createdAt,
    }));
}

/**
 * Submit a survey. Still mocked since the survey submission flow
 * via backend is managed by a different module.
 */
export async function postSurvey(
  answers: SurveyAnswers,
): Promise<SurveyRecord> {
  return postSurveyMock(answers);
}

// ============================================================
// HELPER
// ============================================================

function extractBaumannFromAnswers(answers: SurveyAnswerResponse[]): string {
  const map: Record<string, string> = {};
  for (const a of answers) {
    if (a.value) map[a.questionCode] = a.value;
  }
  return (
    (map["OILY_DRY"] ?? "?") +
    (map["SENSITIVE_RESISTANT"] ?? "?") +
    (map["PIGMENTED_NON"] ?? "?") +
    (map["WRINKLE_TIGHT"] ?? "?")
  );
}

// ============================================================
// MOCK implementations (localStorage — kept for dev/demo)
// ============================================================

async function getProfileMock(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let profile: UserProfile = {
    id: DEV_BYPASS_SESSION_USER.id,
    name: DEV_BYPASS_SESSION_USER.name || "GlowScan User",
    email: DEV_BYPASS_SESSION_USER.email || "user@glowscan.local",
    allergies: [],
    phone: "",
  };

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (stored) {
        profile = JSON.parse(stored);
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEY_PROFILE,
          JSON.stringify(profile),
        );
      }
    } catch {
      // Ignore
    }

    const treatment = loadTreatmentData();
    if (treatment?.surveyAnswers) {
      const answers = treatment.surveyAnswers;
      if (answers.baumannOilyDry) {
        profile.baumannCode = `${answers.baumannOilyDry}${answers.baumannSensitiveResistant}${answers.baumannPigmentNon}${answers.baumannWrinkleTight}`;
      }
    }
  }

  return profile;
}

async function patchProfileMock(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const profile = await getProfileMock();
  const updated = { ...profile, ...data };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));
  }
  return updated;
}

async function getSurveyHistoryMock(): Promise<SurveyRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const treatment = loadTreatmentData();
  if (treatment?.surveyHistory) {
    return treatment.surveyHistory;
  }
  return [];
}

async function postSurveyMock(answers: SurveyAnswers): Promise<SurveyRecord> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const treatment = loadTreatmentData() || {
    surveyAnswers: {},
    surveyStep: 1,
    flowState: "intro",
    dashboardTab: "home",
    morningRoutine: [],
    eveningRoutine: [],
    aiObservation: null,
    surveyHistory: [],
  };

  const baumannCode = `${answers.baumannOilyDry || "O"}${answers.baumannSensitiveResistant || "S"}${answers.baumannPigmentNon || "N"}${answers.baumannWrinkleTight || "T"}`;
  const newRecord: SurveyRecord = {
    id: `surv_${Math.random().toString(36).substring(2, 9)}`,
    userId: DEV_BYPASS_SESSION_USER.id,
    baumannCode,
    answers,
    createdAt: new Date().toISOString(),
  };

  treatment.surveyHistory = [newRecord, ...(treatment.surveyHistory || [])];
  treatment.surveyAnswers = answers;

  if (typeof window !== "undefined") {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_TREATMENT,
      JSON.stringify(treatment),
    );
  }

  return newRecord;
}
