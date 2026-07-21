"use client";

import { useTreatment } from "@/features/treatment/components/treatment-context";
import { IntroScreen } from "./intro-screen";
import { SurveyQuestions } from "./survey-questions";
import { AnalyzingScreen } from "./analyzing-screen";
import { ReportScreen } from "./report-screen";
import { PlanScreen } from "./plan-screen";
import { PurchaseScreen } from "./purchase-screen";
import { SuccessScreen } from "./success-screen";
import { DashboardScreen } from "./dashboard-screen";

export function TreatmentFlow() {
  const { state } = useTreatment();

  return (
    <div className="mx-auto flex min-h-[600px] w-full max-w-md flex-col justify-between py-6 sm:max-w-lg md:max-w-2xl">
      {state.flowState === "intro" && <IntroScreen />}
      {state.flowState === "survey" && <SurveyQuestions />}
      {state.flowState === "analyzing" && <AnalyzingScreen />}
      {state.flowState === "report" && <ReportScreen />}
      {state.flowState === "plan" && <PlanScreen />}
      {state.flowState === "purchase" && <PurchaseScreen />}
      {state.flowState === "success" && <SuccessScreen />}
      {state.flowState === "dashboard" && <DashboardScreen />}
    </div>
  );
}
