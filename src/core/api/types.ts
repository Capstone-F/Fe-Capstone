export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  title?: string;
  status?: number;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

/**
 * Routine transport enums — mirror Be-Capstone/src/routines/enums.ts.
 * Shared by the profile feature (routine list / generate) and the treatment
 * feature (daily tracking), so they live here instead of being re-declared.
 */
export type RoutinePeriod = "MORNING" | "EVENING";
export type RoutineType = "AI_RECOMMENDED" | "EXPERT_PRESCRIBED";
export type RoutineStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";

export type FileStorageType = "Local" | "External" | "S3" | "Azure";

export interface FileAttachment {
  id: number;
  fileName: string;
  publicUrl: string | null;
  contentType: string | null;
  size: number;
  storageType: FileStorageType;
  createdAt: string;
}
