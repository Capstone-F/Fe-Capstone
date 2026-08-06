import {
  SurveyRecord,
  SurveyQuestionDto,
  SurveyFaceLabelDto,
  RecommendationResponseDto,
  CustomerProfileResponseDto,
} from "@/types/domain";

export type SurveyAnswers = {
  // Baumann
  baumannOilyDry: "O" | "D" | "";
  baumannSensitiveResistant: "S" | "R" | "";
  baumannPigmentNon: "P" | "N" | "";
  baumannWrinkleTight: "W" | "T" | "";
  // Hydration
  hydration: 0 | 25 | 50 | 75 | 100 | "";
  // Current routine
  currentRoutineProducts: string;
  currentActiveIngredients: string[]; // Retinol, AHA, BHA, Vitamin C, Niacinamide, Benzoyl Peroxide
  morningRoutineText: string;
  eveningRoutineText: string;
  irritationStatus: "none" | "mild" | "redness" | "burning" | "itchy" | "";
  // Goals & Concern
  treatmentGoals: string[];
  primaryConcern: string;
  // Health
  pregnancy: "yes" | "no" | "declined" | "";
  breastfeeding: "yes" | "no" | "declined" | "";
  menstruation: "yes" | "no" | "declined" | "";
  hormonalChanges: "yes" | "no" | "declined" | "";
  otherDermatology: "yes" | "no" | "declined" | "";
  prescriptionMeds: "yes" | "no" | "declined" | "";
  // Photo
  photoUploaded: boolean;
  photoFile: string | null;
};

export type RoutineItem = {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  conflictWarning?: string;
  reason?: string;
};

export type FlowState =
  | "intro"
  | "survey"
  | "analyzing"
  | "report"
  | "plan"
  | "purchase"
  | "success"
  | "dashboard";

export type DashboardTab = "home" | "report" | "history" | "profile";

export type AiObservation = {
  acneSeverity: "Nhẹ" | "Trung bình" | "Nặng";
  darkSpots: "Nhẹ" | "Trung bình" | "Nặng";
  poreSize: "Mịn" | "Trung bình" | "Rộng";
  wrinkleDepth: "Thấp" | "Trung bình" | "Cao";
};

export type TreatmentData = {
  surveyAnswers: SurveyAnswers;
  surveyStep: number;
  flowState: FlowState;
  dashboardTab: DashboardTab;
  morningRoutine: RoutineItem[];
  eveningRoutine: RoutineItem[];
  aiObservation: AiObservation | null;
  surveyHistory?: SurveyRecord[];
  // Dynamic API state
  surveySessionId: string | null;
  dynamicQuestions: SurveyQuestionDto[];
  dynamicAnswers: Record<string, string[]>;
  dynamicTextAnswers: Record<string, string>;
  faceImageUrl: string | null;
  faceScannedAt: string | null;
  faceLabels: SurveyFaceLabelDto[];
  recommendations: RecommendationResponseDto | null;
  customerProfile: CustomerProfileResponseDto | null;
  isLoadingDynamic?: boolean;
  dynamicError?: string | null;
};

export type SkincareProduct = {
  id: string;
  protocolId?: string;
  protocolName?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  brand: string;
  reason: string;
  matchScore?: number;
  conflict?: boolean;
  conflictWarning?: string;
};
