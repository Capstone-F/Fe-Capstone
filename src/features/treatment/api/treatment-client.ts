import { apiJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  SurveyQuestionDto,
  SurveyResponseDto,
  RecommendationResponseDto,
  CustomerProfileResponseDto,
} from "@/types/domain";

export const fetchQuestionsApi = (surveyId?: string) =>
  apiJson<SurveyQuestionDto[]>(
    surveyId
      ? `${API_ENDPOINTS.SURVEYS.QUESTIONS}?surveyId=${surveyId}`
      : API_ENDPOINTS.SURVEYS.QUESTIONS,
  );

export const createSurveySessionApi = () =>
  apiJson<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.BASE, {
    method: "POST",
  });

export const submitSurveyAnswersApi = (
  sessionId: string,
  answers: { questionId: string; labelCodes: string[]; value?: string }[],
) =>
  apiJson(`${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/answers`, {
    method: "POST",
    body: { answers },
  });

export const fetchCustomerProfileApi = () =>
  apiJson<CustomerProfileResponseDto>(API_ENDPOINTS.CUSTOMERS.ME);

export const fetchLatestRecommendationsApi = () =>
  apiJson<RecommendationResponseDto>(API_ENDPOINTS.RECOMMENDATIONS.LATEST);

export const completeSurveyApi = (sessionId: string) =>
  apiJson(`${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/complete`, {
    method: "POST",
  });

export const addRecommendationToCartApi = (
  productVariantId: string,
  surveyRecommendationId?: string,
) =>
  apiJson(API_ENDPOINTS.CART.ITEMS, {
    method: "POST",
    body: {
      productVariantId,
      quantity: 1,
      source: "SURVEY",
      ...(surveyRecommendationId ? { surveyRecommendationId } : {}),
    },
  });
