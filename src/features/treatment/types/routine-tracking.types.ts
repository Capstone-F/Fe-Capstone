// Domain model for the routine tracking loop — what screens and hooks consume.
// The wire format lives in routine-tracking.dto.ts; mapper/routine-tracking.mapper.ts
// converts one into the other and owns every derived field below.

import type {
  RoutinePeriod,
  RoutineStatus,
  RoutineType,
} from "@/core/api/types";

// Shared with the profile feature — single declaration lives in core.
export type { RoutinePeriod, RoutineStatus, RoutineType };

export type StepSessionStatus = "PENDING" | "COMPLETED" | "SKIPPED";
/** Backend-computed stock estimate for a step's product. Never derived on the client. */
export type StepStockWarning = "LOW" | "EMPTY";
export type SkipReason = "OUT_OF_STOCK" | "FORGOT" | "OTHER";
export type CheckInMood = "GOOD" | "OK" | "BAD";
export type SideEffectType =
  | "PEELING"
  | "REDNESS"
  | "BREAKOUT"
  | "BLISTERS"
  | "BURNING"
  | "ITCHING";
export type SessionState =
  | "EMPTY"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MISSED";
export type DayHistoryStatus =
  | "COMPLETED"
  | "PARTIAL"
  | "MISSED"
  | "NOT_STARTED";

export interface RoutineStepProductVariant {
  id: string;
  /**
   * Catalog product id for GET /products/:id. Null when the backend build predates
   * the stock-warning contract (feat/treatment-tracking, unmerged) — callers must
   * hide the product-detail link rather than route to undefined.
   */
  productId: string | null;
  name: string;
  sku: string | null;
  /** Populated since the stock-warning backend build; still null on older builds. */
  imageUrl: string | null;
}

export interface RoutineProgress {
  completedCount: number;
  skippedCount: number;
  totalCount: number;
  /** completedCount / totalCount * 100. Skips do not inflate this. */
  completionRate: number;
}

export interface TodayStep {
  id: string;
  name: string;
  period: RoutinePeriod;
  stepOrder: number;
  instructions: string | null;
  waitMinutes: number | null;
  amountMl: number | null;
  protocolId: string | null;
  productVariant: RoutineStepProductVariant | null;
  status: StepSessionStatus;
  completedAt: Date | null;
  skipReason: SkipReason | null;
  skipNote: string | null;
  /** Backend stock estimate. Null = fine, or not estimable → render no reorder UI. */
  warning: StepStockWarning | null;
  /**
   * Whole days of scheduled use left, floor(remainingMl / dailyUsageMl). This is what
   * the UI shows: the backend triggers LOW at ≤ 5 days, so days are the unit the
   * threshold actually speaks in. Null when the backend cannot estimate.
   */
  daysLeft: number | null;
  /** Raw remaining volume behind `daysLeft`. Kept for debugging; not rendered. */
  remainingMl: number | null;
  // --- derived by the mapper ---
  isCompleted: boolean;
  isSkipped: boolean;
  /** Completed or skipped: the backend refuses to change it again today (409). */
  isActed: boolean;
  /** Ready-to-render dosage: backend text, else the millilitre amount. */
  dosageLabel: string | null;
}

export interface TodayRoutine {
  id: string;
  type: RoutineType;
  status: RoutineStatus;
  title: string;
  description: string | null;
  sessionState: SessionState;
  progress: RoutineProgress;
  steps: TodayStep[];
}

export interface TodaySession {
  /** Server VN calendar date (YYYY-MM-DD). Use this, never the device clock. */
  date: string;
  period: RoutinePeriod;
  sessionState: SessionState;
  reason?: "NO_ACTIVE_ROUTINE";
  routines: TodayRoutine[];
}

export interface CheckInSideEffect {
  id: string;
  type: SideEffectType;
  severity: number | null;
  note: string | null;
}

export interface RoutineCheckIn {
  id: string;
  routineId: string;
  checkInDate: string;
  period: RoutinePeriod;
  overallMood: CheckInMood | null;
  acneLevel: number | null;
  oilLevel: number | null;
  rednessLevel: number | null;
  moistureLevel: number | null;
  completionRate: number | null;
  note: string | null;
  sideEffects: CheckInSideEffect[];
  createdAt: Date;
}

export interface HistoryDay {
  date: string;
  status: DayHistoryStatus;
  completionRate: number;
}

export interface HistorySummary {
  currentStreak: number;
  averageCompletionRate: number;
}

/**
 * Adherence calendar. Wire shape and domain shape are identical (plain numbers and
 * `YYYY-MM-DD` strings, nothing derived), so this one is passed through unmapped.
 */
export interface RoutineHistoryResponse {
  routineId: string;
  days: HistoryDay[];
  summary: HistorySummary;
}

export interface HistoryDayDetail {
  date: string;
  period: RoutinePeriod;
  status: DayHistoryStatus;
  progress: RoutineProgress;
  steps: TodayStep[];
  checkIn: RoutineCheckIn | null;
}

export interface SkipStepPayload {
  reason: SkipReason;
  /** Required by the backend when reason is OTHER. */
  note?: string;
}

export interface CreateCheckInSideEffectPayload {
  type: SideEffectType;
  severity?: number;
  note?: string;
}

export interface CreateCheckInPayload {
  period?: RoutinePeriod;
  overallMood?: CheckInMood;
  acneLevel?: number;
  oilLevel?: number;
  rednessLevel?: number;
  moistureLevel?: number;
  note?: string;
  sideEffects?: CreateCheckInSideEffectPayload[];
}

export interface DateRangeQuery {
  from: string;
  to: string;
}
