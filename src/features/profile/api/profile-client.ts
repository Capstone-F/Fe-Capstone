import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { SurveyAnswers, SurveyRecord } from "@/types/domain";

import {
  LOCAL_STORAGE_KEY_PROFILE,
  LOCAL_STORAGE_KEY_TREATMENT,
  PROFILE_API_PATHS,
} from "../constants/profile";
import { extractBaumannFromAnswers } from "../mapper/profile-mapper";
import type {
  AllergyLabelResponse,
  CustomerProfileResponse,
  UserProfile,
} from "../types/profile";

export { PROFILE_API_PATHS };

function loadTreatmentData() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TREATMENT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch user profile. When connected to the backend this calls
 * `GET /customers/me` and maps the response to the FE `UserProfile` shape.
 */
import { ApiError } from "@/lib/api/client";
import { SessionUser } from "@/types/auth";

export async function getProfile(): Promise<UserProfile | null> {
  if (appConfig.useMockApi) {
    return getProfileMock();
  }

  if (
    typeof window !== "undefined" &&
    !localStorage.getItem("glowscan_access_token")
  ) {
    return null;
  }

  try {
    const [user, data] = await Promise.all([
      apiJson<SessionUser>(API_ENDPOINTS.USERS.ME),
      apiJson<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.ME),
    ]);

    return {
      id: data.customer?.id ?? user.id,
      name: user.name || "GlowScan User",
      email: user.email || "user@glowscan.local",
      phone: data.customer?.phone ?? "",
      gender: data.customer?.gender as "MALE" | "FEMALE" | "OTHER",
      dateOfBirth: data.customer?.dateOfBirth,
      allergies: data.allergies?.map((a) => a.code) ?? [],
      baumannCode: data.customer?.skinType?.code,
      oilyDryScore: data.customer?.baumannScores?.oilyDryScore,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    return null;
  }
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

  if (data.name !== undefined) {
    await apiJson<SessionUser>(API_ENDPOINTS.USERS.ME, {
      method: "PATCH",
      body: { name: data.name },
    });
  }

  const body: Record<string, unknown> = {};
  if (data.phone !== undefined) body.phone = data.phone || null;
  if (data.gender !== undefined) body.gender = data.gender || null;
  if (data.dateOfBirth !== undefined)
    body.dateOfBirth = data.dateOfBirth || null;
  if (data.allergies !== undefined) body.allergyLabelCodes = data.allergies;

  await apiJson<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.ME, {
    method: "PATCH",
    body,
  });

  // Re-fetch the canonical profile after update
  const updated = await getProfile();
  if (!updated) {
    throw new Error("Không thể tải thông tin profile sau khi cập nhật");
  }
  return updated;
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
  return apiJson<AllergyLabelResponse[]>(API_ENDPOINTS.CUSTOMERS.ALLERGIES);
}

/**
 * Get survey history from the customer profile endpoint.
 */
export async function getSurveyHistory(): Promise<SurveyRecord[]> {
  if (appConfig.useMockApi) {
    return getSurveyHistoryMock();
  }

  const data = await apiJson<CustomerProfileResponse>(
    API_ENDPOINTS.CUSTOMERS.ME,
  );

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
// MOCK implementations (localStorage — kept for dev/demo)
// ============================================================

async function getProfileMock(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let profile: UserProfile = {
    id: "dev-user-id",
    name: "GlowScan User",
    email: "user@glowscan.local",
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
    userId: "dev-user-id",
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
