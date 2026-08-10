"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

type DatePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  fromYear?: number;
  className?: string;
};

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  invalid,
  placeholder = "Chọn ngày",
  fromYear = 1900,
  className,
}: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined;
  const today = new Date();

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid}
        className={cn(
          "border-input bg-background hover:bg-muted flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-normal",
          !selected && "text-muted-foreground",
          className,
        )}
      >
        {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        <CalendarIcon className="h-4 w-4 opacity-60" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          disabled={(date) =>
            date > today || date < new Date(`${fromYear}-01-01`)
          }
          captionLayout="dropdown"
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(today.getFullYear(), 11)}
          defaultMonth={selected ?? new Date(2000, 0)}
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  );
}
