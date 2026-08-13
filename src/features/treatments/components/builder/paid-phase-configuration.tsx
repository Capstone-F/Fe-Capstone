"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  useActivatePhase,
  useGenerateRoutine,
  useIngredients,
  useProductCandidates,
  useSaveRoutine,
  useSetPhaseIngredients,
  useSetPhaseProducts,
  useUpdateRoutine,
} from "../../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
  TreatmentPhase,
} from "../../types/treatment.types";
import { routineSchema } from "../../schemas/treatment-forms.schema";

const isUuid = (value: string | null) =>
  Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  );

import { RoutineEditor } from "./routine-editor";

export function PaidPhaseConfiguration({
  phases,
  onRefresh,
}: {
  phases: TreatmentPhase[];
  onRefresh: () => void;
}) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    phases.find((phase) => phase.status === "ACTIVE")?.id ??
      phases[0]?.id ??
      "",
  );
  const phase = phases.find((item) => item.id === selectedPhaseId);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          Cấu hình giai đoạn sau thanh toán
        </h2>
        <p className="text-xs text-slate-500">
          Chọn hoạt chất, sản phẩm, tạo routine rồi kích hoạt giai đoạn.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {phases.map((item) => (
          <Button
            key={item.id}
            variant={item.id === selectedPhaseId ? "default" : "outline"}
            onClick={() => setSelectedPhaseId(item.id)}
          >
            Giai đoạn {item.phaseOrder + 1}
          </Button>
        ))}
      </div>
      {phase && (
        <PhaseConfiguration
          key={phase.id}
          phase={phase}
          onRefresh={onRefresh}
        />
      )}
    </section>
  );
}

function PhaseConfiguration({
  phase,
  onRefresh,
}: {
  phase: TreatmentPhase;
  onRefresh: () => void;
}) {
  const { data: ingredients = [], isLoading } = useIngredients();
  const candidates = useProductCandidates(phase.id);
  const setIngredientsMutation = useSetPhaseIngredients();
  const setProductsMutation = useSetPhaseProducts();
  const generateMutation = useGenerateRoutine();
  const saveRoutineMutation = useSaveRoutine();
  const updateRoutineMutation = useUpdateRoutine();
  const activateMutation = useActivatePhase();
  const [ingredientIds, setIngredientIds] = useState<string[]>(
    phase.ingredients.map((item) => item.ingredientId),
  );
  const [productIds, setProductIds] = useState<string[]>(
    phase.products.map((item) => item.productVariantId),
  );
  const [routine, setRoutine] = useState<ExpertRoutine | null>(null);
  const [persistedRoutine, setPersistedRoutine] =
    useState<ExpertRoutine | null>(null);

  const busy =
    setIngredientsMutation.isPending ||
    setProductsMutation.isPending ||
    generateMutation.isPending ||
    saveRoutineMutation.isPending ||
    updateRoutineMutation.isPending ||
    activateMutation.isPending;
  const selectedProducts = useMemo(() => new Set(productIds), [productIds]);
  const hasSavedRoutine =
    routine?.status === "ACTIVE" ||
    phase.routines.some((item) => item.status === "ACTIVE");
  const savedRoutineSummary = phase.routines.find(
    (item) => item.status === "ACTIVE",
  );
  const hasDraftRoutine =
    routine?.status === "DRAFT" ||
    phase.routines.some((item) => item.status === "DRAFT");

  async function saveIngredients() {
    try {
      await setIngredientsMutation.mutateAsync({
        phaseId: phase.id,
        ingredientIds,
      });
      toast.success("Đã lưu hoạt chất cho giai đoạn.");
      await candidates.refetch();
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu hoạt chất.",
      );
    }
  }

  async function saveProducts() {
    try {
      await setProductsMutation.mutateAsync({
        phaseId: phase.id,
        productVariantIds: productIds,
      });
      toast.success("Đã lưu sản phẩm cho giai đoạn.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu sản phẩm.",
      );
    }
  }

  async function generateRoutine() {
    try {
      const generatedRoutine = await generateMutation.mutateAsync(phase.id);
      setRoutine(generatedRoutine);
      setPersistedRoutine(generatedRoutine);
      toast.success("Đã tạo bản nháp routine.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tạo routine.",
      );
    }
  }

  async function loadSavedRoutine() {
    if (!savedRoutineSummary) return;
    try {
      const { routine: serverRoutine } =
        await updateRoutineMutation.mutateAsync({
          routineId: savedRoutineSummary.id,
          treatmentId: phase.treatmentId,
          payload: {},
        });
      setRoutine(serverRoutine);
      setPersistedRoutine(serverRoutine);
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể tải routine đã lưu.",
      );
    }
  }

  function updateRoutineStep(
    stepId: string,
    patch: Partial<ExpertRoutineStep>,
  ) {
    setRoutine((current) =>
      current
        ? {
            ...current,
            steps: (current.steps ?? []).map((step) =>
              step.id === stepId ? { ...step, ...patch } : step,
            ),
          }
        : current,
    );
  }

  function addRoutineStep(period: RoutinePeriod) {
    setRoutine((current) => {
      if (!current) return current;
      const steps = current.steps ?? [];
      const stepOrder =
        steps
          .filter((step) => step.period === period)
          .reduce((maximum, step) => Math.max(maximum, step.stepOrder), -1) + 1;
      const now = new Date().toISOString();
      return {
        ...current,
        steps: [
          ...steps,
          {
            id: `new-${crypto.randomUUID()}`,
            routineId: current.id,
            name: "",
            period,
            stepOrder,
            instructions: null,
            waitMinutes: null,
            dosageText: null,
            details: [],
            createdAt: now,
            updatedAt: now,
          },
        ],
      };
    });
  }

  function deleteRoutineStep(stepId: string) {
    setRoutine((current) =>
      current
        ? {
            ...current,
            steps: (current.steps ?? []).filter((step) => step.id !== stepId),
          }
        : current,
    );
  }

  async function saveRoutine() {
    if (!routine) return;
    const parsed = routineSchema.safeParse({
      title: routine.title,
      description: routine.description ?? "",
      steps: (routine.steps ?? []).map((step) => ({
        name: step.name,
        period: step.period,
        instructions: step.instructions ?? "",
        dosageText: step.dosageText ?? "",
        waitMinutes: step.waitMinutes,
      })),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Routine chưa hợp lệ.");
      return;
    }

    try {
      const requestedSteps = routine.steps ?? [];
      const { routine: updatedRoutine } =
        await updateRoutineMutation.mutateAsync({
          routineId: routine.id,
          treatmentId: phase.treatmentId,
          payload: {
            title: routine.title.trim(),
            description: routine.description?.trim() || null,
            steps: requestedSteps.map((step, index) => ({
              id: isUuid(step.id) ? step.id : undefined,
              name: step.name.trim(),
              period: step.period,
              stepOrder: index,
              instructions: step.instructions?.trim() || null,
              waitMinutes: step.waitMinutes,
              dosageText: step.dosageText?.trim() || null,
            })),
          },
        });
      await saveRoutineMutation.mutateAsync({
        routineId: routine.id,
        treatmentId: phase.treatmentId,
      });
      setRoutine(updatedRoutine);
      setPersistedRoutine(updatedRoutine);
      toast.success("Đã lưu routine thành công!");
      onRefresh();
    } catch (reason) {
      setRoutine(persistedRoutine);
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu routine.",
      );
    }
  }

  async function activate() {
    try {
      await activateMutation.mutateAsync(phase.id);
      toast.success("Giai đoạn đã được kích hoạt.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể kích hoạt giai đoạn.",
      );
    }
  }

  return (
    <div className="grid gap-5 border bg-white p-5 lg:grid-cols-2">
      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Hoạt chất chỉ định
        </h3>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto border p-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            ingredients.map((ingredient) => (
              <label
                key={ingredient.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  checked={ingredientIds.includes(ingredient.id)}
                  onCheckedChange={(checked) =>
                    setIngredientIds((current) =>
                      checked
                        ? [...new Set([...current, ingredient.id])]
                        : current.filter((id) => id !== ingredient.id),
                    )
                  }
                />
                {ingredient.name}
              </label>
            ))
          )}
        </div>
        <Button
          className="mt-3"
          variant="outline"
          disabled={busy}
          onClick={() => void saveIngredients()}
        >
          <Save className="mr-2 h-4 w-4" /> Lưu hoạt chất
        </Button>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Sản phẩm phù hợp
        </h3>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto border p-3">
          {candidates.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : candidates.data?.length ? (
            candidates.data.map((product) => (
              <label
                key={product.productVariantId}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  checked={selectedProducts.has(product.productVariantId)}
                  onCheckedChange={(checked) =>
                    setProductIds((current) =>
                      checked
                        ? [...new Set([...current, product.productVariantId])]
                        : current.filter(
                            (id) => id !== product.productVariantId,
                          ),
                    )
                  }
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    {product.productName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {product.sku} · tồn {product.stockQuantity}
                  </span>
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Lưu hoạt chất để tải sản phẩm phù hợp.
            </p>
          )}
        </div>
        <Button
          className="mt-3"
          variant="outline"
          disabled={busy}
          onClick={() => void saveProducts()}
        >
          <Save className="mr-2 h-4 w-4" /> Lưu sản phẩm
        </Button>
      </section>

      {routine && (
        <RoutineEditor
          key={routine.id}
          routine={routine}
          disabled={busy}
          onRoutineChange={setRoutine}
          onStepChange={updateRoutineStep}
          onAddStep={addRoutineStep}
          onDeleteStep={deleteRoutineStep}
          onSave={() => void saveRoutine()}
        />
      )}

      <div className="flex flex-wrap gap-2 border-t pt-4 lg:col-span-2">
        {!hasSavedRoutine && (
          <Button
            variant="outline"
            disabled={busy || productIds.length === 0}
            onClick={() => void generateRoutine()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {hasDraftRoutine ? "Tạo lại bản nháp" : "Tạo routine"}
          </Button>
        )}
        {hasSavedRoutine && !routine && (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void loadSavedRoutine()}
          >
            <Check className="mr-2 h-4 w-4 text-emerald-700" /> Mở routine đã
            lưu
          </Button>
        )}
        <Button
          disabled={busy || phase.status === "ACTIVE" || hasDraftRoutine}
          onClick={() => void activate()}
        >
          <Check className="mr-2 h-4 w-4" /> Kích hoạt giai đoạn
        </Button>
      </div>
    </div>
  );
}
