"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Circle,
  CircleAlert,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Sun,
  Moon,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
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
import {
  useActivatePhase,
  useAddPhase,
  useCreateTreatmentPlan,
  useDeletePhase,
  useGenerateRoutine,
  useIngredients,
  useProductCandidates,
  useSaveRoutine,
  useSetPhaseIngredients,
  useSetPhaseProducts,
  useSubmitPlan,
  useTreatmentChart,
  useTreatmentPlanDetail,
  useTreatmentPlans,
  useUpdatePhase,
  useUpdateRoutine,
} from "../../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
  TreatmentChart,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPlan,
} from "../../types/treatment.types";
import {
  getTreatmentStatusLabel,
  treatmentPhaseStatusLabel,
  treatmentPhaseTypeLabel,
} from "../../lib/treatment-labels";
import {
  createTreatmentPlanSchema,
  routineSchema,
  treatmentPhaseFormSchema,
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

export function ExpertTreatmentChart({ treatmentId }: { treatmentId: string }) {
  const chartQuery = useTreatmentChart(treatmentId);

  if (chartQuery.isLoading) {
    return (
      <section className="flex min-h-36 items-center justify-center border bg-white text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ điều
        trị...
      </section>
    );
  }

  if (chartQuery.isError || !chartQuery.data) {
    return (
      <section className="border border-red-200 bg-white p-5">
        <p className="text-sm text-red-700">
          Chuyên gia không thể tải hồ sơ điều trị này.
        </p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => void chartQuery.refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
        </Button>
      </section>
    );
  }

  const chart = chartQuery.data;
  const consultations = [
    chart.consultationResults.sourceConsultation,
    ...chart.consultationResults.followUpSessions,
  ].filter((session): session is NonNullable<typeof session> =>
    Boolean(session),
  );

  return (
    <section className="border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <Activity className="h-4 w-4 text-emerald-700" /> Hồ sơ điều trị
        </h2>
      </div>

      <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ChartMetric
          icon={<Camera className="h-4 w-4" />}
          label="Ảnh tiến độ"
          value={`${chart.progressPhotos.length} ảnh`}
        />
        <ChartMetric
          icon={<PackageCheck className="h-4 w-4" />}
          label="Lượt dùng sản phẩm"
          value={`${chart.productsUsed.reduce((sum, item) => sum + item.completedCount, 0)} lượt`}
        />
        <ChartMetric
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Lần tư vấn"
          value={`${consultations.length + chart.inPersonSessions.length} lần`}
        />
      </div>

      <div className="grid gap-6 border-t p-5 lg:grid-cols-2">
        <ChartPhaseNotes chart={chart} />
        <ChartActivity chart={chart} consultations={consultations} />
      </div>

      {chart.progressPhotos.length > 0 && (
        <div className="border-t p-5">
          <h3 className="text-sm font-semibold text-slate-950">Ảnh tiến độ</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {chart.progressPhotos.map((photo) => (
              <figure key={photo.id}>
                {photo.photoUrl ? (
                  <Image
                    src={photo.photoUrl}
                    alt={photo.title}
                    width={320}
                    height={320}
                    unoptimized
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                <figcaption className="mt-1 text-xs text-slate-600">
                  {photo.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ChartMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-5">
      <span className="text-emerald-700">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function ChartPhaseNotes({ chart }: { chart: TreatmentChart }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        Ghi chú theo giai đoạn
      </h3>
      <div className="mt-3 space-y-3">
        {chart.phases.map((phase) => (
          <article
            key={phase.id}
            className="border-l-2 border-emerald-600 pl-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-900">
                Giai đoạn {phase.phaseOrder + 1}:{" "}
                {phase.title || "Chưa đặt tên"}
              </p>
              <Badge variant="outline">
                {treatmentPhaseStatusLabel[phase.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-600">
              {phase.noteByExpert || "Chưa có ghi chú chuyên môn."}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ChartActivity({
  chart,
  consultations,
}: {
  chart: TreatmentChart;
  consultations: TreatmentChart["inPersonSessions"];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        Hoạt động và sản phẩm
      </h3>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Consultation</p>
          {consultations.length > 0 ? (
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {consultations.map((session) => (
                <li key={session.id}>
                  {session.isFollowUp ? "Tái khám" : "Tư vấn ban đầu"} ·{" "}
                  {session.status}
                  {session.scheduledAt ? ` · ${session.scheduledAt}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Chưa có dữ liệu.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">
            Sản phẩm đã sử dụng
          </p>
          {chart.productsUsed.length > 0 ? (
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {chart.productsUsed.map((item) => (
                <li key={item.productVariantId}>
                  {item.productName || item.sku || item.productVariantId} ·{" "}
                  {item.completedCount} lượt
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Chưa có dữ liệu.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">
            Tái khám trực tiếp
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {chart.inPersonSessions.length} buổi
          </p>
        </div>
      </div>
    </div>
  );
}
