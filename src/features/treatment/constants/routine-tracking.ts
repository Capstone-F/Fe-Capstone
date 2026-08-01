import type {
  CheckInMood,
  DayHistoryStatus,
  RoutinePeriod,
  SideEffectType,
  SkipReason,
  StepStockWarning,
} from "../types/routine-tracking.types";

export const PERIOD_LABELS: Record<RoutinePeriod, string> = {
  MORNING: "Buổi Sáng",
  EVENING: "Buổi Tối",
};

export const SKIP_REASON_LABELS: Record<SkipReason, string> = {
  OUT_OF_STOCK: "Hết sản phẩm",
  FORGOT: "Quên mất",
  OTHER: "Lý do khác",
};

export const SKIP_REASON_OPTIONS: SkipReason[] = [
  "OUT_OF_STOCK",
  "FORGOT",
  "OTHER",
];

export const SIDE_EFFECT_LABELS: Record<SideEffectType, string> = {
  PEELING: "Bong tróc",
  REDNESS: "Mẩn đỏ",
  BREAKOUT: "Mụn bùng phát",
  BLISTERS: "Nổi mụn nước",
  BURNING: "Rát, châm chích",
  ITCHING: "Ngứa",
};

export const SIDE_EFFECT_OPTIONS: SideEffectType[] = [
  "REDNESS",
  "ITCHING",
  "BURNING",
  "PEELING",
  "BREAKOUT",
  "BLISTERS",
];

export const MOOD_LABELS: Record<CheckInMood, string> = {
  GOOD: "Cải thiện",
  OK: "Không đổi",
  BAD: "Tệ hơn",
};

export const MOOD_OPTIONS: CheckInMood[] = ["GOOD", "OK", "BAD"];

export const DAY_STATUS_LABELS: Record<DayHistoryStatus, string> = {
  COMPLETED: "Hoàn thành",
  PARTIAL: "Chưa đủ",
  MISSED: "Bỏ lỡ",
  NOT_STARTED: "Chưa bắt đầu",
};

export const STOCK_WARNING_LABELS: Record<StepStockWarning, string> = {
  LOW: "Sắp hết",
  EMPTY: "Đã hết",
};

/** Badge colours: amber nudges, red demands action. */
export const STOCK_WARNING_BADGE_CLASS: Record<StepStockWarning, string> = {
  LOW: "border-amber-200 bg-amber-50 text-amber-700",
  EMPTY: "border-red-200 bg-red-50 text-red-700",
};

/** Neutral state for a product that is already on its way — never alarming. */
export const RESTOCKING_LABEL = "Đang bổ sung";
export const RESTOCKING_BADGE_CLASS = "border-sky-200 bg-sky-50 text-sky-700";

export const STOCK_WARNING_BANNER_CLASS: Record<StepStockWarning, string> = {
  LOW: "border-amber-200 bg-amber-50 text-amber-800",
  EMPTY: "border-red-200 bg-red-50 text-red-800",
};

/**
 * Supporting copy for a badge, e.g. "còn 2 ngày".
 *
 * Days rather than millilitres on purpose: the backend threshold is itself in days
 * (LOW at ≤ 5), and "còn ~4.5ml" reads as a measurement when it is really an estimate
 * derived from logged check-ins. Returns null when there is nothing useful to add —
 * either the estimate is unavailable, or the product is already empty and the label
 * alone says it.
 */
export function formatDaysLeft(daysLeft: number | null): string | null {
  if (daysLeft === null || daysLeft <= 0) {
    return null;
  }
  return daysLeft === 1 ? "còn 1 ngày" : `còn ${daysLeft} ngày`;
}

/** Tailwind classes for one calendar dot, keyed by day status. */
export const DAY_STATUS_DOT_CLASS: Record<DayHistoryStatus, string> = {
  COMPLETED: "bg-emerald-500 text-white",
  PARTIAL: "bg-amber-400 text-white",
  MISSED: "bg-red-200 text-red-700",
  NOT_STARTED: "bg-slate-100 text-slate-400",
};
