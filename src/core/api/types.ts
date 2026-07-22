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
