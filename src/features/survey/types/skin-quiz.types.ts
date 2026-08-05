/** One answer held in wizard state, keyed by questionId. */
export interface QuizAnswerDraft {
  labelCodes: string[];
  value?: string;
}

export type QuizAnswerMap = Record<string, QuizAnswerDraft>;

export type BaumannAxisId = "OD" | "SR" | "PN" | "WT";

export type BaumannSignalStrength = "Tín hiệu nhẹ" | "Rõ" | "Rất rõ";

export interface BaumannAxisView {
  id: BaumannAxisId;
  /** Letter shown at the 0% end of the track (O / S / P / W). */
  leftLetter: string;
  /** Letter shown at the 100% end of the track (D / R / N / T). */
  rightLetter: string;
  leftLabel: string;
  rightLabel: string;
  /** Letter taken from skinType.code — authoritative for which pole is active. */
  activeLetter: string;
  activeDescription: string;
  /** Marker position on the track, 0 = left pole, 100 = right pole. */
  position: number;
  strength: BaumannSignalStrength;
}

export interface BaumannResultView {
  code: string;
  name: string;
  description: string | null;
  assessedAt: string | null;
  axes: BaumannAxisView[];
}
