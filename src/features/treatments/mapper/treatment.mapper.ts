import type {
  TreatmentPlan,
  TreatmentPhase,
  RoutineStep,
} from "../types/treatment.types";

export function mapBackendTreatmentToFrontend(
  be: Record<string, unknown>,
): TreatmentPlan {
  if (!be) {
    throw new Error("Invalid treatment plan data from server");
  }

  const rawPhases = Array.isArray(be.phases) ? be.phases : [];

  const phases: TreatmentPhase[] = rawPhases.map(
    (p: Record<string, unknown>, idx: number) => ({
      id: (p.id as string) || `phase_${idx + 1}`,
      phaseNumber: (p.phaseNumber as number) || idx + 1,
      title: (p.title as string) || `Giai đoạn ${idx + 1}`,
      durationWeeks: (p.durationWeeks as number) || 2,
      status: (
        (p.status as string) || "UPCOMING"
      ).toUpperCase() as TreatmentPhase["status"],
      targetIngredients: Array.isArray(p.targetIngredients)
        ? (p.targetIngredients as Ingredient[])
        : [],
      amSteps: Array.isArray(p.amSteps)
        ? p.amSteps.map((s: Record<string, unknown>, i: number) =>
            mapRoutineStep(s, i),
          )
        : [],
      pmSteps: Array.isArray(p.pmSteps)
        ? p.pmSteps.map((s: Record<string, unknown>, i: number) =>
            mapRoutineStep(s, i),
          )
        : [],
      notes: (p.notes as string) || "",
    }),
  );

  return {
    id: (be.id as string) || `tp_${Date.now()}`,
    customerId: (be.customerId as string) || "",
    customerName: (be.customerName as string) || "Bệnh nhân",
    expertId: (be.expertId as string) || "",
    expertName: (be.expertName as string) || "Chuyên gia da liễu",
    title: (be.title as string) || "Phác đồ điều trị chuyên sâu",
    totalFeeVnd: Number(be.totalFeeVnd) || 1200000,
    status: (
      (be.status as string) || "DRAFT"
    ).toUpperCase() as TreatmentPlan["status"],
    currentPhaseNumber: (be.currentPhaseNumber as number) || 1,
    phases,
    createdAt: (be.createdAt as string) || new Date().toISOString(),
    updatedAt: (be.updatedAt as string) || new Date().toISOString(),
  };
}

function mapRoutineStep(s: Record<string, unknown>, idx: number): RoutineStep {
  return {
    id: (s.id as string) || `step_${idx}`,
    order: (s.order as number) || idx + 1,
    timeOfDay: (s.timeOfDay as "AM" | "PM" | "BOTH") || "AM",
    stepName: (s.stepName as string) || "Bước chăm sóc da",
    productId: s.productId as string | undefined,
    productName: (s.productName as string) || "Sản phẩm chỉ định",
    productImage: s.productImage as string | undefined,
    frequencyPreset:
      (s.frequencyPreset as RoutineStep["frequencyPreset"]) || "Hàng ngày",
    frequencyCustom: s.frequencyCustom as string | undefined,
    instructionPreset:
      (s.instructionPreset as RoutineStep["instructionPreset"]) ||
      "Thoa mỏng toàn mặt",
    instructionCustom: s.instructionCustom as string | undefined,
  };
}
