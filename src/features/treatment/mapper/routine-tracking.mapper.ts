// DTO -> domain for the routine tracking loop. Every derived field the screens rely on
// (isActed, dosageLabel, parsed dates) is computed here exactly once — see
// routine-tracking.mapper.test.ts. History calendars need no mapping and are passed
// through by the hooks.

import type {
  CheckInResponseDto,
  HistoryDayDetailResponseDto,
  RoutineStepProductVariantDto,
  TodayRoutineDto,
  TodayRoutinesResponseDto,
  TodayStepDto,
} from "../types/routine-tracking.dto";
import type {
  HistoryDayDetail,
  RoutineCheckIn,
  RoutineStepProductVariant,
  TodayRoutine,
  TodaySession,
  TodayStep,
} from "../types/routine-tracking.types";

function resolveDosageLabel(dto: TodayStepDto): string | null {
  if (dto.dosageText) {
    return dto.dosageText;
  }
  return dto.amountMl !== null ? `${dto.amountMl} ml` : null;
}

function mapProductVariant(
  dto: RoutineStepProductVariantDto | null,
): RoutineStepProductVariant | null {
  if (dto === null) {
    return null;
  }
  return { ...dto, productId: dto.productId ?? null };
}

export function mapRoutineStep(dto: TodayStepDto): TodayStep {
  const isCompleted = dto.status === "COMPLETED";
  const isSkipped = dto.status === "SKIPPED";

  return {
    id: dto.id,
    name: dto.name,
    period: dto.period,
    stepOrder: dto.stepOrder,
    instructions: dto.instructions,
    waitMinutes: dto.waitMinutes,
    amountMl: dto.amountMl,
    protocolId: dto.protocolId,
    productVariant: mapProductVariant(dto.productVariant),
    status: dto.status,
    completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
    skipReason: dto.skipReason,
    skipNote: dto.skipNote,
    // Straight pass-through: the backend owns the thresholds (routine-tracking-flow.md
    // §4.6). Deriving them here would let the two drift apart.
    warning: dto.warning ?? null,
    daysLeft: dto.daysLeft ?? null,
    remainingMl: dto.remainingMl ?? null,
    isCompleted,
    isSkipped,
    isActed: isCompleted || isSkipped,
    dosageLabel: resolveDosageLabel(dto),
  };
}

export function mapTodayRoutine(dto: TodayRoutineDto): TodayRoutine {
  return {
    id: dto.id,
    type: dto.type,
    status: dto.status,
    title: dto.title,
    description: dto.description,
    sessionState: dto.sessionState,
    progress: dto.progress,
    steps: dto.steps.map(mapRoutineStep),
  };
}

export function mapTodaySession(dto: TodayRoutinesResponseDto): TodaySession {
  return {
    date: dto.date,
    period: dto.period,
    sessionState: dto.sessionState,
    reason: dto.reason,
    routines: dto.routines.map(mapTodayRoutine),
  };
}

export function mapCheckIn(dto: CheckInResponseDto): RoutineCheckIn {
  return {
    id: dto.id,
    routineId: dto.routineId,
    checkInDate: dto.checkInDate,
    period: dto.period,
    overallMood: dto.overallMood,
    acneLevel: dto.acneLevel,
    oilLevel: dto.oilLevel,
    rednessLevel: dto.rednessLevel,
    moistureLevel: dto.moistureLevel,
    completionRate: dto.completionRate,
    note: dto.note,
    sideEffects: dto.sideEffects,
    createdAt: new Date(dto.createdAt),
  };
}

export function mapHistoryDayDetail(
  dto: HistoryDayDetailResponseDto,
): HistoryDayDetail {
  return {
    date: dto.date,
    period: dto.period,
    status: dto.status,
    progress: dto.progress,
    steps: dto.steps.map(mapRoutineStep),
    checkIn: dto.checkIn ? mapCheckIn(dto.checkIn) : null,
  };
}
