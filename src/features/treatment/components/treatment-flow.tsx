"use client";

import { useTreatment } from "@/features/treatment/components/treatment-context";
import { IntroScreen } from "./intro-screen";
import { SurveyQuestions } from "./survey-questions";
import { AnalyzingScreen } from "./analyzing-screen";
import { ReportScreen } from "./report-screen";
import { PlanScreen } from "./plan-screen";
import { PurchaseScreen } from "./purchase-screen";
import { SuccessScreen } from "./success-screen";

export function TreatmentFlow() {
  const { state } = useTreatment();

  const validFlows = [
    "intro",
    "survey",
    "analyzing",
    "report",
    "plan",
    "purchase",
    "success",
  ];

  const currentFlow = validFlows.includes(state.flowState)
    ? state.flowState
    : "intro";

  return (
    <div className="mx-auto flex min-h-[600px] w-full max-w-md flex-col justify-between py-6 sm:max-w-lg md:max-w-5xl">
      {currentFlow === "intro" && <IntroScreen />}
      {currentFlow === "survey" && <SurveyQuestions />}
      {currentFlow === "analyzing" && <AnalyzingScreen />}
      {currentFlow === "report" && <ReportScreen />}
      {currentFlow === "plan" && <PlanScreen />}
      {currentFlow === "purchase" && <PurchaseScreen />}
      {currentFlow === "success" && <SuccessScreen />}
    </div>
  );
}
