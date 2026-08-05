import type { BaumannScoresDto, SkinTypeSummaryDto } from "@/types/survey";
import type {
  BaumannAxisId,
  BaumannAxisView,
  BaumannResultView,
  BaumannSignalStrength,
} from "../types/skin-quiz.types";

type AxisScoreKey =
  | "oilyDryScore"
  | "sensitiveResistantScore"
  | "pigmentedNonPigmentedScore"
  | "wrinkledTightScore";

interface AxisDefinition {
  id: BaumannAxisId;
  title: string;
  leftLetter: string;
  rightLetter: string;
  leftLabel: string;
  rightLabel: string;
  scoreKey: AxisScoreKey;
  /**
   * Largest score magnitude the backend can produce on this axis. Derived from
   * the label point table in `survey.service.ts deriveAndSaveSkinType` — see the
   * per-axis notes below. Used to normalise the signed score onto the track.
   */
  clamp: number;
  descriptions: Record<string, string>;
}

/** Axis order matches the 4 letters of a Baumann code, e.g. O-S-P-T. */
const AXIS_DEFINITIONS: readonly AxisDefinition[] = [
  {
    id: "OD",
    title: "Tuyến bã nhờn",
    leftLetter: "O",
    rightLetter: "D",
    leftLabel: "Da dầu (O)",
    rightLabel: "Da khô (D)",
    scoreKey: "oilyDryScore",
    // oilyDryScore = oilyScore - dryScore.
    // oilyScore max 160 (40+20+30+25+20+25), dryScore max 140 (40+30+25+20+15+10)
    // => range [-140, +160].
    clamp: 160,
    descriptions: {
      O: "Oily (Da Dầu): Tuyến bã nhờn hoạt động mạnh, có khuynh hướng bóng dầu vùng chữ T và dễ bít tắc tạo mụn đầu đen.",
      D: "Dry (Da Khô): Thiếu hụt lượng dầu tự nhiên bảo vệ da, dễ gây cảm giác khô căng sau khi rửa mặt.",
    },
  },
  {
    id: "SR",
    title: "Mức độ nhạy cảm",
    leftLetter: "S",
    rightLetter: "R",
    leftLabel: "Nhạy cảm (S)",
    rightLabel: "Da khỏe (R)",
    scoreKey: "sensitiveResistantScore",
    // Symptom points max 165 (40+30+40+30+25) plus 8 allergy labels x 15 = 120,
    // minus 20 for RESISTANT_TENDENCY => range [-20, +285].
    clamp: 285,
    descriptions: {
      S: "Sensitive (Da Nhạy Cảm): Dễ đỏ, ngứa hoặc mẩn rát khi gặp thay đổi thời tiết hoặc các hoạt chất điều trị mạnh (Retinol, AHA).",
      R: "Resistant (Da Khỏe): Hàng rào bảo vệ da vững chắc, ít khi kích ứng, thích hợp với nhiều nồng độ treatment cao.",
    },
  },
  {
    id: "PN",
    title: "Sắc tố",
    leftLetter: "P",
    rightLetter: "N",
    leftLabel: "Tăng sắc tố (P)",
    rightLabel: "Không sắc tố (N)",
    scoreKey: "pigmentedNonPigmentedScore",
    // Max 145 (40+30+30+25+20), minus 20 for NON_PIGMENTED_TENDENCY
    // => range [-20, +145].
    clamp: 145,
    descriptions: {
      P: "Pigmented (Tăng Sắc Tố): Dễ bị thâm sau mụn, dễ hình thành tàn nhang và sạm nám khi tiếp xúc với tia cực tím.",
      N: "Non-pigmented (Không Sắc Tố): Ít bị thâm sạm, da có khuynh hướng đều màu và phục hồi sắc tố nhanh hơn.",
    },
  },
  {
    id: "WT",
    title: "Độ đàn hồi",
    leftLetter: "W",
    rightLetter: "T",
    leftLabel: "Nếp nhăn (W)",
    rightLabel: "Căng mịn (T)",
    scoreKey: "wrinkledTightScore",
    // Max 150 (40+40+25+15+30, both age buckets counted), minus 20 for
    // TIGHT_TENDENCY => range [-20, +150].
    clamp: 150,
    descriptions: {
      W: "Wrinkled (Nhăn): Cần bổ sung chất chống oxy hóa và collagen sớm để chống chảy sệ và nếp nhăn đuôi mắt.",
      T: "Tight (Căng): Độ đàn hồi tự nhiên rất tốt, hàng rào bảo vệ vững vàng trước các dấu hiệu tuổi tác.",
    },
  },
];

/**
 * Backend stores signed sums, not percentages (survey.service.ts derives
 * oilyDryScore = oilyScore - dryScore, the other three keep their raw signed
 * total). Each axis is normalised against its own maximum magnitude
 * (`AxisDefinition.clamp`) so the marker keeps some gradation instead of
 * pinning to the edge of the track.
 */
function toRatio(score: number, clamp: number): number {
  return Math.max(-1, Math.min(1, score / clamp));
}

/** 0 = far left pole (O/S/P/W), 100 = far right pole (D/R/N/T). */
function toPosition(score: number, clamp: number): number {
  return 50 - toRatio(score, clamp) * 50;
}

/** Thresholds are fractions of the axis clamp, so the extremes still read "Rất rõ". */
function toStrength(score: number, clamp: number): BaumannSignalStrength {
  const magnitude = Math.abs(toRatio(score, clamp));
  if (magnitude <= 0.2) return "Tín hiệu nhẹ";
  if (magnitude <= 0.6) return "Rõ";
  return "Rất rõ";
}

export function mapBaumannResult(
  skinType: SkinTypeSummaryDto | null | undefined,
  scores: BaumannScoresDto | null | undefined,
): BaumannResultView | null {
  const code = skinType?.code?.trim().toUpperCase();
  if (!code || code.length < AXIS_DEFINITIONS.length) return null;

  // A letter matching neither pole means the code is corrupt; rendering it would
  // present garbage as a confident result, so treat the whole profile as absent.
  const isKnownCode = AXIS_DEFINITIONS.every(
    (axis, index) =>
      code[index] === axis.leftLetter || code[index] === axis.rightLetter,
  );
  if (!isKnownCode) return null;

  const axes: BaumannAxisView[] = AXIS_DEFINITIONS.map((axis, index) => {
    const activeLetter =
      code[index] === axis.rightLetter ? axis.rightLetter : axis.leftLetter;
    const score = scores?.[axis.scoreKey] ?? 0;
    const rawPosition = toPosition(score, axis.clamp);
    // The code letter wins: keep the marker on the half matching the letter even
    // when the backend fell back to ORNT and the score disagrees.
    const position =
      activeLetter === axis.leftLetter
        ? Math.min(rawPosition, 50)
        : Math.max(rawPosition, 50);

    return {
      id: axis.id,
      title: axis.title,
      leftLetter: axis.leftLetter,
      rightLetter: axis.rightLetter,
      leftLabel: axis.leftLabel,
      rightLabel: axis.rightLabel,
      activeLetter,
      activeDescription: axis.descriptions[activeLetter],
      position,
      strength: toStrength(score, axis.clamp),
    };
  });

  return {
    code,
    name: skinType?.name?.trim() || code,
    description: skinType?.description ?? null,
    assessedAt: scores?.assessedAt ?? null,
    axes,
  };
}
