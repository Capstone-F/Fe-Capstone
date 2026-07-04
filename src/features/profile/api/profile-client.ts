import { UserProfile, SurveyRecord, SurveyAnswers } from "@/types/domain";
import { DEV_BYPASS_SESSION_USER } from "@/types/auth";

export const PROFILE_API_PATHS = {
  GET_PROFILE: "/profile",
  UPDATE_PROFILE: "/profile",
  GET_SURVEY_HISTORY: "/survey/history",
  POST_SURVEY: "/survey",
};

const LOCAL_STORAGE_KEY_PROFILE = "glowscan_user_profile_v2";
const LOCAL_STORAGE_KEY_TREATMENT = "glowscan_treatment_data_v2";

// Helper to load treatment data
function loadTreatmentData() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TREATMENT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<UserProfile> {
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
        // Seed first time
        localStorage.setItem(
          LOCAL_STORAGE_KEY_PROFILE,
          JSON.stringify(profile),
        );
      }
    } catch {
      // Ignore
    }

    // Extract active Baumann code from treatment context
    const treatment = loadTreatmentData();
    if (treatment && treatment.surveyAnswers) {
      const answers = treatment.surveyAnswers;
      if (answers.baumannOilyDry) {
        profile.baumannCode = `${answers.baumannOilyDry}${answers.baumannSensitiveResistant}${answers.baumannPigmentNon}${answers.baumannWrinkleTight}`;
      }
    }
  }

  return profile;
}

export async function patchProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const profile = await getProfile();
  const updated = { ...profile, ...data };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));
  }

  return updated;
}

export async function getSurveyHistory(): Promise<SurveyRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const treatment = loadTreatmentData();
  if (treatment && treatment.surveyHistory) {
    return treatment.surveyHistory;
  }
  return [];
}

export async function postSurvey(
  answers: SurveyAnswers,
): Promise<SurveyRecord> {
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
