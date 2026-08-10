export type BaumannAxisKey = "oil" | "sensitivity" | "pigment" | "aging";

export type BaumannCodeLetter = "O" | "D" | "S" | "R" | "P" | "N" | "W" | "T";

export interface BaumannAxisDetail {
  key: BaumannAxisKey;
  label: string;
  positiveCode: BaumannCodeLetter; // e.g. O, S, P, W
  negativeCode: BaumannCodeLetter; // e.g. D, R, N, T
  positiveLabel: string;
  negativeLabel: string;
  score: number; // e.g. -50 to +50 or raw score from BE
  letter: BaumannCodeLetter;
  description: string;
}

export interface ParsedBaumannProfile {
  code: string;
  title: string;
  description: string;
  axes: Record<BaumannAxisKey, BaumannAxisDetail>;
}

const BAUMANN_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  OSPT: {
    title: "Da Dầu, Nhạy Cảm, Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da có xu hướng tiết nhiều dầu, dễ bị kích ứng/đỏ da và tăng sắc tố thâm nám, nhưng kết cấu da vẫn săn chắc và ít nếp nhăn.",
  },
  OSPW: {
    title: "Da Dầu, Nhạy Cảm, Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Làn da tiết nhiều dầu, dễ mẩn đỏ/kích ứng, dễ thâm mụn và đồng thời có dấu hiệu lão hóa, xuất hiện nếp nhăn.",
  },
  OSNT: {
    title: "Da Dầu, Nhạy Cảm, Không Tăng Sắc Tố, Căng Mịn",
    desc: "Da hay đổ dầu và nhạy cảm với thời tiết/mỹ phẩm, nhưng tông màu da tương đối đều và da có độ đàn hồi tốt.",
  },
  OSNW: {
    title: "Da Dầu, Nhạy Cảm, Không Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Làn da dầu và dễ nhạy cảm, ít bị thâm nám nhưng đã xuất hiện nếp nhăn và suy giảm collagen.",
  },
  ORPT: {
    title: "Da Dầu, Khỏe (Bền), Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da tiết dầu nhưng hàng rào bảo vệ da rất khỏe, ít bị kích ứng, tuy nhiên dễ hình thành vết thâm và tàn nhang.",
  },
  ORPW: {
    title: "Da Dầu, Khỏe (Bền), Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Da tiết dầu và chịu đựng mỹ phẩm tốt, nhưng gặp vấn đề về thâm nám và dấu hiệu tuổi tác.",
  },
  ORNT: {
    title: "Da Dầu, Khỏe (Bền), Không Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da lý tưởng nhất trong nhóm da dầu: khỏe mạnh, không kích ứng, đều màu và săn chắc.",
  },
  ORNW: {
    title: "Da Dầu, Khỏe (Bền), Không Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Da khỏe và ít thâm nám, tiết dầu vừa phải nhưng cần chú trọng chống lão hóa.",
  },
  DSPT: {
    title: "Da Khô, Nhạy Cảm, Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da thiếu ẩm/dầu, hàng rào bảo vệ mỏng nên dễ đỏ rát và thâm nám, nhưng da vẫn giữ được độ căng.",
  },
  DSPW: {
    title: "Da Khô, Nhạy Cảm, Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Làn da dry & sensitive cần phục hồi hàng rào bảo vệ da cấp thiết, giảm thâm và dưỡng ẩm chuyên sâu.",
  },
  DSNT: {
    title: "Da Khô, Nhạy Cảm, Không Tăng Sắc Tố, Căng Mịn",
    desc: "Da thiếu độ ẩm tự nhiên, dễ bong tróc và kích ứng, nhưng màu da khá đều.",
  },
  DSNW: {
    title: "Da Khô, Nhạy Cảm, Không Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Làn da khô nhạy cảm có nguy cơ lão hóa nhanh, cần bổ sung ceramide và các chất chống oxy hóa dịu nhẹ.",
  },
  DRPT: {
    title: "Da Khô, Khỏe (Bền), Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da khô nhưng ít bị kích ứng mỹ phẩm, có vết thâm/nám nhẹ và cấu trúc da còn săn chắc.",
  },
  DRPW: {
    title: "Da Khô, Khỏe (Bền), Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Da khô khỏe cần cấp ẩm chuyên sâu kết hợp retinoid/peptide để cải thiện thâm và nếp nhăn.",
  },
  DRNT: {
    title: "Da Khô, Khỏe (Bền), Không Tăng Sắc Tố, Căng Mịn",
    desc: "Làn da khô đều màu, khỏe mạnh, chỉ cần tập trung dưỡng ẩm duy trì độ ẩm tự nhiên.",
  },
  DRNW: {
    title: "Da Khô, Khỏe (Bền), Không Tăng Sắc Tố, Có Nếp Nhăn",
    desc: "Da khô ít thâm nám nhưng xu hướng hình thành nếp nhăn nhanh do thiếu ẩm lâu ngày.",
  },
};

export function parseBaumannCode(
  rawCode?: string | null,
  scores?: {
    oilyDryScore?: number | null;
    sensitiveResistantScore?: number | null;
    pigmentedNonPigmentedScore?: number | null;
    wrinkledTightScore?: number | null;
  } | null,
): ParsedBaumannProfile {
  const cleanCode = (rawCode || "ORNT").toUpperCase().slice(0, 4);
  const [oLetter, sLetter, pLetter, wLetter] = cleanCode.split(
    "",
  ) as BaumannCodeLetter[];

  const oilyDryScore = scores?.oilyDryScore ?? (oLetter === "O" ? 25 : -25);
  const sensitiveScore =
    scores?.sensitiveResistantScore ?? (sLetter === "S" ? 30 : -20);
  const pigmentedScore =
    scores?.pigmentedNonPigmentedScore ?? (pLetter === "P" ? 25 : -15);
  const wrinkledScore =
    scores?.wrinkledTightScore ?? (wLetter === "W" ? 30 : -20);

  const metadata = BAUMANN_DESCRIPTIONS[cleanCode] || {
    title: `Loại da ${cleanCode}`,
    desc: "Hồ sơ phân tích làn da theo 4 trục lý thuyết Baumann từ thuật toán GlowScan.",
  };

  return {
    code: cleanCode,
    title: metadata.title,
    description: metadata.desc,
    axes: {
      oil: {
        key: "oil",
        label: "Độ Tiết Dầu & Độ Ẩm",
        positiveCode: "O",
        negativeCode: "D",
        positiveLabel: "Da Dầu (Oily)",
        negativeLabel: "Da Khô (Dry)",
        score: oilyDryScore,
        letter: oLetter || "O",
        description:
          oilyDryScore >= 0
            ? "Tuyến bã nhờn hoạt động mạnh, nhiều dầu vùng T-zone."
            : "Thiếu hụt dầu tự nhiên, da dễ căng khô và bong tróc.",
      },
      sensitivity: {
        key: "sensitivity",
        label: "Độ Nhạy Cảm",
        positiveCode: "S",
        negativeCode: "R",
        positiveLabel: "Nhạy Cảm (Sensitive)",
        negativeLabel: "Da Khỏe (Resistant)",
        score: sensitiveScore,
        letter: sLetter || "R",
        description:
          sensitiveScore > 0
            ? "Dễ mẩn đỏ, châm chích hoặc phản ứng với mỹ phẩm/thời tiết."
            : "Hàng rào bảo vệ da vững chắc, ít bị kích ứng.",
      },
      pigment: {
        key: "pigment",
        label: "Sắc Tố Da",
        positiveCode: "P",
        negativeCode: "N",
        positiveLabel: "Tăng Sắc Tố (Pigmented)",
        negativeLabel: "Đều Màu (Non-pigmented)",
        score: pigmentedScore,
        letter: pLetter || "N",
        description:
          pigmentedScore > 0
            ? "Dễ xuất hiện vết thâm sau mụn, nám hoặc tàn nhang."
            : "Sắc tố da tương đối đồng đều, ít bị sạm thâm.",
      },
      aging: {
        key: "aging",
        label: "Lão Hóa & Độ Đàn Hồi",
        positiveCode: "W",
        negativeCode: "T",
        positiveLabel: "Có Nếp Nhăn (Wrinkled)",
        negativeLabel: "Căng Mịn (Tight)",
        score: wrinkledScore,
        letter: wLetter || "T",
        description:
          wrinkledScore > 0
            ? "Có dấu hiệu sụt giảm collagen, nếp nhăn nông/sâu."
            : "Kết cấu da săn chắc, đàn hồi tốt.",
      },
    },
  };
}
