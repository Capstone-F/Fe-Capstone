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
    | Pick<
        RecommendationResponseDto,
        "customerSurveyId" | "products" | "protocols"
      >
    | null
    | undefined,
  _surveySessionId?: string | null,
): SurveyRecommendationStatus {
  void _surveySessionId;
  if (!recommendation) {
    return "missing";
  }

  const hasProtocols = Boolean(
    recommendation.protocols && recommendation.protocols.length > 0,
  );
  const hasProducts = Boolean(
    recommendation.products && recommendation.products.length > 0,
  );

  if (!hasProtocols && !hasProducts) {
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

  for (let i = 0; i < (recommendation.products || []).length; i++) {
    const product = recommendation.products[i];
    const key =
      product.productVariantId ||
      product.productId ||
      product.recommendationItemId ||
      product.protocolId ||
      `product_${i}`;

    if (deduped.has(key)) {
      continue;
    }

    const hasConflict = conflictCodes.has(product.protocolCode);
    const rawScore = product.matchScore ?? 1;
    const matchScore = Math.round(rawScore > 1 ? rawScore : rawScore * 100);

    deduped.set(key, {
      id: key,
      protocolId: product.protocolId,
      protocolName: product.protocolName,
      name: product.productName || product.protocolName,
      category: product.protocolName,
      price: product.priceVnd || 0,
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
