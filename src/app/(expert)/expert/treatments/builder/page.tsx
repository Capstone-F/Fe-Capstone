import { Suspense } from "react";

import { TreatmentPlanBuilder } from "@/features/treatments/components/treatment-plan-builder";

export default function TreatmentBuilderPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-slate-500">Đang tải...</div>}
    >
      <TreatmentPlanBuilder />
    </Suspense>
  );
}
