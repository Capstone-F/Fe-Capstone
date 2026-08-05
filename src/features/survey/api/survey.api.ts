import type { AxiosResponse } from "axios";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  SubmitAnswerDto,
  SurveyQuestionDto,
  SurveyResponseDto,
} from "@/types/survey";

export const surveyApi = {
  /** Without surveyId only CORE questions are returned. */
  getQuestions: (
    surveyId?: string,
  ): Promise<AxiosResponse<SurveyQuestionDto[]>> =>
    apiClient.get<SurveyQuestionDto[]>(API_ENDPOINTS.SURVEYS.QUESTIONS, {
      params: surveyId ? { surveyId } : undefined,
    }),

  createSession: (): Promise<AxiosResponse<SurveyResponseDto>> =>
    apiClient.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.BASE),

  getSession: (surveyId: string): Promise<AxiosResponse<SurveyResponseDto>> =>
    apiClient.get<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.DETAIL(surveyId)),

  /** Upsert: re-sending a questionId replaces its previous labels. */
  submitAnswers: (
    surveyId: string,
    answers: SubmitAnswerDto[],
  ): Promise<AxiosResponse<SurveyResponseDto>> =>
    apiClient.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.ANSWERS(surveyId), {
      answers,
    }),

  /** Side effect on the backend: derives and saves the Baumann type on the profile. */
  completeSession: (
    surveyId: string,
  ): Promise<AxiosResponse<SurveyResponseDto>> =>
    apiClient.post<SurveyResponseDto>(API_ENDPOINTS.SURVEYS.COMPLETE(surveyId)),
};
