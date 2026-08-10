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
        root: cn("relative w-fit", defaults.root),
        months: cn("flex flex-col", defaults.months),
        month: cn("space-y-3", defaults.month),
        month_caption: cn(
          "flex h-8 items-center justify-center px-10",
          defaults.month_caption,
        ),
        caption_label: cn(
          "flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold",
          defaults.caption_label,
        ),
        dropdowns: cn(
          "flex items-center justify-center gap-1",
          defaults.dropdowns,
        ),
        dropdown_root: cn(
          "border-input bg-background hover:bg-muted relative inline-flex h-8 items-center rounded-md border",
          defaults.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 z-10 cursor-pointer opacity-0",
          defaults.dropdown,
        ),
        months_dropdown: cn("appearance-none", defaults.months_dropdown),
        years_dropdown: cn("appearance-none", defaults.years_dropdown),
        nav: cn(
          "pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between",
          defaults.nav,
        ),
        button_previous: cn(
          "pointer-events-auto h-8 w-8",
          defaults.button_previous,
        ),
        button_next: cn("pointer-events-auto h-8 w-8", defaults.button_next),
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
