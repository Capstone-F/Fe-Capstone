// Pure decision logic for the Care Hub screen. Kept free of React and of the HTTP
// layer so every branch is unit-testable — see care-hub-state.test.ts.

import type { SessionState } from "../types/routine-tracking.types";

/** What the Care Hub should render, in priority order. */
export type CareHubState =
  | { status: "AUTH_PENDING" }
  | { status: "GUEST" }
  | { status: "ERROR" }
  | { status: "LOADING" }
  | { status: "NO_ROUTINE" }
  | { status: "READY"; sessionState: SessionState };

export interface CareHubInput {
  isSessionLoading: boolean;
  isLoggedIn: boolean;
  isTodayLoading: boolean;
  isTodayError: boolean;
  /** Top-level sessionState of the Today payload; undefined until it loads. */
  sessionState: SessionState | undefined;
}

interface RoutineSessionLike {
  sessionState: SessionState;
}

interface RoutineProgressLike {
  progress: {
    completedCount: number;
    skippedCount: number;
    totalCount: number;
  };
}

export interface AggregatedProgress {
  completedCount: number;
  skippedCount: number;
  totalCount: number;
  /** completedCount / totalCount — skips deliberately do not inflate it. */
  completionRate: number;
}

/**
 * Top-level aggregation from 10-routine-tracking-module.md §3.4: unanimous states win,
 * anything mixed is IN_PROGRESS. Mirrors the backend so an optimistic cache update can
 * re-derive it without waiting for the refetch.
 */
export function aggregateSessionState(
  routines: readonly RoutineSessionLike[],
): SessionState {
  if (routines.length === 0) {
    return "EMPTY";
  }
  const states = routines.map((routine) => routine.sessionState);
  const unanimous = (state: SessionState) =>
    states.every((candidate) => candidate === state);

  if (unanimous("COMPLETED")) return "COMPLETED";
  if (unanimous("NOT_STARTED")) return "NOT_STARTED";
  if (unanimous("MISSED")) return "MISSED";
  return "IN_PROGRESS";
}

/** Sum per-routine progress for the period the screen is showing. */
export function aggregateProgress(
  routines: readonly RoutineProgressLike[],
): AggregatedProgress {
  const totals = routines.reduce(
    (accumulator, routine) => ({
      completedCount:
        accumulator.completedCount + routine.progress.completedCount,
      skippedCount: accumulator.skippedCount + routine.progress.skippedCount,
      totalCount: accumulator.totalCount + routine.progress.totalCount,
    }),
    { completedCount: 0, skippedCount: 0, totalCount: 0 },
  );

  return {
    ...totals,
    completionRate:
      totals.totalCount > 0
        ? Math.round((totals.completedCount / totals.totalCount) * 100)
        : 0,
  };
}

export function resolveCareHubState(input: CareHubInput): CareHubState {
  if (input.isSessionLoading) {
    return { status: "AUTH_PENDING" };
  }
  if (!input.isLoggedIn) {
    return { status: "GUEST" };
  }
  if (input.isTodayError) {
    return { status: "ERROR" };
  }
  if (input.sessionState === undefined || input.isTodayLoading) {
    return { status: "LOADING" };
  }
  if (input.sessionState === "EMPTY") {
    return { status: "NO_ROUTINE" };
  }
  return { status: "READY", sessionState: input.sessionState };
}

export interface CheckInPromptInput {
  /** sessionState on the previous render; undefined on first paint. */
  previous: SessionState | undefined;
  current: SessionState | undefined;
  hasCheckIn: boolean;
}

/**
 * Flow §5 prompts the daily check-in after the last step is acted on. Only the
 * transition into COMPLETED counts, so revisiting a finished day stays quiet.
 */
export function shouldPromptCheckIn(input: CheckInPromptInput): boolean {
  return (
    input.previous !== undefined &&
    input.previous !== "COMPLETED" &&
    input.current === "COMPLETED" &&
    !input.hasCheckIn
  );
}
