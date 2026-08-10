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
    mode?: "guest" | "authenticated",
  ): Promise<AxiosResponse<SurveyQuestionDto[]>> => {
    const url = surveyId
      ? `${API_ENDPOINTS.SURVEYS.QUESTIONS}?surveyId=${surveyId}`
      : API_ENDPOINTS.SURVEYS.QUESTIONS;

    if (context.guestToken || mode === "guest") {
      return publicApiClient.get<SurveyQuestionDto[]>(url, {
        headers: guestHeaders(context.guestToken),
      });
    }

    return apiClient.get<SurveyQuestionDto[]>(url);
  },

  createSurveySession: async (
    mode: "guest" | "authenticated",
    profile?: GuestSurveyBaseProfile,
  ): Promise<AxiosResponse<SurveyResponseDto>> => {
    const client = mode === "guest" ? publicApiClient : apiClient;
    const body = profile
      ? {
          ...(profile.phone ? { phone: profile.phone } : {}),
          ...(profile.dateOfBirth ? { dateOfBirth: profile.dateOfBirth } : {}),
          ...(profile.gender ? { gender: profile.gender } : {}),
          ...(profile.allergyCodes && profile.allergyCodes.length > 0
            ? { allergyCodes: profile.allergyCodes }
            : {}),
        }
      : {};

    try {
      return await client.post<SurveyResponseDto>(
        API_ENDPOINTS.SURVEYS.BASE,
        body,
      );
    } catch (err: unknown) {
      // If 400 Bad Request occurs due to invalid allergy label codes (e.g. mock fallback codes), retry without allergyCodes
      const errObj = err as { status?: number; response?: { status?: number } };
      if (
        (errObj.status === 400 || errObj.response?.status === 400) &&
        body.allergyCodes &&
        body.allergyCodes.length > 0
      ) {
        const fallbackBody = { ...body };
        delete fallbackBody.allergyCodes;
        return client.post<SurveyResponseDto>(
          API_ENDPOINTS.SURVEYS.BASE,
          fallbackBody,
        );
      }
      throw err;
    }
  },

  claimSurveySession: (
    guestToken: string,
  ): Promise<AxiosResponse<SurveyResponseDto>> => {
    return apiClient.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.CLAIM, {
      guestToken,
    });
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
      { preferGuestAuth: true },
    );
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
      {
        preferGuestAuth: true,
      },
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
