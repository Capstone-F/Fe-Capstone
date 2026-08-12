import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneClasses = {
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  purple:
    "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
} as const;

export type StaffMetricTone = keyof typeof toneClasses;

interface StaffMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  /** Optional supporting line under the value. */
  hint?: string;
  tone?: StaffMetricTone;
  className?: string;
}

/** Metric tile matching the admin portal's `Metric` block. */
export function StaffMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "emerald",
  className,
}: StaffMetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          toneClasses[tone],
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
