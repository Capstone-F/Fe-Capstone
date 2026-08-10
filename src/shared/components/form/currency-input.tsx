"use client";

import type { ComponentProps } from "react";

import { Input } from "@/shared/components/ui/input";

type CurrencyInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "inputMode" | "value" | "defaultValue" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
};

function formatDigits(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function CurrencyInput({
  value,
  onValueChange,
  ...props
}: CurrencyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatDigits(value)}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "");
        onValueChange(digits.replace(/^0+(?=\d)/, ""));
      }}
    />
  );
}

export function parseVndInput(value: string): number {
  return value === "" ? Number.NaN : Number(value);
}
