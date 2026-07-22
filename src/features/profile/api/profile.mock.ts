import type { UserProfile, AllergyLabelResponse } from "../types/profile.types";
import type { SurveyAnswers, SurveyRecord } from "@/types/domain";
import {
  LOCAL_STORAGE_KEY_PROFILE,
  LOCAL_STORAGE_KEY_TREATMENT,
} from "../constants/profile";

function loadTreatmentData() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TREATMENT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const profileMock = {
  getProfile: async (): Promise<UserProfile> => {
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
  },

  patchProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const profile = await profileMock.getProfile();
    const updated = { ...profile, ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));
    }
    return updated;
  },

  getAllergyOptions: async (): Promise<AllergyLabelResponse[]> => {
    return [
      { id: "1", code: "RETINOIDS", name: "Retinoids" },
      { id: "2", code: "AHA", name: "AHA (Glycolic Acid)" },
      { id: "3", code: "BHA", name: "BHA (Salicylic Acid)" },
      { id: "4", code: "FRAGRANCE", name: "Hương liệu (Fragrance)" },
      { id: "5", code: "PARABENS", name: "Parabens" },
      { id: "6", code: "CORTICOID", name: "Corticoid" },
      { id: "7", code: "ALCOHOL", name: "Cồn khô (Alcohol Denat)" },
    ];
  },

  getSurveyHistory: async (): Promise<SurveyRecord[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const treatment = loadTreatmentData();
    if (treatment?.surveyHistory) {
      return treatment.surveyHistory;
    }
    return [];
  },

  postSurvey: async (answers: SurveyAnswers): Promise<SurveyRecord> => {
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
  },
};
