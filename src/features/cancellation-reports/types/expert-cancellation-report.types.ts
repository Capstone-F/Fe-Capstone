export interface ExpertCancellationStatItem {
  expertId: string;
  expertName: string | null;
  clinicId: string | null;
  clinicName: string | null;
  isActive: boolean;
  assignedCount: number;
  expertCancelCount: number;
  lateCancelCount: number;
  noShowCount: number;
  violationScore: number;
  cancelRate: number | null;
  exceedsLimit: boolean;
}

export interface ExpertCancellationStatsResponse {
  windowDays: number;
  cancelLimit: number;
  noShowWeight: number;
  from: string;
  totalExperts: number;
  flaggedCount: number;
  items: ExpertCancellationStatItem[];
}

export interface ExpertCancellationStatsQuery {
  days?: number;
  clinicId?: string;
}

export interface ExpertCancellationPolicyDto {
  cancelLimit: number;
  windowDays: number;
  noShowWeight: number;
  lateCancelThresholdMin: number;
  warnings?: string[];
}

export type UpdateExpertCancellationPolicyDto =
  Partial<ExpertCancellationPolicyDto>;
