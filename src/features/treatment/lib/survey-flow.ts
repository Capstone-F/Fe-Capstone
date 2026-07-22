import type { RecommendationResponseDto } from "@/types/domain";

import type { SkincareProduct } from "../types/treatment";

type SurveyProfileLike = {
  dateOfBirth?: string | null;
  gender?: string | null;
};

export type SurveyProfileField = "dateOfBirth" | "gender";

export type SurveyRecommendationStatus = "ok" | "missing" | "stale" | "empty";

export function getRequiredSurveyProfileFields(
  profile: SurveyProfileLike | null | undefined,
): SurveyProfileField[] {
  const missing: SurveyProfileField[] = [];

  if (!profile?.dateOfBirth) {
    missing.push("dateOfBirth");
  }

  if (!profile?.gender) {
    missing.push("gender");
  }

  return missing;
}

export function validateSurveyRecommendation(
  recommendation:
    | Pick<RecommendationResponseDto, "customerSurveyId" | "products">
    | null
    | undefined,
  surveySessionId: string | null | undefined,
): SurveyRecommendationStatus {
  if (!recommendation || !surveySessionId) {
    return "missing";
  }

  if (recommendation.customerSurveyId !== surveySessionId) {
    return "stale";
  }

  if (
    !recommendation.products.some((product) =>
      Boolean(product.productVariantId),
    )
  ) {
    return "empty";
  }

  return "ok";
}

export function mapRecommendationProducts(
  recommendation:
    | Pick<RecommendationResponseDto, "conflicts" | "products">
    | null
    | undefined,
): SkincareProduct[] {
  if (!recommendation) {
    return [];
  }

  const conflictCodes = new Set(
    (recommendation.conflicts ?? []).flatMap((conflict) => [
      conflict.protocolCode,
      conflict.conflictingProtocolCode,
    ]),
  );

  const deduped = new Map<string, SkincareProduct>();

  for (const product of recommendation.products) {
    if (!product.productVariantId || deduped.has(product.productVariantId)) {
      continue;
    }

    const hasConflict = conflictCodes.has(product.protocolCode);
    const matchScore = Math.round(product.matchScore * 100);

    deduped.set(product.productVariantId, {
      id: product.productVariantId,
      protocolId: product.protocolId,
      protocolName: product.protocolName,
      name: product.productName,
      category: product.protocolName,
      price: product.priceVnd,
      brand: product.protocolCode,
      reason: `Do phác đồ ${product.protocolName} đánh giá phù hợp ${matchScore}%.`,
      matchScore: product.matchScore,
      ...(hasConflict
        ? {
            conflict: true,
            conflictWarning:
              "Backend phát hiện protocol này có xung đột với một khuyến nghị khác. Hãy xem kỹ trước khi thanh toán.",
          }
        : {}),
    });
  }

  return Array.from(deduped.values());
}

export function getSurveyReviewStep(questionCount: number): number {
  return Math.max(1, questionCount);
}
