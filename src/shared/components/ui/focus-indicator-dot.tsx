"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FocusIndicatorDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function FocusIndicatorDot({
  active = false,
  size = "md",
  className,
  ...props
}: FocusIndicatorDotProps) {
  const dotSize = sizeClasses[size];

  if (active) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          dotSize,
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-full w-full rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50",
          )}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 rounded-full bg-slate-300 transition-colors duration-200 dark:bg-slate-600",
        dotSize,
        className,
      )}
      {...props}
    />
  );
}
