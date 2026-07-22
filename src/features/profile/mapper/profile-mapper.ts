import type { SurveyAnswerResponse } from "../types/profile.types";

export function extractBaumannFromAnswers(
  answers: SurveyAnswerResponse[],
): string {
  const map: Record<string, string> = {};
  for (const a of answers) {
    if (a.value) map[a.questionCode] = a.value;
  }
  return (
    (map["OILY_DRY"] ?? "?") +
    (map["SENSITIVE_RESISTANT"] ?? "?") +
    (map["PIGMENTED_NON"] ?? "?") +
    (map["WRINKLE_TIGHT"] ?? "?")
  );
}
