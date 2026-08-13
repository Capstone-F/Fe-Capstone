"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatch } from "react-hook-form";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Plus, Save, Sun, Moon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {} from "@/shared/components/ui/accordion";
import {} from "@/shared/components/ui/alert";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatVnd } from "@/shared/utils/format";
import { FormController } from "@/shared/components/form/form-controller";
import { CurrencyInput } from "@/shared/components/form/currency-input";
import { cn } from "@/lib/utils";
import {} from "../../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
} from "../../types/treatment.types";
import {} from "../../lib/treatment-labels";
import {
  type CreateTreatmentPlanValues,
  type TreatmentPhaseFormValues,
} from "../../schemas/treatment-forms.schema";

const isUuid = (value: string | null) =>
  Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  );

function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function RoutineEditor({
  routine,
  disabled,
  onRoutineChange,
  onStepChange,
  onAddStep,
  onDeleteStep,
  onSave,
}: {
  routine: ExpertRoutine;
  disabled: boolean;
  onRoutineChange: (routine: ExpertRoutine) => void;
  onStepChange: (stepId: string, patch: Partial<ExpertRoutineStep>) => void;
  onAddStep: (period: RoutinePeriod) => void;
  onDeleteStep: (stepId: string) => void;
  onSave: () => void;
}) {
  const steps = routine.steps ?? [];
  const initialPeriod: RoutinePeriod = steps.some(
    (step) => step.period === "MORNING",
  )
    ? "MORNING"
    : "EVENING";

  return (
    <section className="space-y-5 border-t pt-5 lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">
              Routine điều trị
            </h3>
            <Badge variant="outline">
              {routine.status === "DRAFT" ? "Bản nháp" : "Đã lưu"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {steps.length} bước · sáng và tối
          </p>
        </div>
        <Button disabled={disabled} onClick={onSave}>
          <Save className="mr-2 h-4 w-4" /> Lưu routine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`routine-title-${routine.id}`}>Tên routine</Label>
          <Input
            id={`routine-title-${routine.id}`}
            value={routine.title}
            disabled={disabled}
            onChange={(event) =>
              onRoutineChange({ ...routine, title: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`routine-description-${routine.id}`}>Mô tả</Label>
          <Textarea
            id={`routine-description-${routine.id}`}
            value={routine.description ?? ""}
            disabled={disabled}
            rows={2}
            onChange={(event) =>
              onRoutineChange({
                ...routine,
                description: event.target.value || null,
              })
            }
          />
        </div>
      </div>

      <Tabs defaultValue={initialPeriod}>
        <TabsList>
          <TabsTrigger value="MORNING">
            <Sun className="mr-2 h-4 w-4" /> Buổi sáng
          </TabsTrigger>
          <TabsTrigger value="EVENING">
            <Moon className="mr-2 h-4 w-4" /> Buổi tối
          </TabsTrigger>
        </TabsList>
        {(["MORNING", "EVENING"] as const).map((period) => {
          const periodSteps = steps
            .filter((step) => step.period === period)
            .sort((left, right) => left.stepOrder - right.stepOrder);

          return (
            <TabsContent key={period} value={period} className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onAddStep(period)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm bước
                  {period === "MORNING" ? " buổi sáng" : " buổi tối"}
                </Button>
              </div>
              {periodSteps.length ? (
                periodSteps.map((step, index) => (
                  <RoutineStepEditor
                    key={step.id}
                    step={step}
                    displayOrder={index + 1}
                    disabled={disabled}
                    onChange={(patch) => onStepChange(step.id, patch)}
                    onDelete={() => onDeleteStep(step.id)}
                  />
                ))
              ) : (
                <div className="border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có bước cho buổi {period === "MORNING" ? "sáng" : "tối"}.
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}

function RoutineStepEditor({
  step,
  displayOrder,
  disabled,
  onChange,
  onDelete,
}: {
  step: ExpertRoutineStep;
  displayOrder: number;
  disabled: boolean;
  onChange: (patch: Partial<ExpertRoutineStep>) => void;
  onDelete: () => void;
}) {
  const sku = step.details?.[0]?.productVariant?.sku;

  return (
    <div className="border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Bước {displayOrder}</Badge>
        {sku && <span className="text-xs text-slate-500">{sku}</span>}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onDelete}
          className="ml-auto text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Xóa bước
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <div className="space-y-2 md:col-span-4">
          <Label htmlFor={`routine-step-name-${step.id}`}>Tên bước</Label>
          <Input
            id={`routine-step-name-${step.id}`}
            value={step.name}
            disabled={disabled}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Thời điểm</Label>
          <Select
            value={step.period}
            disabled={disabled}
            onValueChange={(value) => {
              if (value) onChange({ period: value });
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {step.period === "MORNING" ? "Buổi sáng" : "Buổi tối"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MORNING">Buổi sáng</SelectItem>
              <SelectItem value="EVENING">Buổi tối</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`routine-step-dosage-${step.id}`}>Liều lượng</Label>
          <Input
            id={`routine-step-dosage-${step.id}`}
            value={step.dosageText ?? ""}
            disabled={disabled}
            placeholder="Ví dụ: 2 lần nhấn"
            onChange={(event) =>
              onChange({ dosageText: event.target.value || null })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`routine-step-wait-${step.id}`}>
            Chờ trước bước tiếp theo (phút)
          </Label>
          <Input
            id={`routine-step-wait-${step.id}`}
            type="number"
            min={0}
            value={step.waitMinutes ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                waitMinutes:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
