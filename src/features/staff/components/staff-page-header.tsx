import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StaffPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Buttons rendered on the trailing edge of the banner. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page banner shared by every staff screen. Mirrors the admin portal header so
 * both portals read as one design system instead of two.
 */
export function StaffPageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: StaffPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {actions ? (
        <div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
