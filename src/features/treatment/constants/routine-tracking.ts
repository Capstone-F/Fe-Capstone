import type {
  CheckInMood,
  DayHistoryStatus,
  RoutinePeriod,
  SideEffectType,
  SkipReason,
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

/** Tailwind classes for one calendar dot, keyed by day status. */
export const DAY_STATUS_DOT_CLASS: Record<DayHistoryStatus, string> = {
  COMPLETED: "bg-emerald-500 text-white",
  PARTIAL: "bg-amber-400 text-white",
  MISSED: "bg-red-200 text-red-700",
  NOT_STARTED: "bg-slate-100 text-slate-400",
};
