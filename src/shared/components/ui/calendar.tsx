"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";

function Calendar({
  className,
  classNames,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      className={cn("bg-popover p-3", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("flex flex-col", defaults.months),
        month: cn("space-y-3", defaults.month),
        month_caption: cn(
          "flex h-8 items-center justify-center",
          defaults.month_caption,
        ),
        caption_label: cn("text-sm font-semibold", defaults.caption_label),
        nav: cn("flex items-center justify-between", defaults.nav),
        button_previous: cn("h-8 w-8", defaults.button_previous),
        button_next: cn("h-8 w-8", defaults.button_next),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "w-9 text-center text-xs font-medium text-muted-foreground",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("relative h-9 w-9 p-0 text-center", defaults.day),
        day_button: cn(
          "h-9 w-9 rounded-md text-sm hover:bg-muted",
          defaults.day_button,
        ),
        selected: cn(
          "[&>button]:bg-primary [&>button]:text-primary-foreground",
          defaults.selected,
        ),
        today: cn(
          "[&>button]:border [&>button]:border-primary",
          defaults.today,
        ),
        outside: cn("text-muted-foreground opacity-50", defaults.outside),
        disabled: cn("text-muted-foreground opacity-40", defaults.disabled),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("h-4 w-4", iconClassName)}
              {...iconProps}
            />
          ) : (
            <ChevronRight
              className={cn("h-4 w-4", iconClassName)}
              {...iconProps}
            />
          ),
        DayButton: ({ className: buttonClassName, ...buttonProps }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", buttonClassName)}
            {...buttonProps}
          />
        ),
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
