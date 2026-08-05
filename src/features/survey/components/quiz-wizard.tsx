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

/**
 * Merge a freshly fetched question list into the local wizard list.
 *
 * Appends whatever the backend has newly unlocked and drops the entries it has
 * stopped returning — but only those positioned after `currentIndex`. Anything
 * at or before the cursor has already been answered, and removing it would
 * shift the cursor onto a different question.
 *
 * NOTE: this only prunes the local list. Answers already stored server-side for
 * the retracted questions stay in the survey and keep feeding the Baumann
 * scoring; clearing them needs a backend delete-answer endpoint, which does not
 * exist yet.
 */
function reconcileQuestions(
  current: SurveyQuestionDto[],
  refreshed: SurveyQuestionDto[],
  currentIndex: number,
): SurveyQuestionDto[] {
  const refreshedIds = new Set(refreshed.map((item) => item.id));
  const kept = current.filter(
    (item, position) => position <= currentIndex || refreshedIds.has(item.id),
  );
  const keptIds = new Set(kept.map((item) => item.id));
  const unlocked = refreshed.filter((item) => !keptIds.has(item.id));
  return [...kept, ...unlocked];
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
  // Set once the customer uses "Quay lại": from then on a re-submitted answer can
  // retract conditional questions that an earlier answer had unlocked.
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false);

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

  /**
   * Move forward, pulling in conditional questions unlocked by the answers so far.
   * `list` lets the caller pass a list it has just reconciled, because the
   * `questions` state read here is still the pre-update render value.
   */
  const advance = async (list: SurveyQuestionDto[] = questions) => {
    if (index < list.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    try {
      const refreshed = await unlockQuestions.mutateAsync(surveyId);
      const merged = reconcileQuestions(list, refreshed, index);

      if (index < merged.length - 1) {
        // `merged` only drives the branch; the write goes through the queue so it
        // composes with a reconcile the caller may already have queued.
        setQuestions((prev) => reconcileQuestions(prev, refreshed, index));
        setIndex((prev) => prev + 1);
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
    let list = questions;

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

      // After a backward edit, re-read the question set so the branches the old
      // answer had unlocked disappear from the remaining steps.
      if (hasNavigatedBack && index < questions.length - 1) {
        try {
          const refreshed = await unlockQuestions.mutateAsync(surveyId);
          list = reconcileQuestions(questions, refreshed, index);
          setQuestions(list);
        } catch (error) {
          if (isSessionGoneError(error)) {
            onSessionLost();
            return;
          }
          // Non-fatal: the answer is saved, so keep walking the stale local list.
        }
      }
    }

    await advance(list);
  };

  const isLastKnownQuestion = index === questions.length - 1;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>
            Câu {index + 1} / {questions.length}
          </span>
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
        onChange={(next) =>
          setAnswers((prev) => ({ ...prev, [question.id]: next }))
        }
      />

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={index === 0 || isBusy}
          onClick={() => {
            setHasNavigatedBack(true);
            setIndex((prev) => prev - 1);
          }}
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
            onClick={() => advance()}
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
