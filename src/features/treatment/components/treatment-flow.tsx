"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTreatment } from "@/features/treatment/components/treatment-context";
import { IntroScreen } from "./intro-screen";
import { BaumannSkinTypeStep } from "./baumann-skin-type-step";
import { SurveyQuestions } from "./survey-questions";
import { AnalyzingScreen } from "./analyzing-screen";
import { ReportScreen } from "./report-screen";
import { PlanScreen } from "./plan-screen";
import { PurchaseScreen } from "./purchase-screen";
import { SuccessScreen } from "./success-screen";

export function TreatmentFlow() {
  const {
    state,
    setFlowState,
    startDynamicSurvey,
    fetchLatestRecommendations,
    fetchCustomerProfile,
  } = useTreatment();
  const searchParams = useSearchParams();
  const hasHandledParamsRef = useRef(false);

  useEffect(() => {
    if (hasHandledParamsRef.current) return;
    hasHandledParamsRef.current = true;

    const view = searchParams.get("view");
    const mode = searchParams.get("mode");

    if (mode === "restart") {
      void startDynamicSurvey();
      setFlowState("survey");
    } else if (view === "plan" || view === "purchase") {
      // Fetch latest profile and recommendations for existing user
      Promise.all([fetchCustomerProfile(), fetchLatestRecommendations()]).then(
        () => {
          setFlowState("plan");
        },
      );
    }
  }, [
    searchParams,
    setFlowState,
    startDynamicSurvey,
    fetchLatestRecommendations,
    fetchCustomerProfile,
  ]);

  const validFlows = [
    "intro",
    "baumann",
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
      {currentFlow === "baumann" && <BaumannSkinTypeStep />}
      {currentFlow === "survey" && <SurveyQuestions />}
      {currentFlow === "analyzing" && <AnalyzingScreen />}
      {currentFlow === "report" && <ReportScreen />}
      {currentFlow === "plan" && <PlanScreen />}
      {currentFlow === "purchase" && <PurchaseScreen />}
      {currentFlow === "success" && <SuccessScreen />}
    </div>
  );
}
