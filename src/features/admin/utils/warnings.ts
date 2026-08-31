export function resolveWarnings(warnings?: string[]): string[] {
  return warnings ?? [];
}

// The backend identifies settings by their internal constant name, which
// isn't meaningful to an admin reading the warning. Swap in the same labels
// already shown on the settings fields whenever we recognize one.
const SETTING_LABELS: Record<string, string> = {
  BOOKING_MIN_LEAD_TIME_MIN: "Thời gian đặt trước tối thiểu",
  EXPERT_LATE_CANCEL_THRESHOLD_MIN: "Ngưỡng hủy sát giờ",
};

export function humanizeWarning(message: string): string {
  return message.replace(
    /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g,
    (token) => SETTING_LABELS[token] ?? token,
  );
}
