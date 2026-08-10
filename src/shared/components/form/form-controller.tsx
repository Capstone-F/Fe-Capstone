"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";

type FormControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Pick<ControllerProps<TFieldValues, TName>, "control" | "name"> & {
  label?: string;
  description?: string;
  className?: string;
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName>["render"]
    >[0]["field"],
  ) => ReactNode;
};

export function FormController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  children,
}: FormControllerProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          {children(field)}
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
