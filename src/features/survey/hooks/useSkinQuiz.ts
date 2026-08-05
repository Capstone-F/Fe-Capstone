"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type {
  SubmitAnswerDto,
  SurveyQuestionDto,
  SurveyResponseDto,
} from "@/types/survey";
import { surveyApi } from "../api/survey.api";
import { isAlreadyCompletedError } from "../lib/quiz-errors";

export interface QuizSessionBundle {
  session: SurveyResponseDto;
  questions: SurveyQuestionDto[];
}

/**
 * The Baumann quiz asks CORE + CONDITIONAL only. OPTIONAL (L3 personality and
 * preference probes) does not feed the four axes and would double the length.
 */
export function filterQuizQuestions(
  questions: SurveyQuestionDto[],
): SurveyQuestionDto[] {
  return questions
    .filter((question) => question.priority !== "OPTIONAL")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function useStartQuiz() {
  return useMutation<QuizSessionBundle, Error, void>({
    mutationFn: async () => {
      // Load questions first: a failing question bank must not leave an orphan session.
      const questionsResponse = await surveyApi.getQuestions();
      const questions = filterQuizQuestions(questionsResponse.data ?? []);
      if (questions.length === 0) {
        throw new Error(
          "Ngân hàng câu hỏi chưa sẵn sàng. Vui lòng thử lại sau.",
        );
      }
      const sessionResponse = await surveyApi.createSession();
      return { session: sessionResponse.data, questions };
    },
  });
}

export function useResumeQuiz() {
  return useMutation<QuizSessionBundle, Error, string>({
    mutationFn: async (surveyId) => {
      const [sessionResponse, questionsResponse] = await Promise.all([
        surveyApi.getSession(surveyId),
        surveyApi.getQuestions(surveyId),
      ]);
      return {
        session: sessionResponse.data,
        questions: filterQuizQuestions(questionsResponse.data ?? []),
      };
    },
  });
}

export function useSubmitAnswer() {
  return useMutation<
    SurveyResponseDto,
    Error,
    { surveyId: string; answer: SubmitAnswerDto }
  >({
    mutationFn: async ({ surveyId, answer }) => {
      const response = await surveyApi.submitAnswers(surveyId, [answer]);
      return response.data;
    },
  });
}

export function useUnlockQuestions() {
  return useMutation<SurveyQuestionDto[], Error, string>({
    mutationFn: async (surveyId) => {
      const response = await surveyApi.getQuestions(surveyId);
      return filterQuizQuestions(response.data ?? []);
    },
  });
}

export function useCompleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (surveyId) => {
      try {
        await surveyApi.completeSession(surveyId);
      } catch (error) {
        // Completing twice is still a success from the customer's point of view.
        if (!isAlreadyCompletedError(error)) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      // queryKeys.surveyHistory (["surveyHistory"]) prefix-matches
      // queryKeys.inProgressSurvey (["surveyHistory", "in-progress"]).
      await queryClient.invalidateQueries({
        queryKey: queryKeys.surveyHistory,
      });
    },
  });
}
