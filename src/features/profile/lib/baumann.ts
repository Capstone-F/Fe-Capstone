import type { BaumannScoresDto, SkinTypeSummaryDto } from "@/types/survey";

export type BaumannAxisId = "oil" | "sensitivity" | "pigment" | "aging";

export type BaumannScoreKey =
  | "oilyDryScore"
  | "sensitiveResistantScore"
  | "pigmentedNonPigmentedScore"
  | "wrinkledTightScore";

export interface BaumannAxis {
  id: BaumannAxisId;
  title: string;
  hint: string;
  /** Letter stored when the score sits on the negative side of the axis. */
  negativeLetter: string;
  negativeLabel: string;
  /** Letter stored when the score sits on the positive side of the axis. */
  positiveLetter: string;
  positiveLabel: string;
  scoreKey: BaumannScoreKey;
  /**
   * The backend resolves a zero score differently per axis: the oily/dry axis
   * uses `oilyScore >= dryScore` (tie -> O) while the other three use `score > 0`
   * (tie -> R/N/T). See Be-Capstone survey.service.ts deriveAndSaveSkinType.
   */
  positiveWhenZero: boolean;
}

/** Axis order matches the four letters of a Baumann code, e.g. O-S-P-T. */
export const BAUMANN_AXES: readonly BaumannAxis[] = [
  {
    id: "oil",
    title: "Độ dầu / Độ khô",
    hint: "Sau khi rửa mặt 30 phút, da bạn tiết dầu trở lại hay cảm thấy căng khô?",
    negativeLetter: "D",
    negativeLabel: "Da khô (D)",
    positiveLetter: "O",
    positiveLabel: "Da dầu (O)",
    scoreKey: "oilyDryScore",
    positiveWhenZero: true,
  },
  {
    id: "sensitivity",
    title: "Độ nhạy cảm",
    hint: "Da bạn có dễ đỏ, châm chích hoặc kích ứng khi đổi sản phẩm không?",
    negativeLetter: "R",
    negativeLabel: "Da khỏe (R)",
    positiveLetter: "S",
    positiveLabel: "Nhạy cảm (S)",
    scoreKey: "sensitiveResistantScore",
    positiveWhenZero: false,
  },
  {
    id: "pigment",
    title: "Sắc tố da",
    hint: "Da bạn có thâm sau mụn, nám hoặc tàn nhang rõ rệt không?",
    negativeLetter: "N",
    negativeLabel: "Không tăng sắc tố (N)",
    positiveLetter: "P",
    positiveLabel: "Tăng sắc tố (P)",
    scoreKey: "pigmentedNonPigmentedScore",
    positiveWhenZero: false,
  },
  {
    id: "aging",
    title: "Lão hóa",
    hint: "Bạn có thấy nếp nhăn, rãnh da hoặc dấu hiệu chảy xệ chưa?",
    negativeLetter: "T",
    negativeLabel: "Căng mịn (T)",
    positiveLetter: "W",
    positiveLabel: "Có nếp nhăn (W)",
    scoreKey: "wrinkledTightScore",
    positiveWhenZero: false,
  },
];

/**
 * Scores are stored signed, exactly as the backend derives them: the sign picks
 * the pole and the magnitude is the strength of the signal. The UI shows the
 * magnitude as a 0-100% figure so a customer never reads a negative number.
 *
 * The bound is 200 on every axis so one shared scale covers the ranges the
 * backend actually derives (oily/dry reaches ±160, pigment +145, wrinkle +150).
 * Only the sensitive axis can exceed it, and only when a customer declares all
 * eight allergy labels at once (theoretical ceiling 285).
 */
export const AXIS_SCORE_MIN = -200;
export const AXIS_SCORE_MAX = 200;
export const AXIS_SCORE_STEP = 10;

/** Magnitude restored when a saved code carries no score for that axis. */
const FALLBACK_MAGNITUDE = 100;

export type BaumannAxisScores = Record<BaumannAxisId, number>;

function clampScore(score: number): number {
  return Math.max(AXIS_SCORE_MIN, Math.min(AXIS_SCORE_MAX, Math.round(score)));
}

/** Which pole the score resolves to, using the backend's own tie rules. */
export function axisLetter(axis: BaumannAxis, score: number): string {
  const isPositive = axis.positiveWhenZero ? score >= 0 : score > 0;
  return isPositive ? axis.positiveLetter : axis.negativeLetter;
}

/** Signal strength shown to the customer: 0-100% of the axis bound, sign dropped. */
export function toStrengthPercent(score: number): number {
  return Math.round((Math.abs(score) / AXIS_SCORE_MAX) * 100);
}

export function buildBaumannCode(scores: BaumannAxisScores): string {
  return BAUMANN_AXES.map((axis) => axisLetter(axis, scores[axis.id])).join("");
}

/**
 * Seed the sliders from the profile: prefer the stored score, fall back to a
 * mid-strength value on the side the stored code implies, then to neutral.
 */
export function toAxisScores(
  skinType: SkinTypeSummaryDto | null | undefined,
  scores: BaumannScoresDto | null | undefined,
): BaumannAxisScores {
  const code = skinType?.code?.trim().toUpperCase() ?? "";

  const entries = BAUMANN_AXES.map((axis, index) => {
    const stored = scores?.[axis.scoreKey];
    if (typeof stored === "number") {
      return [axis.id, clampScore(stored)] as const;
    }

    const letter = code[index];
    if (letter === axis.positiveLetter) {
      return [axis.id, FALLBACK_MAGNITUDE] as const;
    }
    if (letter === axis.negativeLetter) {
      return [axis.id, -FALLBACK_MAGNITUDE] as const;
    }
    return [axis.id, 0] as const;
  });

  return Object.fromEntries(entries) as BaumannAxisScores;
}

/** Payload shape expected by PATCH /customers/me/skin-type. */
export function toSkinTypePayload(scores: BaumannAxisScores) {
  return {
    skinTypeCode: buildBaumannCode(scores),
    oilyDryScore: scores.oil,
    sensitiveResistantScore: scores.sensitivity,
    pigmentedNonPigmentedScore: scores.pigment,
    wrinkledTightScore: scores.aging,
  };
}
