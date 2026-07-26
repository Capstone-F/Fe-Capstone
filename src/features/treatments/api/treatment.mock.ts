import type { TreatmentPlan, Ingredient } from "../types/treatment.types";

export const MOCK_INGREDIENTS: Ingredient[] = [
  {
    id: "ing_01",
    name: "Salicylic Acid (BHA)",
    category: "Tẩy tế bào chết & Trị mụn",
  },
  {
    id: "ing_02",
    name: "Niacinamide (Vitamin B3)",
    category: "Phục hồi & Giảm thâm",
  },
  {
    id: "ing_03",
    name: "Hyaluronic Acid (HA)",
    category: "Cấp ẩm & Căng bóng",
  },
  { id: "ing_04", name: "Retinol 0.5%", category: "Tái tạo & Chống lão hóa" },
  { id: "ing_05", name: "Ceramides", category: "Phục hồi hàng rào bảo vệ da" },
  { id: "ing_06", name: "Azelaic Acid", category: "Kháng viêm & Mờ thâm đỏ" },
];

const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: "tp_demo_01",
    customerId: "user_customer_demo",
    customerName: "normal111",
    expertId: "seed-expert-d1-derma",
    expertName: "Dr. Nguyen Van An",
    title: "Phác đồ điều trị mụn viêm & phục hồi hàng rào da (6 Tuần)",
    totalFeeVnd: 1500000,
    status: "ACTIVE",
    currentPhaseNumber: 1,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    phases: [
      {
        id: "phase_01",
        phaseNumber: 1,
        title: "Giai đoạn 1: Giảm viêm & Cấp ẩm phục hồi",
        durationWeeks: 2,
        status: "ACTIVE",
        targetIngredients: [MOCK_INGREDIENTS[1], MOCK_INGREDIENTS[4]],
        notes: "Tập trung phục hồi màng ẩm da trước khi dùng BHA/Retinol.",
        amSteps: [
          {
            id: "step_am_1",
            order: 1,
            timeOfDay: "AM",
            stepName: "Sữa rửa mặt dịu nhẹ",
            productName: "GlowScan Gentle Cleanser",
            frequencyPreset: "Hàng ngày",
            instructionPreset: "Thoa mỏng toàn mặt",
          },
          {
            id: "step_am_2",
            order: 2,
            timeOfDay: "AM",
            stepName: "Serum Niacinamide 5%",
            productName: "GlowScan Barrier Recovery Serum",
            frequencyPreset: "Hàng ngày",
            instructionPreset: "Dùng 2-3 giọt",
          },
          {
            id: "step_am_3",
            order: 3,
            timeOfDay: "AM",
            stepName: "Kem chống nắng phổ rộng",
            productName: "GlowScan Daily Sunscreen SPF50+",
            frequencyPreset: "Hàng ngày",
            instructionPreset: "Thoa mỏng toàn mặt",
          },
        ],
        pmSteps: [
          {
            id: "step_pm_1",
            order: 1,
            timeOfDay: "PM",
            stepName: "Nước tẩy trang Micellar",
            productName: "GlowScan Soft Micellar Water",
            frequencyPreset: "Hàng ngày",
            instructionPreset: "Thoa mỏng toàn mặt",
          },
          {
            id: "step_pm_2",
            order: 2,
            timeOfDay: "PM",
            stepName: "Kem dưỡng ẩm Ceramides",
            productName: "GlowScan Intense Moisture Cream",
            frequencyPreset: "Hàng ngày",
            instructionPreset: "Thoa mỏng toàn mặt",
          },
        ],
      },
      {
        id: "phase_02",
        phaseNumber: 2,
        title: "Giai đoạn 2: Tẩy tế bào chết & Gom cồi mụn",
        durationWeeks: 4,
        status: "UPCOMING",
        targetIngredients: [MOCK_INGREDIENTS[0], MOCK_INGREDIENTS[1]],
        amSteps: [],
        pmSteps: [],
      },
    ],
  },
];

export const treatmentMock = {
  getPlans: async (customerId?: string): Promise<TreatmentPlan[]> => {
    if (customerId) {
      return mockTreatmentPlans.filter((p) => p.customerId === customerId);
    }
    return mockTreatmentPlans;
  },

  getPlanById: async (id: string): Promise<TreatmentPlan | null> => {
    return mockTreatmentPlans.find((p) => p.id === id) || null;
  },

  createPlan: async (
    planData: Partial<TreatmentPlan>,
  ): Promise<TreatmentPlan> => {
    const newPlan: TreatmentPlan = {
      id: `tp_${Date.now()}`,
      customerId: planData.customerId || "user_customer_demo",
      customerName: planData.customerName || "Bệnh nhân",
      expertId: planData.expertId || "seed-expert-d1-derma",
      expertName: planData.expertName || "Dr. Nguyen Van An",
      title: planData.title || "Phác đồ điều trị chuyên sâu",
      totalFeeVnd: planData.totalFeeVnd || 1200000,
      status: "ACTIVE",
      currentPhaseNumber: 1,
      phases: planData.phases || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTreatmentPlans.unshift(newPlan);
    return newPlan;
  },
};
