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
}
