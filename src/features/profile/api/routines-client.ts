import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import type { Routine, RoutineStep } from "../types/routine";

export type { Routine, RoutineStep };

/**
 * Fetch all routines for the current user.
 * Backend: GET /routines/me
 */
export async function getMyRoutines(): Promise<Routine[]> {
  if (appConfig.useMockApi) {
    return [
      {
        id: "routine-mock-1",
        type: "AI_RECOMMENDED",
        status: "ACTIVE",
        title: "Routine GlowScan AI Phục Hồi",
        description:
          "Lộ trình chăm sóc da hàng ngày được đề xuất bởi GlowScan AI dành riêng cho làn da Oily-Sensitive.",
        sourceOrderId: "ord_1",
        customerSurveyId: "sur_1",
        surveyRecommendationId: "rec_1",
        createdAt: new Date().toISOString(),
        steps: [
          {
            id: "step-am-1",
            name: "Làm sạch (Sáng)",
            period: "MORNING",
            stepOrder: 1,
            instructions:
              "Rửa mặt nhẹ nhàng với sữa rửa mặt dịu nhẹ pH 5.5 trong 30-60 giây.",
            productVariantId: "variant-cleanse",
            protocolId: null,
          },
          {
            id: "step-am-2",
            name: "Toner cân bằng",
            period: "MORNING",
            stepOrder: 2,
            instructions:
              "Thấm toner ra bông tẩy trang hoặc vỗ trực tiếp bằng tay sạch.",
            productVariantId: "variant-toner",
            protocolId: null,
          },
          {
            id: "step-am-3",
            name: "Tinh chất phục hồi",
            period: "MORNING",
            stepOrder: 3,
            instructions:
              "Thoa 3-4 giọt serum chứa Niacinamide hoặc B5 để làm dịu mẩn đỏ.",
            productVariantId: "variant-serum",
            protocolId: null,
          },
          {
            id: "step-am-4",
            name: "Kem chống nắng",
            period: "MORNING",
            stepOrder: 4,
            instructions:
              "Bôi đủ lượng kem chống nắng (khoảng 2 ngón tay) trước khi ra ngoài 20 phút.",
            productVariantId: "variant-sunscreen",
            protocolId: null,
          },
          {
            id: "step-pm-1",
            name: "Tẩy trang & Làm sạch",
            period: "EVENING",
            stepOrder: 1,
            instructions:
              "Dùng nước tẩy trang dịu nhẹ trước, sau đó rửa lại bằng sữa rửa mặt.",
            productVariantId: "variant-makeup-remover",
            protocolId: null,
          },
          {
            id: "step-pm-2",
            name: "Toner cân bằng",
            period: "EVENING",
            stepOrder: 2,
            instructions:
              "Dùng toner vỗ nhẹ cấp ẩm tức thì cho da sau rửa mặt.",
            productVariantId: "variant-toner",
            protocolId: null,
          },
          {
            id: "step-pm-3",
            name: "Tinh chất Retinol",
            period: "EVENING",
            stepOrder: 3,
            instructions:
              "Bôi lượng nhỏ bằng hạt đậu Retinol. Đợi 10-15 phút trước bước tiếp theo. Bác sĩ khuyên dùng lượng nhỏ.",
            productVariantId: "variant-retinol",
            protocolId: null,
          },
          {
            id: "step-pm-4",
            name: "Kem dưỡng ẩm ban đêm",
            period: "EVENING",
            stepOrder: 4,
            instructions:
              "Khóa ẩm bằng kem dưỡng phục hồi chuyên sâu để nuôi dưỡng da qua đêm.",
            productVariantId: "variant-moisturizer",
            protocolId: null,
          },
        ],
      },
    ];
  }
  return apiJson<Routine[]>(API_ENDPOINTS.ROUTINES.ME);
}

/**
 * Generate a routine from a paid survey order.
 * Backend: POST /routines/generate
 */
export async function generateRoutine(orderId: string): Promise<Routine> {
  return apiJson<Routine>(API_ENDPOINTS.ROUTINES.GENERATE, {
    method: "POST",
    body: { orderId },
  });
}
