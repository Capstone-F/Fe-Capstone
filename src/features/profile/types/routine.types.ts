import type {
  RoutinePeriod,
  RoutineStatus,
  RoutineType,
} from "@/core/api/types";

export interface RoutineStep {
  id: string;
  name: string;
  period: RoutinePeriod;
  stepOrder: number;
  instructions: string | null;
  productVariantId: string | null;
  protocolId: string | null;
}

export interface Routine {
  id: string;
  type: RoutineType;
  status: RoutineStatus;
  title: string;
  description: string | null;
  sourceOrderId: string | null;
  customerSurveyId: string | null;
  surveyRecommendationId: string | null;
  steps: RoutineStep[];
  createdAt: string;
}
