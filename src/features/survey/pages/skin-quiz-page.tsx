"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  useInProgressSurveyId,
  useProfile,
} from "@/features/profile/hooks/useProfile";
import type { SurveyQuestionDto, SurveyResponseDto } from "@/types/survey";
import { QuizGate } from "../components/quiz-gate";
import { QuizIntro } from "../components/quiz-intro";
import { QuizWizard } from "../components/quiz-wizard";
import { useResumeQuiz, useStartQuiz } from "../hooks/useSkinQuiz";
import { getApiErrorMessage } from "../lib/quiz-errors";
import type { QuizAnswerMap } from "../types/skin-quiz.types";

interface ActiveQuiz {
  surveyId: string;
  questions: SurveyQuestionDto[];
  answers: QuizAnswerMap;
}

/** Saved answers come back with questionId; the profile history only has questionCode. */
function toAnswerMap(session: SurveyResponseDto): QuizAnswerMap {
  const map: QuizAnswerMap = {};
  for (const answer of session.answers ?? []) {
    map[answer.questionId] = {
      labelCodes: answer.labels.map((label) => label.code),
      ...(answer.value ? { value: answer.value } : {}),
    };
  }
  return map;
}

export function SkinQuizPage() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: pendingSurveyId, isLoading: isPendingLoading } =
    useInProgressSurveyId();

  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);

  const startQuiz = useStartQuiz();
  const resumeQuiz = useResumeQuiz();
  const isBusy = startQuiz.isPending || resumeQuiz.isPending;

  const handleStart = async () => {
    try {
      const bundle = await startQuiz.mutateAsync();
      setActiveQuiz({
        surveyId: bundle.session.id,
        questions: bundle.questions,
        answers: toAnswerMap(bundle.session),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể bắt đầu bài test."));
    }
  };

  const handleResume = async () => {
    if (!pendingSurveyId) return;
    try {
      const bundle = await resumeQuiz.mutateAsync(pendingSurveyId);
      if (bundle.questions.length === 0) {
        toast.error("Ngân hàng câu hỏi chưa sẵn sàng. Vui lòng thử lại sau.");
        return;
      }
      setActiveQuiz({
        surveyId: bundle.session.id,
        questions: bundle.questions,
        answers: toAnswerMap(bundle.session),
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể tiếp tục bài test đang dở."),
      );
    }
  };

  if (isProfileLoading || isPendingLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const isProfileIncomplete = !profile?.dateOfBirth || !profile?.gender;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {isProfileIncomplete ? (
        <QuizGate />
      ) : activeQuiz ? (
        <QuizWizard
          surveyId={activeQuiz.surveyId}
          initialQuestions={activeQuiz.questions}
          initialAnswers={activeQuiz.answers}
          onCompleted={() => router.replace("/skin-quiz/result")}
          onSessionLost={() => {
            setActiveQuiz(null);
            toast.error(
              "Phiên khảo sát không còn tồn tại. Hãy bắt đầu bài test mới.",
            );
          }}
        />
      ) : (
        <QuizIntro
          hasPendingSurvey={Boolean(pendingSurveyId)}
          isBusy={isBusy}
          onStart={handleStart}
          onResume={handleResume}
        />
      )}
    </div>
  );
}
