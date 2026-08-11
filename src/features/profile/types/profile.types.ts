import type { BaumannScoresDto, SkinTypeSummaryDto } from "@/types/survey";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth?: string | null;
  allergies: string[];
  baumannCode?: string;
  oilyDryScore?: number | null;
  /** Full skin type summary from GET /customers/me (null until first assessed). */
  skinType?: SkinTypeSummaryDto | null;
  /** Signed axis scores; null on every axis until a code is saved with scores. */
  baumannScores?: BaumannScoresDto | null;
}

/** Body of PATCH /customers/me/skin-type. Omitted scores are cleared by the backend. */
export interface UpdateSkinTypeBody {
  skinTypeCode: string;
  oilyDryScore: number;
  sensitiveResistantScore: number;
  pigmentedNonPigmentedScore: number;
  wrinkledTightScore: number;
}

export interface AllergyLabelResponse {
  id: string;
  code: string;
  name: string;
  vietnameseNormalized?: string | null;
}

export interface CustomerDetailsResponse {
  id: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string;
  skinType: { code: string; name: string; description?: string | null } | null;
  baumannScores: {
    oilyDryScore: number | null;
    sensitiveResistantScore: number | null;
    pigmentedNonPigmentedScore: number | null;
    wrinkledTightScore: number | null;
    assessedAt: string | null;
  } | null;
}

export interface SurveyAnswerResponse {
  questionCode: string;
  questionText: string;
  value: string | null;
  labels: { code: string; name: string }[];
}

export interface SurveyHistoryItemResponse {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  answers: SurveyAnswerResponse[];
}

export interface CustomerProfileResponse {
  customer: CustomerDetailsResponse | null;
  allergies: AllergyLabelResponse[];
  surveyHistory: SurveyHistoryItemResponse[];
}
