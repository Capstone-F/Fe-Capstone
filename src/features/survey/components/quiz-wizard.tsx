"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import type { SurveyQuestionDto } from "@/types/survey";
import { QuestionCard } from "./question-card";
import {
  useCompleteQuiz,
  useSubmitAnswer,
  useUnlockQuestions,
} from "../hooks/useSkinQuiz";
import { getApiErrorMessage, isSessionGoneError } from "../lib/quiz-errors";
import type { QuizAnswerMap } from "../types/skin-quiz.types";

interface QuizWizardProps {
  surveyId: string;
  initialQuestions: SurveyQuestionDto[];
  initialAnswers: QuizAnswerMap;
  onCompleted: () => void;
  onSessionLost: () => void;
}

const EMPTY_DRAFT = { labelCodes: [] as string[] };

function firstUnansweredIndex(
  questions: SurveyQuestionDto[],
  answers: QuizAnswerMap,
): number {
  const index = questions.findIndex((question) => !answers[question.id]);
  return index === -1 ? Math.max(questions.length - 1, 0) : index;
}

export function QuizWizard({
  surveyId,
  initialQuestions,
  initialAnswers,
  onCompleted,
  onSessionLost,
}: QuizWizardProps) {
  const [questions, setQuestions] =
    useState<SurveyQuestionDto[]>(initialQuestions);
  const [answers, setAnswers] = useState<QuizAnswerMap>(initialAnswers);
  const [index, setIndex] = useState(() =>
    firstUnansweredIndex(initialQuestions, initialAnswers),
  );

  const submitAnswer = useSubmitAnswer();
  const unlockQuestions = useUnlockQuestions();
  const completeQuiz = useCompleteQuiz();

  const isBusy =
    submitAnswer.isPending ||
    unlockQuestions.isPending ||
    completeQuiz.isPending;
  const question = questions[index];
  const draft = answers[question.id] ?? EMPTY_DRAFT;
  const hasAnswer = draft.labelCodes.length > 0 || Boolean(draft.value?.trim());

  const handleFailure = (error: unknown, fallback: string) => {
    if (isSessionGoneError(error)) {
      onSessionLost();
      return;
    }
    toast.error(getApiErrorMessage(error, fallback));
  };

  /** Move forward, pulling in conditional questions unlocked by the answers so far. */
  const advance = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    try {
      const refreshed = await unlockQuestions.mutateAsync(surveyId);
      const knownIds = new Set(questions.map((item) => item.id));
      const unlocked = refreshed.filter((item) => !knownIds.has(item.id));

      if (unlocked.length > 0) {
        setQuestions([...questions, ...unlocked]);
        setIndex(index + 1);
        return;
      }
    } catch (error) {
      handleFailure(error, "Không thể tải thêm câu hỏi.");
      return;
    }

    try {
      await completeQuiz.mutateAsync(surveyId);
      onCompleted();
    } catch (error) {
      handleFailure(error, "Không thể hoàn tất bài test.");
    }
  };

  const handleNext = async () => {
    if (hasAnswer) {
      try {
        await submitAnswer.mutateAsync({
          surveyId,
          answer: {
            questionId: question.id,
            labelCodes: draft.labelCodes,
            ...(draft.value?.trim() ? { value: draft.value.trim() } : {}),
          },
        });
      } catch (error) {
        handleFailure(error, "Không thể lưu câu trả lời. Vui lòng thử lại.");
        return;
      }
    }
    await advance();
  };

  const isLastKnownQuestion = index === questions.length - 1;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>
            Câu {index + 1} / {questions.length}
          </span>
          <span className="uppercase">{question.category}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={question}
        draft={draft}
        onChange={(next) => setAnswers({ ...answers, [question.id]: next })}
      />

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={index === 0 || isBusy}
          onClick={() => setIndex(index - 1)}
          className="text-xs font-semibold"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={advance}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            disabled={isBusy}
            onClick={handleNext}
            className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                {isLastKnownQuestion ? "Hoàn tất" : "Tiếp tục"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
