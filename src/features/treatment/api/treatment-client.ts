import { apiJson } from "@/lib/api/client";
import {
  SurveyQuestionDto,
  SurveyResponseDto,
  RecommendationResponseDto,
  CustomerProfileResponseDto,
} from "@/types/domain";

export const fetchQuestionsApi = (surveyId?: string) =>
  apiJson<SurveyQuestionDto[]>(
    surveyId ? `/surveys/questions?surveyId=${surveyId}` : "/surveys/questions",
  );

export const createSurveySessionApi = () =>
  apiJson<SurveyResponseDto>("/surveys", {
    method: "POST",
  });

export const submitSurveyAnswersApi = (
  sessionId: string,
  answers: { questionId: string; labelCodes: string[]; value?: string }[],
) =>
  apiJson(`/surveys/${sessionId}/answers`, {
    method: "POST",
    body: { answers },
  });

export const fetchCustomerProfileApi = () =>
  apiJson<CustomerProfileResponseDto>("/customers/me");

export const fetchLatestRecommendationsApi = () =>
  apiJson<RecommendationResponseDto>("/recommendations/latest");

export const completeSurveyApi = (sessionId: string) =>
  apiJson(`/surveys/${sessionId}/complete`, {
    method: "POST",
  });

export const addRecommendationToCartApi = (
  productVariantId: string,
  surveyRecommendationId?: string,
) =>
  apiJson("/cart/items", {
    method: "POST",
    body: {
      productVariantId,
      quantity: 1,
      source: "SURVEY",
      ...(surveyRecommendationId ? { surveyRecommendationId } : {}),
    },
  });
