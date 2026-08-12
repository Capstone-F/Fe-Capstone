export interface SurveyQuestionOptionDto {
  labelCode: string;
  name: string;
  description: string | null;
  vietnameseNormalized: string | null;
}

export interface SurveyQuestionDto {
  id: string;
  code: string;
  text: string;
  description?: string | null;
  questionType: string | null;
  displayOrder: number;
  priority: string; // 'CORE' | 'CONDITIONAL' | string
  category: string;
  options: SurveyQuestionOptionDto[];
}

export interface SubmitAnswerDto {
  questionId: string;
  value?: string;
  labelCodes: string[];
}

export interface SubmitAnswersPayload {
  answers: SubmitAnswerDto[];
}

export interface SurveyAnswerLabelDto {
  code: string;
  name: string;
  vietnameseNormalized?: string | null;
}

export interface SurveyFaceLabelDto {
  code: string;
  name: string;
  vietnameseNormalized: string | null;
  explanation: string;
}

export interface SurveyAnswerItemDto {
  id: string;
  questionId: string;
  value: string | null;
  labels: SurveyAnswerLabelDto[];
}

export interface SurveyResponseDto {
  id: string;
  guestToken?: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  faceImageUrl: string | null;
  faceScannedAt: string | null;
  faceLabels: SurveyFaceLabelDto[];
  answers: SurveyAnswerItemDto[];
  createdAt: string;
}

export interface CreateSurveyRequestDto {
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  allergyLabelCodes: string[];
}

export interface RankedVariantDto {
  productVariantId: string;
  productId: string;
  productName: string;
  sku: string;
  priceVnd: number;
  volume: string | null;
  rank: number;
}

export interface RecommendedProductDto {
  recommendationItemId: string;
  protocolId: string;
  protocolCode: string;
  protocolName: string;
  matchScore: number;
  productId: string;
  productName: string;
  productVariantId: string;
  sku: string;
  priceVnd: number;
  volume: string | null;
  variants: RankedVariantDto[];
}

export interface RecommendationConflictDto {
  protocolCode: string;
  conflictingProtocolCode: string;
  severity: string;
  reason: string | null;
}

/** When a protocol is applied — mirrors Be-Capstone `TimeOfUse` (ingredients/enums.ts). */
export type TimeOfUse = "AM" | "PM" | "AM_PM";

/** Mirrors Be-Capstone/src/rule-engine/dto/rule-engine-context.dto.ts `RuleEngineProtocolDto`. */
export interface RuleEngineProtocolDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  ingredientName: string;
  concentrationPct: number | null;
  timePerWeek: number | null;
  timeOfUse: TimeOfUse | null;
  durationWeeks: number | null;
  instructions: string | null;
  matchScore: number;
  matchedLabelCodes: string[];
}

export interface RecommendationCustomerProfileDto {
  skinTypeCode?: string | null;
  skinTypeName?: string | null;
  age?: number | null;
  gender?: string | null;
  oilyDryScore?: number | null;
  sensitiveResistantScore?: number | null;
  pigmentedNonPigmentedScore?: number | null;
  wrinkledTightScore?: number | null;
}

export interface RecommendationResponseDto {
  id: string;
  customerSurveyId: string;
  customerProfile?: RecommendationCustomerProfileDto | null;
  labels: {
    id?: string;
    code?: string;
    name: string;
    vietnameseNormalized?: string | null;
  }[];
  protocols: RuleEngineProtocolDto[];
  conflicts?: RecommendationConflictDto[];
  products: RecommendedProductDto[];
  createdAt: string;
}

export interface SkinTypeSummaryDto {
  code: string;
  name: string;
  description: string | null;
}

export interface BaumannScoresDto {
  oilyDryScore: number | null;
  sensitiveResistantScore: number | null;
  pigmentedNonPigmentedScore: number | null;
  wrinkledTightScore: number | null;
  assessedAt: string | null;
}

export interface CustomerDetailsDto {
  id: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string;
  skinType: SkinTypeSummaryDto | null;
  baumannScores?: BaumannScoresDto | null;
}

export interface CustomerProfileResponseDto {
  customer: CustomerDetailsDto | null;
  allergies: { id: string; code: string; name: string }[];
  surveyHistory: unknown[];
}
