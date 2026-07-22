import axios from "axios";
import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly traceId?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(options: {
    message: string;
    status?: number;
    code?: string;
    traceId?: string;
    fieldErrors?: Record<string, string[]>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.traceId = options.traceId;
    this.fieldErrors = options.fieldErrors;
  }
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiError({
      message: "Đã xảy ra lỗi không xác định.",
      cause: error,
    });
  }

  const responseData = error.response?.data;

  const message =
    responseData?.detail ??
    responseData?.message ??
    responseData?.title ??
    error.message ??
    "Không thể kết nối đến máy chủ.";

  return new ApiError({
    message,
    status: error.response?.status,
    code: responseData?.code,
    traceId: responseData?.traceId,
    fieldErrors: responseData?.errors,
    cause: error,
  });
};
