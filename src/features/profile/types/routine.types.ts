export interface RoutineStep {
  id: string;
  name: string;
  period: "MORNING" | "EVENING";
  stepOrder: number;
  instructions: string | null;
  productVariantId: string | null;
  protocolId: string | null;
}

export interface Routine {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  sourceOrderId: string | null;
  customerSurveyId: string | null;
  surveyRecommendationId: string | null;
  steps: RoutineStep[];
  createdAt: string;
}
