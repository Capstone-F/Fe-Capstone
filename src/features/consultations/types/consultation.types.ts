import type {
  TreatmentPhaseStatus,
  TreatmentStatus,
} from "@/features/treatments/types/treatment.types";

export interface VideoTokenResponse {
  appID: number;
  token: string;
  roomID: string;
  userID: string;
  userName: string;
}

export interface ChatTokenResponse {
  appID: number;
  token: string;
  userID: string;
  userName: string;
  peerUserID: string;
  peerUserName: string;
}

export interface CustomerConsultationContext {
  customer: {
    id: string;
    phone: string | null;
    avatarUrl: string | null;
    dateOfBirth: string | null;
    gender: string;
    skinType: {
      code: string;
      name: string;
      description: string | null;
    } | null;
    baumannScores: {
      oilyDryScore: number | null;
      sensitiveResistantScore: number | null;
      pigmentedNonPigmentedScore: number | null;
      wrinkledTightScore: number | null;
      assessedAt: string | null;
    } | null;
  } | null;
  allergies: Array<{ id: string; code: string; name: string }>;
  surveyHistory: Array<{
    id: string;
    isCompleted: boolean;
    completedAt: string | null;
    createdAt: string;
    answers: Array<{
      questionCode: string;
      questionText: string;
      value: string | null;
      labels: Array<{ code: string; name: string }>;
    }>;
  }>;
  treatmentHistory: Array<{
    treatmentId: string;
    title: string;
    status: TreatmentStatus;
    startDate: string | null;
    endDate: string | null;
    expert: { id: string; name: string | null };
    clinic: { id: string; name: string } | null;
    currentPhase: {
      id: string;
      phaseOrder: number;
      title: string | null;
      status: TreatmentPhaseStatus;
      noteByExpert: string | null;
    } | null;
    phaseCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
