import {
  StockImportFormStatus,
  type StockImportFormResponseDto,
} from "@/features/stock/types/stock.types";
import type { SupportSessionResponseDto } from "@/features/support/types/support.types";

/**
 * Pure aggregation helpers for the staff overview dashboard.
 *
 * The backend exposes no analytics endpoint, so every chart series is derived
 * client-side from the plain list responses. Keeping the logic here (no HTTP,
 * no React) makes it readable and reviewable on its own.
 */

export interface StockStatusPoint {
  /** Lower-cased status, used as the chart config key. */
  key: string;
  status: StockImportFormStatus;
  label: string;
  count: number;
}

export interface DailyCountPoint {
  /** Local date key, `YYYY-MM-DD`. */
  date: string;
  /** Short axis label, `DD/MM`. */
  label: string;
  count: number;
}

const STOCK_STATUS_ORDER: readonly StockImportFormStatus[] = [
  StockImportFormStatus.DRAFT,
  StockImportFormStatus.SUBMITTED,
  StockImportFormStatus.CONFIRMED,
  StockImportFormStatus.CANCELLED,
  StockImportFormStatus.REJECTED,
];

const STOCK_STATUS_LABELS: Record<StockImportFormStatus, string> = {
  [StockImportFormStatus.DRAFT]: "Bản nháp",
  [StockImportFormStatus.SUBMITTED]: "Chờ duyệt",
  [StockImportFormStatus.CONFIRMED]: "Đã nhập kho",
  [StockImportFormStatus.CANCELLED]: "Đã hủy",
  [StockImportFormStatus.REJECTED]: "Từ chối",
};

/** Local (not UTC) date key so buckets line up with what the staff member sees. */
function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function toAxisLabel(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${day}/${month}`;
}

/** Counts import forms per status, always returning all five buckets in order. */
export function buildStockStatusBreakdown(
  forms: readonly StockImportFormResponseDto[],
): StockStatusPoint[] {
  const counts = new Map<StockImportFormStatus, number>();
  for (const form of forms) {
    counts.set(form.status, (counts.get(form.status) ?? 0) + 1);
  }

  return STOCK_STATUS_ORDER.map((status) => ({
    key: status.toLowerCase(),
    status,
    label: STOCK_STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }));
}

/**
 * Counts support sessions created per day over the `days` window ending on
 * `referenceDate` (inclusive). Days with no session still appear with `0` so
 * the area chart keeps an even time axis.
 */
export function buildSupportSessionTrend(
  sessions: readonly SupportSessionResponseDto[],
  referenceDate: Date,
  days = 14,
): DailyCountPoint[] {
  const buckets = new Map<string, number>();
  for (const session of sessions) {
    const createdAt = new Date(session.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;
    const key = toDateKey(createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const points: DailyCountPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - offset,
    );
    const key = toDateKey(date);
    points.push({
      date: key,
      label: toAxisLabel(date),
      count: buckets.get(key) ?? 0,
    });
  }

  return points;
}

/** True when every bucket is empty — used to swap the chart for an empty state. */
export function isSeriesEmpty(points: readonly { count: number }[]): boolean {
  return points.every((point) => point.count === 0);
}
