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
    descriptions: {
      W: "Wrinkled (Nhăn): Cần bổ sung chất chống oxy hóa và collagen sớm để chống chảy sệ và nếp nhăn đuôi mắt.",
      T: "Tight (Căng): Độ đàn hồi tự nhiên rất tốt, hàng rào bảo vệ vững vàng trước các dấu hiệu tuổi tác.",
    },
  },
];

/**
 * Backend stores signed sums, not percentages (survey.service.ts derives
 * oilyDryScore = oilyScore - dryScore, the other three keep their raw signed
 * total). Clamp at ±100 before turning a score into a marker position.
 */
const SCORE_CLAMP = 100;

function clampScore(score: number): number {
  return Math.max(-SCORE_CLAMP, Math.min(SCORE_CLAMP, score));
}

/** 0 = far left pole (O/S/P/W), 100 = far right pole (D/R/N/T). */
function toPosition(score: number): number {
  return 50 - clampScore(score) / 2;
}

function toStrength(score: number): BaumannSignalStrength {
  const magnitude = Math.abs(score);
  if (magnitude <= 20) return "Tín hiệu nhẹ";
  if (magnitude <= 60) return "Rõ";
  return "Rất rõ";
}

export function mapBaumannResult(
  skinType: SkinTypeSummaryDto | null | undefined,
  scores: BaumannScoresDto | null | undefined,
): BaumannResultView | null {
  const code = skinType?.code?.trim().toUpperCase();
  if (!code || code.length < AXIS_DEFINITIONS.length) return null;

  const axes: BaumannAxisView[] = AXIS_DEFINITIONS.map((axis, index) => {
    const activeLetter =
      code[index] === axis.rightLetter ? axis.rightLetter : axis.leftLetter;
    const score = scores?.[axis.scoreKey] ?? 0;
    const rawPosition = toPosition(score);
    // The code letter wins: keep the marker on the half matching the letter even
    // when the backend fell back to ORNT and the score disagrees.
    const position =
      activeLetter === axis.leftLetter
        ? Math.min(rawPosition, 50)
        : Math.max(rawPosition, 50);

    return {
      id: axis.id,
      leftLetter: axis.leftLetter,
      rightLetter: axis.rightLetter,
      leftLabel: axis.leftLabel,
      rightLabel: axis.rightLabel,
      activeLetter,
      activeDescription: axis.descriptions[activeLetter] ?? "",
      position,
      strength: toStrength(score),
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
