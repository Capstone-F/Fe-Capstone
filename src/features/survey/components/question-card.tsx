"use client";

import { Check } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type {
  SurveyQuestionDto,
  SurveyQuestionOptionDto,
} from "@/types/survey";
import type { QuizAnswerDraft } from "../types/skin-quiz.types";

interface QuestionCardProps {
  question: SurveyQuestionDto;
  draft: QuizAnswerDraft;
  onChange: (draft: QuizAnswerDraft) => void;
}

/** Vietnamese copy wins when the taxonomy provides it. */
function optionLabel(option: SurveyQuestionOptionDto): string {
  return option.vietnameseNormalized?.trim() || option.name;
}

export function QuestionCard({ question, draft, onChange }: QuestionCardProps) {
  const isMultiSelect = question.questionType === "MULTI_SELECT";
  const hasOptions = question.options.length > 0;
  const headingId = `quiz-question-${question.id}`;

  const toggleOption = (labelCode: string) => {
    if (isMultiSelect) {
      const next = draft.labelCodes.includes(labelCode)
        ? draft.labelCodes.filter((code) => code !== labelCode)
        : [...draft.labelCodes, labelCode];
      onChange({ ...draft, labelCodes: next });
      return;
    }
    onChange({ ...draft, labelCodes: [labelCode] });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-bold text-slate-900">
          {question.text}
        </h2>
        {question.description && (
          <p className="text-xs text-slate-500">{question.description}</p>
        )}
        {isMultiSelect && (
          <p className="text-[11px] font-medium text-slate-400">
            Có thể chọn nhiều đáp án.
          </p>
        )}
      </div>

      {hasOptions ? (
        <div
          className="flex flex-col gap-2"
          role={isMultiSelect ? "group" : "radiogroup"}
          aria-labelledby={headingId}
        >
          {question.options.map((option) => {
            const isSelected = draft.labelCodes.includes(option.labelCode);
            return (
              <button
                key={option.labelCode}
                type="button"
                // Selection is otherwise conveyed by colour alone.
                role={isMultiSelect ? undefined : "radio"}
                aria-pressed={isMultiSelect ? isSelected : undefined}
                aria-checked={isMultiSelect ? undefined : isSelected}
                onClick={() => toggleOption(option.labelCode)}
                className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {/* Plain markers, not the Checkbox primitive: Base UI renders a
                    <button>, which cannot be nested inside this option button. */}
                {isMultiSelect ? (
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                )}
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-800">
                    {optionLabel(option)}
                  </span>
                  {option.description && (
                    <span className="text-[11px] text-slate-500">
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`quiz-text-${question.id}`}
            className="text-xs font-semibold text-slate-700"
          >
            Câu trả lời của bạn
          </Label>
          <Textarea
            id={`quiz-text-${question.id}`}
            value={draft.value ?? ""}
            onChange={(event) =>
              onChange({ ...draft, value: event.target.value })
            }
            placeholder="Nhập câu trả lời..."
            className="min-h-24 text-sm"
          />
        </div>
      )}
    </div>
  );
}
