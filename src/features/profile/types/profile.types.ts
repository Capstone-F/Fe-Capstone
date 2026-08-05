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
  /** Full skin type summary from GET /customers/me (null until the first completed quiz). */
  skinType?: SkinTypeSummaryDto | null;
  /** Signed axis scores — see features/survey/mapper/baumann.mapper.ts before rendering. */
  baumannScores?: BaumannScoresDto | null;
}

export interface AllergyLabelResponse {
  id: string;
  code: string;
  name: string;
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
