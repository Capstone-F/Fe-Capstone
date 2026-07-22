import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  SurveyQuestionDto,
  SurveyResponseDto,
  RecommendationResponseDto,
  CustomerProfileResponseDto,
} from "@/types/domain";
import type { CartResponse } from "@/features/commerce/types/cart.types";

export const treatmentApi = {
  fetchQuestions: (
    surveyId?: string,
  ): Promise<AxiosResponse<SurveyQuestionDto[]>> => {
    const url = surveyId
      ? `${API_ENDPOINTS.SURVEYS.QUESTIONS}?surveyId=${surveyId}`
      : API_ENDPOINTS.SURVEYS.QUESTIONS;
    return apiClient.get<SurveyQuestionDto[]>(url);
  },

  createSurveySession: (): Promise<AxiosResponse<SurveyResponseDto>> => {
    return apiClient.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.BASE);
  },

  submitSurveyAnswers: (
    sessionId: string,
    answers: { questionId: string; labelCodes: string[]; value?: string }[],
  ): Promise<AxiosResponse<unknown>> => {
    return apiClient.post<unknown>(
      `${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/answers`,
      { answers },
    );
  },

  fetchCustomerProfile: (): Promise<
    AxiosResponse<CustomerProfileResponseDto>
  > => {
    return apiClient.get<CustomerProfileResponseDto>(
      API_ENDPOINTS.CUSTOMERS.ME,
    );
  },

  fetchLatestRecommendations: (): Promise<
    AxiosResponse<RecommendationResponseDto>
  > => {
    return apiClient.get<RecommendationResponseDto>(
      API_ENDPOINTS.RECOMMENDATIONS.LATEST,
    );
  },

  completeSurvey: (sessionId: string): Promise<AxiosResponse<unknown>> => {
    return apiClient.post<unknown>(
      `${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/complete`,
    );
  },

  addRecommendationToCart: (
    productVariantId: string,
    surveyRecommendationId?: string,
  ): Promise<AxiosResponse<CartResponse>> => {
    return apiClient.post<CartResponse>(API_ENDPOINTS.CART.ITEMS, {
      productVariantId,
      quantity: 1,
      source: "SURVEY",
      ...(surveyRecommendationId ? { surveyRecommendationId } : {}),
    });
  },
};
