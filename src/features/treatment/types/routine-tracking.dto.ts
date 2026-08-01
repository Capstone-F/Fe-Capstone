// Transport shapes only — a 1:1 mirror of
// Be-Capstone/src/routines/dto/routine-tracking-response.dto.ts.
// Nothing outside api/ and mapper/ should import from this file: screens consume the
// domain model in routine-tracking.types.ts instead.

import type {
  RoutinePeriod,
  RoutineStatus,
  RoutineType,
} from "@/core/api/types";
import type {
  CheckInMood,
  DayHistoryStatus,
  RoutineProgress,
  RoutineStepProductVariant,
  SessionState,
  SideEffectType,
  SkipReason,
  StepSessionStatus,
  StepStockWarning,
} from "./routine-tracking.types";

/**
 * Wire variant shape. `productId` is optional here because backend builds predating
 * feat/treatment-tracking omit it entirely; the mapper normalises it to null.
 */
export interface RoutineStepProductVariantDto extends Omit<
  RoutineStepProductVariant,
  "productId"
> {
  productId?: string | null;
}

export interface TodayStepDto {
  id: string;
  name: string;
  period: RoutinePeriod;
  stepOrder: number;
  instructions: string | null;
  waitMinutes: number | null;
  dosageText: string | null;
  amountMl: number | null;
  protocolId: string | null;
  productVariant: RoutineStepProductVariantDto | null;
  status: StepSessionStatus;
  /** ISO-8601 string; the mapper turns it into a Date. */
  completedAt: string | null;
  skipReason: SkipReason | null;
  skipNote: string | null;
  /**
   * Optional at the wire level: absent entirely on backend builds predating
   * feat/treatment-tracking. The mapper normalises undefined to null.
   */
  warning?: StepStockWarning | null;
  daysLeft?: number | null;
  remainingMl?: number | null;
}

export interface TodayRoutineDto {
  id: string;
  type: RoutineType;
  status: RoutineStatus;
  title: string;
  description: string | null;
  sessionState: SessionState;
  progress: RoutineProgress;
  steps: TodayStepDto[];
}

export interface TodayRoutinesResponseDto {
  /** Server VN calendar date (YYYY-MM-DD). Use this, never the device clock. */
  date: string;
  period: RoutinePeriod;
  sessionState: SessionState;
  reason?: "NO_ACTIVE_ROUTINE";
  routines: TodayRoutineDto[];
}

export interface CheckInSideEffectDto {
  id: string;
  type: SideEffectType;
  severity: number | null;
  note: string | null;
}

export interface CheckInResponseDto {
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
  sideEffects: CheckInSideEffectDto[];
  createdAt: string;
}

export interface HistoryDayDetailResponseDto {
  date: string;
  period: RoutinePeriod;
  status: DayHistoryStatus;
  progress: RoutineProgress;
  steps: TodayStepDto[];
  checkIn: CheckInResponseDto | null;
}
