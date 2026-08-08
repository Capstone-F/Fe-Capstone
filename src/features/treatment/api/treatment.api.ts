import { apiClient, publicApiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  SurveyQuestionDto,
  SurveyResponseDto,
  RecommendationResponseDto,
  CustomerProfileResponseDto,
} from "@/types/domain";
import type { CartResponse } from "@/features/commerce/types/cart.types";
import type { AllergyLabelResponse } from "@/features/profile/types/profile.types";
import type { GuestSurveyBaseProfile } from "@/features/survey/lib/guest-survey-storage";

type SurveyRequestContext = {
  guestToken?: string | null;
};

const guestHeaders = (guestToken?: string | null) =>
  guestToken ? { "X-Guest-Token": guestToken } : undefined;

const surveyClient = (guestToken?: string | null) =>
  guestToken ? publicApiClient : apiClient;

export const treatmentApi = {
  fetchQuestions: (
    surveyId?: string,
    context: SurveyRequestContext = {},
  ): Promise<AxiosResponse<SurveyQuestionDto[]>> => {
    const url = surveyId
      ? `${API_ENDPOINTS.SURVEYS.QUESTIONS}?surveyId=${surveyId}`
      : API_ENDPOINTS.SURVEYS.QUESTIONS;
    return surveyClient(context.guestToken).get<SurveyQuestionDto[]>(url, {
      headers: guestHeaders(context.guestToken),
    });
  },

  createSurveySession: (
    mode: "guest" | "authenticated",
    profile?: GuestSurveyBaseProfile,
  ): Promise<AxiosResponse<SurveyResponseDto>> => {
    const body = profile
      ? {
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          allergyCodes: profile.allergyCodes,
        }
      : {};
    const client = mode === "guest" ? publicApiClient : apiClient;
    return client.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.BASE, body);
  },

  scanSurveyFace: (
    sessionId: string,
    file: File,
  ): Promise<AxiosResponse<SurveyResponseDto>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<SurveyResponseDto>(
      API_ENDPOINTS.SURVEYS.FACE_SCAN(sessionId),
      formData,
    );
  },

  submitSurveyAnswers: (
    sessionId: string,
    answers: { questionId: string; labelCodes: string[]; value?: string }[],
    context: SurveyRequestContext = {},
  ): Promise<AxiosResponse<unknown>> => {
    return surveyClient(context.guestToken).post<unknown>(
      `${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/answers`,
      { answers },
      { headers: guestHeaders(context.guestToken) },
    );
  },

  fetchAllergyOptionsForGuest: (): Promise<
    AxiosResponse<AllergyLabelResponse[]>
  > => {
    return publicApiClient.get<AllergyLabelResponse[]>(
      API_ENDPOINTS.CUSTOMERS.ALLERGIES,
    );
  },

  fetchCustomerProfile: (): Promise<
    AxiosResponse<CustomerProfileResponseDto>
  > => {
    return apiClient.get<CustomerProfileResponseDto>(
      API_ENDPOINTS.CUSTOMERS.ME,
    );
  },

  fetchLatestRecommendations: (
    context: SurveyRequestContext = {},
  ): Promise<AxiosResponse<RecommendationResponseDto>> => {
    return surveyClient(context.guestToken).get<RecommendationResponseDto>(
      API_ENDPOINTS.RECOMMENDATIONS.LATEST,
      { headers: guestHeaders(context.guestToken) },
    );
  },

  completeSurvey: (
    sessionId: string,
    context: SurveyRequestContext = {},
  ): Promise<AxiosResponse<unknown>> => {
    return surveyClient(context.guestToken).post<unknown>(
      `${API_ENDPOINTS.SURVEYS.BASE}/${sessionId}/complete`,
      undefined,
      { headers: guestHeaders(context.guestToken) },
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
