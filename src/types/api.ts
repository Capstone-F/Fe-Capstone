/**
 * WHAT: Standardized API Server Response & Helper Types
 * WHY: Provides global contracts for API endpoints, responses, pagination, and payload structures.
 * HOW: Import directly in feature API modules (`@/features/<feature>/api/...`) or custom hooks.
 */

export type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export type JsonPayload = Record<string, unknown> | readonly unknown[];

/** Standard backend response wrapper */
export interface ServerResponse<T> {
  data: T;
  result: boolean;
  statusCode: number;
  detail: string | null;
  exception: string | null;
  traceId: string | null;
}

/** Standard paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
