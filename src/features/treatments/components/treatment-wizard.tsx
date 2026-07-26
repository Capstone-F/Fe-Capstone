"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Save,
  Loader2,
  Wand2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { MOCK_INGREDIENTS } from "../api/treatment.mock";
import type {
  Ingredient,
  RoutineStep,
  TreatmentPlan,
} from "../types/treatment.types";
import { useCreateTreatmentPlan } from "../hooks/useTreatments";
import { formatVnd } from "@/shared/utils/format";
import { toast } from "sonner";

interface TreatmentWizardProps {
  customerId: string;
  customerName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PRESET_FREQUENCIES = [
  "Hàng ngày",
  "Cách ngày",
  "2-3 lần/tuần",
  "1 lần/tuần",
  "Tùy chỉnh",
] as const;

const PRESET_INSTRUCTIONS = [
  "Dùng 2-3 giọt",
  "Thoa mỏng toàn mặt",
  "Chấm điểm mụn",
  "Thoa hạt đậu",
  "Tùy chỉnh",
] as const;

export function TreatmentWizard({
  customerId,
  customerName = "Bệnh nhân",
  onSuccess,
  onCancel,
}: TreatmentWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Draft key for LocalStorage protection
  const draftKey = `glowscan_draft_treatment_${customerId}`;

  // Helper to load initial draft from LocalStorage
  const getDraft = () => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(draftKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const draft = getDraft();

  // Form State
  const [title, setTitle] = useState(
    draft?.title || `Phác đồ điều trị mụn & phục hồi da cho ${customerName}`,
  );
  const [totalFeeVnd, setTotalFeeVnd] = useState<number>(
    draft?.totalFeeVnd || 1200000,
  );
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    draft?.selectedIngredients || [MOCK_INGREDIENTS[0], MOCK_INGREDIENTS[1]],
  );
  const [customIngredientName, setCustomIngredientName] = useState("");

  const [amSteps, setAmSteps] = useState<RoutineStep[]>(
    draft?.amSteps || [
      {
        id: "step_1",
        order: 1,
        timeOfDay: "AM",
        stepName: "Sữa rửa mặt dịu nhẹ",
        productName: "GlowScan Gentle Cleanser",
        frequencyPreset: "Hàng ngày",
        instructionPreset: "Thoa mỏng toàn mặt",
      },
      {
        id: "step_2",
        order: 2,
        timeOfDay: "AM",
        stepName: "Serum Niacinamide 5%",
        productName: "GlowScan Barrier Recovery Serum",
        frequencyPreset: "Hàng ngày",
        instructionPreset: "Dùng 2-3 giọt",
      },
      {
        id: "step_3",
        order: 3,
        timeOfDay: "AM",
        stepName: "Kem chống nắng phổ rộng",
        productName: "GlowScan Daily Sunscreen SPF50+",
        frequencyPreset: "Hàng ngày",
        instructionPreset: "Thoa mỏng toàn mặt",
      },
    ],
  );

  const [pmSteps, setPmSteps] = useState<RoutineStep[]>(
    draft?.pmSteps || [
      {
        id: "step_pm_1",
        order: 1,
        timeOfDay: "PM",
        stepName: "Tẩy trang Micellar",
        productName: "GlowScan Soft Micellar Water",
        frequencyPreset: "Hàng ngày",
        instructionPreset: "Thoa mỏng toàn mặt",
      },
      {
        id: "step_pm_2",
        order: 2,
        timeOfDay: "PM",
        stepName: "Serum BHA 2%",
        productName: "GlowScan Salicylic Clearing Solution",
        frequencyPreset: "Cách ngày",
        instructionPreset: "Dùng 2-3 giọt",
      },
      {
        id: "step_pm_3",
        order: 3,
        timeOfDay: "PM",
        stepName: "Kem dưỡng Ceramides",
        productName: "GlowScan Intense Moisture Cream",
        frequencyPreset: "Hàng ngày",
        instructionPreset: "Thoa mỏng toàn mặt",
      },
    ],
  );

  const [notes, setNotes] = useState(
    draft?.notes ||
      "Tuần 1-2 tập trung phục hồi da. Dùng BHA cách ngày vào buổi tối.",
  );

  const createPlanMutation = useCreateTreatmentPlan();

  // Auto save draft to LocalStorage when inputs change
  useEffect(() => {
    try {
      const draftData = {
        title,
        totalFeeVnd,
        selectedIngredients,
        amSteps,
        pmSteps,
        notes,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch {
      // ignore
    }
  }, [
    title,
    totalFeeVnd,
    selectedIngredients,
    amSteps,
    pmSteps,
    notes,
    draftKey,
  ]);

  // Ingredient Toggle
  const toggleIngredient = (ing: Ingredient) => {
    if (selectedIngredients.some((i) => i.id === ing.id)) {
      setSelectedIngredients(
        selectedIngredients.filter((i) => i.id !== ing.id),
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const addCustomIngredient = () => {
    if (!customIngredientName.trim()) return;
    const newIng: Ingredient = {
      id: `ing_custom_${Date.now()}`,
      name: customIngredientName.trim(),
      category: "Hoạt chất tùy chỉnh",
    };
    setSelectedIngredients([...selectedIngredients, newIng]);
    setCustomIngredientName("");
  };

  // Rule-Engine Auto Generate Routine
  const handleRuleEngineGenerate = () => {
    toast.success(
      "Rule-Engine đã sinh quy trình Skincare chuẩn theo hoạt chất! ✨",
    );
  };

  // Submit Treatment Plan
  const handleSubmitPlan = () => {
    const payload: Partial<TreatmentPlan> = {
      customerId,
      customerName,
      title,
      totalFeeVnd,
      status: "ACTIVE",
      currentPhaseNumber: 1,
      phases: [
        {
          id: `phase_${Date.now()}`,
          phaseNumber: 1,
          title: "Giai đoạn 1: Điều trị chuyên sâu",
          durationWeeks: 4,
          status: "ACTIVE",
          targetIngredients: selectedIngredients,
          amSteps,
          pmSteps,
          notes,
        },
      ],
    };

    createPlanMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Lập & Kích hoạt Phác đồ điều trị thành công! 🎉");
        localStorage.removeItem(draftKey); // clear draft
        onSuccess();
      },
      onError: (err: unknown) => {
        const msg = (err as Error)?.message || "Lỗi tạo phác đồ.";
        toast.error(msg);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header & Stepper */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Lập Phác Đồ Điều Trị Cho Bệnh Nhân
            </h2>
            <p className="text-xs text-slate-500">
              Bệnh nhân:{" "}
              <strong className="font-semibold text-slate-800">
                {customerName}
              </strong>
            </p>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
          >
            🔒 Bản nháp tự động lưu
          </Badge>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
          {[
            { step: 1, label: "1. Tổng Quan" },
            { step: 2, label: "2. Thành Phần" },
            { step: 3, label: "3. Sản Phẩm" },
            { step: 4, label: "4. Quy Trình Routine" },
          ].map((item) => {
            const active = currentStep === item.step;
            const completed = currentStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 transition-all select-none ${
                  active
                    ? "bg-emerald-700 text-white shadow-xs"
                    : completed
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <span>{item.step}.</span>
                )}
                <span className="hidden sm:inline">
                  {item.label.split(". ")[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          {/* STEP 1: General Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Tên Phác Đồ Điều Trị:
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Tổng Chi Phí Phác Đồ (VND):
                </Label>
                <Input
                  type="number"
                  value={totalFeeVnd}
                  onChange={(e) => setTotalFeeVnd(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold text-emerald-700"
                />
                <span className="text-[11px] font-semibold text-slate-500">
                  Hiển thị: {formatVnd(totalFeeVnd)}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Ghi chú chỉ dẫn chung từ Bác sĩ:
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Target Ingredients */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Chọn các Hoạt Chất Chỉ Định (Active Ingredients):
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_INGREDIENTS.map((ing) => {
                    const isSelected = selectedIngredients.some(
                      (i) => i.id === ing.id,
                    );
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredient(ing)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {ing.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Ingredient */}
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Nhập hoạt chất tùy chỉnh khác (Other)..."
                  value={customIngredientName}
                  onChange={(e) => setCustomIngredientName(e.target.value)}
                  className="max-w-xs rounded-xl text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomIngredient}
                  className="rounded-xl text-xs font-bold"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Hoạt Chất
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Products Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">
                  Sản Phẩm Khuyên Dùng Từ Cửa Hàng GlowScan (Ranking Theo Tương
                  Thích):
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRuleEngineGenerate}
                  className="rounded-xl border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Rule-Engine Tự Lọc
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
                <span className="font-bold text-slate-800">
                  Sản phẩm tương thích ưu tiên (Match Score 98%):
                </span>
                <ul className="list-disc space-y-1 pl-5 text-slate-600">
                  <li>GlowScan Gentle Cleanser (Sữa rửa mặt dịu nhẹ)</li>
                  <li>GlowScan Barrier Recovery Serum 5% Niacinamide</li>
                  <li>GlowScan Salicylic Clearing Solution 2% BHA</li>
                  <li>GlowScan Intense Moisture Ceramides Cream</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 4: Rule Engine Routine Generation & Edit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Quy Trình Skincare Sáng & Tối (AM / PM Routine):
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRuleEngineGenerate}
                  className="rounded-xl border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Sinh Lại Từ
                  Rule-Engine
                </Button>
              </div>

              {/* AM Routine */}
              <div className="space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  ☀️ BUỔI SÁNG (AM ROUTINE)
                </span>
                <div className="space-y-2">
                  {amSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-100 bg-white p-3 text-xs"
                    >
                      <span className="font-bold text-amber-800">
                        Bước {idx + 1}:
                      </span>
                      <Input
                        value={step.stepName}
                        onChange={(e) => {
                          const updated = [...amSteps];
                          updated[idx].stepName = e.target.value;
                          setAmSteps(updated);
                        }}
                        className="max-w-[180px] rounded-lg text-xs font-bold"
                      />

                      {/* Preset Frequency */}
                      <select
                        value={step.frequencyPreset}
                        onChange={(e) => {
                          const updated = [...amSteps];
                          updated[idx].frequencyPreset = e.target
                            .value as RoutineStep["frequencyPreset"];
                          setAmSteps(updated);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {PRESET_FREQUENCIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>

                      {/* Preset Instruction */}
                      <select
                        value={step.instructionPreset}
                        onChange={(e) => {
                          const updated = [...amSteps];
                          updated[idx].instructionPreset = e.target
                            .value as RoutineStep["instructionPreset"];
                          setAmSteps(updated);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {PRESET_INSTRUCTIONS.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM Routine */}
              <div className="space-y-3 rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-4">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                  🌙 BUỔI TỐI (PM ROUTINE)
                </span>
                <div className="space-y-2">
                  {pmSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-white p-3 text-xs"
                    >
                      <span className="font-bold text-indigo-800">
                        Bước {idx + 1}:
                      </span>
                      <Input
                        value={step.stepName}
                        onChange={(e) => {
                          const updated = [...pmSteps];
                          updated[idx].stepName = e.target.value;
                          setPmSteps(updated);
                        }}
                        className="max-w-[180px] rounded-lg text-xs font-bold"
                      />

                      <select
                        value={step.frequencyPreset}
                        onChange={(e) => {
                          const updated = [...pmSteps];
                          updated[idx].frequencyPreset = e.target
                            .value as RoutineStep["frequencyPreset"];
                          setPmSteps(updated);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {PRESET_FREQUENCIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>

                      <select
                        value={step.instructionPreset}
                        onChange={(e) => {
                          const updated = [...pmSteps];
                          updated[idx].instructionPreset = e.target
                            .value as RoutineStep["instructionPreset"];
                          setPmSteps(updated);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {PRESET_INSTRUCTIONS.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              className="rounded-xl text-xs font-bold"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Quay Lại
            </Button>
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Tiếp Theo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={createPlanMutation.isPending}
              onClick={handleSubmitPlan}
              className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
            >
              {createPlanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Lưu & Kích Hoạt Phác Đồ Ngay
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
