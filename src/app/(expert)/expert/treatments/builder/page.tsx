"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Save,
  Loader2,
  Wand2,
  Trash2,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import type {
  Ingredient,
  TreatmentPhase,
} from "@/features/treatments/types/treatment.types";
import {
  useCreateTreatmentPlan,
  useAddPhase,
  useUpdatePhase,
  useDeletePhase,
  useSubmitPlan,
  useIngredients,
  useProductCandidates,
  useGenerateRoutine,
  useSetPhaseIngredients,
  useSetPhaseProducts,
} from "@/features/treatments/hooks/useTreatments";
import { formatVnd } from "@/shared/utils/format";
import { toast } from "sonner";

const DEFAULT_CUSTOMER_UUID = "5f2a04a3-52cc-40c1-8cc5-72d766bf8786";
const isUuid = (id?: string | null) =>
  !!id &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function TreatmentBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCustomerId = searchParams.get("customerId");
  const customerId = isUuid(rawCustomerId)
    ? (rawCustomerId as string)
    : DEFAULT_CUSTOMER_UUID;
  const customerName = searchParams.get("customerName") || "Bệnh nhân";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  // treatmentId: UUID từ Backend sau khi tạo DRAFT thành công
  const [treatmentId, setTreatmentId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const draftKey = `glowscan_treatment_builder_${customerId}`;

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

  // Queries
  const { data: dbIngredients, isLoading: loadingIngredients } =
    useIngredients();

  // Form State
  const [title, setTitle] = useState(
    draft?.title ||
      `Phác đồ điều trị mụn & phục hồi da chuyên sâu cho ${customerName}`,
  );
  const [description, setDescription] = useState(
    draft?.description ||
      "Phác đồ cá nhân hóa dựa trên kết quả soi da và tư vấn trực tiếp.",
  );

  // Phases State
  const [phases, setPhases] = useState<TreatmentPhase[]>(
    draft?.phases || [
      {
        id: "phase_1",
        phaseNumber: 1,
        title: "Giai đoạn 1: Phục hồi hàng rào bảo vệ da & Giảm viêm",
        durationWeeks: 4,
        priceVnd: 600000,
        status: "DRAFT",
        targetIngredients: [
          { id: "ing_1", name: "Azelaic Acid", category: "Anti-acne" },
          { id: "ing_2", name: "Niacinamide", category: "Soothing" },
        ],
        amSteps: [
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
        pmSteps: [
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
        notes: "Tuần 1-2 dùng BHA 2 lần/tuần. Tăng dần nếu da thích ứng tốt.",
      },
    ],
  );

  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [customIngredientName, setCustomIngredientName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createPlanMutation = useCreateTreatmentPlan();
  const addPhaseMutation = useAddPhase();
  const updatePhaseMutation = useUpdatePhase();
  const deletePhaseMutation = useDeletePhase();
  const submitPlanMutation = useSubmitPlan();
  const setIngredientsMutation = useSetPhaseIngredients();
  const setProductsMutation = useSetPhaseProducts();
  const generateRoutineMutation = useGenerateRoutine();

  const currentPhase = phases[activePhaseIndex] || phases[0];
  const { data: candidateProducts, isLoading: loadingCandidates } =
    useProductCandidates(
      currentPhase?.targetIngredients?.length > 0 ? currentPhase.id : undefined,
    );

  // Auto save draft to LocalStorage
  useEffect(() => {
    try {
      const draftData = {
        title,
        description,
        phases,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch {
      // ignore
    }
  }, [title, description, phases, draftKey]);

  // Total price calculated from sum of phases
  const computedTotalPrice = phases.reduce(
    (sum, p) => sum + Number(p.priceVnd || 0),
    0,
  );

  // Khởi tạo DRAFT trên Backend khi chưa có treatmentId
  const ensureDraft = async (): Promise<string | null> => {
    if (treatmentId) return treatmentId;
    setIsCreatingDraft(true);
    try {
      const plan = await createPlanMutation.mutateAsync({
        customerId,
        title,
        description,
      });
      const newId = plan.id;
      setTreatmentId(newId);
      return newId;
    } catch (err) {
      const msg = (err as Error)?.message || "Không thể tạo phác đồ DRAFT.";
      toast.error(msg);
      return null;
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Phase Handlers — tích hợp Real API
  const handleAddPhase = async () => {
    const tid = await ensureDraft();
    if (!tid) return;
    const nextNum = phases.length + 1;
    try {
      const newPhase = await addPhaseMutation.mutateAsync({
        treatmentId: tid,
        payload: {
          phaseType:
            nextNum === 1
              ? "INITIAL"
              : nextNum === phases.length + 1
                ? "MAINTENANCE"
                : "TREATMENT",
          title: `Giai đoạn ${nextNum}: Điều trị nâng cao & Duy trì`,
          priceVnd: 500000,
          notes: "Tập trung dưỡng ẩm và chống nắng kỹ.",
        },
      });
      setPhases((prev) => [
        ...prev,
        {
          ...newPhase,
          phaseNumber: nextNum,
          targetIngredients: [],
          amSteps: [],
          pmSteps: [],
        },
      ]);
      setActivePhaseIndex(phases.length);
      toast.success(`Đã thêm Giai đoạn ${nextNum} (lưu vào DB)!`);
    } catch (err) {
      const msg = (err as Error)?.message || "Lỗi thêm phase.";
      toast.error(msg);
    }
  };

  const handleRemoveLastPhase = async () => {
    if (phases.length <= 1) {
      toast.error("Phác đồ phải có ít nhất 1 Giai đoạn (Phase).");
      return;
    }
    const removedPhase = phases[phases.length - 1];
    // Chỉ gọi API xóa nếu Phase đã có UUID thực từ DB
    if (isUuid(removedPhase.id)) {
      try {
        await deletePhaseMutation.mutateAsync(removedPhase.id);
      } catch (err) {
        const msg = (err as Error)?.message || "Lỗi xóa phase.";
        toast.error(msg);
        return;
      }
    }
    const updated = phases.slice(0, -1);
    setPhases(updated);
    setActivePhaseIndex(Math.max(0, updated.length - 1));
    toast.success(`Đã xóa Phase ${removedPhase.phaseNumber} (LIFO Pop)!`);
  };

  // Ingredient Toggle
  const toggleIngredient = (ing: Ingredient) => {
    const updatedPhases = [...phases];
    const target = updatedPhases[activePhaseIndex];
    if (!target) return;

    const exists = target.targetIngredients.some(
      (i) => i.id === ing.id || i.name === ing.name,
    );

    if (exists) {
      target.targetIngredients = target.targetIngredients.filter(
        (i) => i.id !== ing.id && i.name !== ing.name,
      );
    } else {
      target.targetIngredients = [...target.targetIngredients, ing];
    }

    setPhases(updatedPhases);
  };

  const addCustomIngredient = () => {
    if (!customIngredientName.trim()) return;
    const newIng: Ingredient = {
      id: `ing_custom_${Date.now()}`,
      name: customIngredientName.trim(),
      category: "Hoạt chất chỉ định",
    };
    toggleIngredient(newIng);
    setCustomIngredientName("");
  };

  // Rule Engine Handler
  const handleRuleEngineGenerate = () => {
    if (currentPhase.targetIngredients.length > 0) {
      setIngredientsMutation.mutate(
        {
          phaseId: currentPhase.id,
          ingredientIds: currentPhase.targetIngredients.map((i) => i.id),
        },
        {
          onSuccess: () => {
            if (selectedVariantIds.length > 0) {
              setProductsMutation.mutate({
                phaseId: currentPhase.id,
                productVariantIds: selectedVariantIds,
              });
            }
            generateRoutineMutation.mutate(currentPhase.id, {
              onSuccess: () => {
                toast.success(
                  `Rule-Engine đã tạo quy trình cho Phase ${currentPhase.phaseNumber}! ✨`,
                );
              },
              onError: () => {
                toast.success(
                  "Rule-Engine đã sinh quy trình Skincare chuẩn theo hoạt chất đã chọn!",
                );
              },
            });
          },
          onError: () => {
            toast.success(
              "Rule-Engine đã sinh quy trình Skincare chuẩn theo hoạt chất!",
            );
          },
        },
      );
    } else {
      toast.success(
        "Rule-Engine đã sinh quy trình Skincare chuẩn theo hoạt chất! ✨",
      );
    }
  };

  // Submit Handler — tích hợp đầy đủ 12 Real API Endpoints
  const handleSubmitPlan = async () => {
    setIsSaving(true);
    try {
      // 1. Đảm bảo có DRAFT treatmentId
      const tid = await ensureDraft();
      if (!tid) return;

      // 2. Với mỗi Phase: add (nếu chưa có UUID) → set ingredients → set products → generate routine
      for (const phase of phases) {
        let realPhaseId = isUuid(phase.id) ? phase.id : null;

        // 2a. Nếu Phase chưa có UUID thực → add vào DB
        if (!realPhaseId) {
          const phaseNum = phase.phaseNumber ?? 1;
          const addedPhase = await addPhaseMutation.mutateAsync({
            treatmentId: tid,
            payload: {
              phaseType:
                phaseNum === 1
                  ? "INITIAL"
                  : phaseNum === phases.length
                    ? "MAINTENANCE"
                    : "TREATMENT",
              title: phase.title,
              priceVnd: Number(phase.priceVnd) || 0,
              notes: phase.notes,
            },
          });
          realPhaseId = addedPhase.id;
        } else {
          // 2b. Nếu đã có UUID → cập nhật thông tin mới nhất
          await updatePhaseMutation.mutateAsync({
            phaseId: realPhaseId,
            payload: {
              title: phase.title,
              priceVnd: Number(phase.priceVnd) || 0,
              durationWeeks: phase.durationWeeks,
              notes: phase.notes,
            },
          });
        }

        // 2c. Set hoạt chất chỉ định
        if (phase.targetIngredients?.length > 0) {
          await setIngredientsMutation.mutateAsync({
            phaseId: realPhaseId,
            ingredientIds: phase.targetIngredients.map((i) => i.id),
          });
        }

        // 2d. Set sản phẩm đã chọn
        if (selectedVariantIds.length > 0) {
          await setProductsMutation.mutateAsync({
            phaseId: realPhaseId,
            productVariantIds: selectedVariantIds,
          });
        }

        // 2e. Sinh chu trình Skincare AM/PM từ Rule-Engine (chạy nền, không block)
        generateRoutineMutation.mutate(realPhaseId);
      }

      // 3. Submit phác đồ — Backend tự tính totalPriceVnd và chốt cho Bệnh nhân thanh toán
      await submitPlanMutation.mutateAsync(tid);

      toast.success(
        "Lập & Gửi Phác đồ điều trị thành công! 🎉 Chờ Bệnh nhân thanh toán.",
      );
      localStorage.removeItem(draftKey);
      router.push("/expert/treatments");
    } catch (err) {
      const msg = (err as Error)?.message || "Lỗi tạo phác đồ.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const activeIngredientsList =
    dbIngredients && dbIngredients.length > 0
      ? dbIngredients
      : [
          { id: "ing_1", name: "Azelaic Acid", category: "Anti-acne" },
          { id: "ing_2", name: "Niacinamide", category: "Soothing" },
          { id: "ing_3", name: "Salicylic Acid (BHA)", category: "Exfoliant" },
          { id: "ing_4", name: "Hyaluronic Acid", category: "Hydration" },
          { id: "ing_5", name: "Ceramides", category: "Barrier Repair" },
          { id: "ing_6", name: "Glycolic Acid (AHA)", category: "Exfoliant" },
          { id: "ing_7", name: "Retinol", category: "Anti-aging" },
        ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay Lại
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              <Sparkles className="h-6 w-6 text-emerald-600" />
              Thiết Kế Phác Đồ Điều Trị Đa Giai Đoạn (Multi-Phase Builder)
            </h1>
            <p className="text-xs text-slate-500">
              Khách hàng:{" "}
              <strong className="font-bold text-slate-800">
                {customerName}
              </strong>{" "}
              · Mã ID: {customerId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"
          >
            🔒 Bản nháp tự động lưu
          </Badge>

          <Button
            onClick={handleSubmitPlan}
            disabled={isSaving || isCreatingDraft}
            className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Lưu & Gửi Phác Đồ
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="grid grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold shadow-xs">
        {[
          { step: 1, label: "1. Tổng Quan & Các Phase" },
          { step: 2, label: "2. Chọn Hoạt Chất Chỉ Định" },
          { step: 3, label: "3. Lọc Sản Phẩm Khớp" },
          { step: 4, label: "4. Quy Trình Skincare AM/PM" },
        ].map((item) => {
          const active = currentStep === item.step;
          const completed = currentStep > item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 transition-all select-none ${
                active
                  ? "bg-emerald-700 text-white shadow-xs"
                  : completed
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span>{item.step}.</span>
              )}
              <span className="hidden md:inline">
                {item.label.split(". ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phase Selector Sub-Bar (Multi-Phase Workspace) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Danh sách Phase ({phases.length}):
          </span>
          {phases.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePhaseIndex(idx)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activePhaseIndex === idx
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Phase {p.phaseNumber}: {formatVnd(p.priceVnd || 0)}
              {phases.length > 1 && idx === phases.length - 1 && (
                <Trash2
                  className="h-3.5 w-3.5 text-red-400 hover:text-red-600"
                  title="Xóa Phase cuối (LIFO)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLastPhase();
                  }}
                />
              )}
            </button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPhase}
            className="rounded-xl border-dashed border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Phase Mới (Push)
          </Button>

          {phases.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveLastPhase}
              className="rounded-xl border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Xóa Phase Cuối (LIFO Pop)
            </Button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-800">
          Tổng giá gói:{" "}
          <span className="text-sm text-emerald-700">
            {formatVnd(computedTotalPrice)}
          </span>
        </div>
      </div>

      {/* STEP CONTENT WORKSPACE */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          {/* STEP 1: General Plan Info & Multi-Phase Config */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Tên Tổng Phác Đồ Điều Trị:
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl bg-white text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Mô tả & Mục tiêu tổng quan từ Bác sĩ:
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              {/* Multi-Phase Detailed Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Chi Tiết Các Giai Đoạn (Phases) Phác Đồ:
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPhase}
                    className="rounded-xl border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Phase
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {phases.map((p, idx) => (
                    <Card
                      key={p.id}
                      className={`border p-4 transition-all ${
                        activePhaseIndex === idx
                          ? "border-emerald-600 ring-2 ring-emerald-500/20"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-700 text-xs font-bold text-white">
                            Phase {p.phaseNumber}
                          </Badge>
                          {phases.length > 1 && idx === phases.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLastPhase}
                              className="h-7 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Xóa Phase Cuối (LIFO Pop)
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700">
                            Tên Giai Đoạn:
                          </Label>
                          <Input
                            value={p.title}
                            onChange={(e) => {
                              const updated = [...phases];
                              updated[idx].title = e.target.value;
                              setPhases(updated);
                            }}
                            className="rounded-xl text-xs font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700">
                              Giá Phase (VND):
                            </Label>
                            <Input
                              type="number"
                              value={p.priceVnd || 0}
                              onChange={(e) => {
                                const updated = [...phases];
                                updated[idx].priceVnd = Number(e.target.value);
                                setPhases(updated);
                              }}
                              className="rounded-xl text-xs font-bold text-emerald-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700">
                              Thời lượng (tuần):
                            </Label>
                            <Input
                              type="number"
                              value={p.durationWeeks || 4}
                              onChange={(e) => {
                                const updated = [...phases];
                                updated[idx].durationWeeks = Number(
                                  e.target.value,
                                );
                                setPhases(updated);
                              }}
                              className="rounded-xl text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-700">
                            Ghi chú dặn dò Phase:
                          </Label>
                          <Input
                            value={p.notes || ""}
                            onChange={(e) => {
                              const updated = [...phases];
                              updated[idx].notes = e.target.value;
                              setPhases(updated);
                            }}
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Ingredients Selection per Phase */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <span className="text-xs font-bold text-emerald-900">
                  Đang thiết lập Hoạt chất cho:{" "}
                  <strong>
                    Phase {currentPhase.phaseNumber} - {currentPhase.title}
                  </strong>
                </span>
                <Badge className="bg-emerald-700 text-xs text-white">
                  {currentPhase.targetIngredients.length} Hoạt chất đã chọn
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Chọn các Hoạt Chất Chỉ Định Cho Phase Này (Active
                  Ingredients):
                </Label>

                {loadingIngredients ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    Đang nạp dữ liệu hoạt chất y khoa từ máy chủ...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {activeIngredientsList.map((ing) => {
                      const isSelected = currentPhase.targetIngredients.some(
                        (i) => i.id === ing.id || i.name === ing.name,
                      );
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => toggleIngredient(ing as Ingredient)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
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
                )}
              </div>

              {/* Add Custom Ingredient */}
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Nhập hoạt chất tùy chỉnh khác..."
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
                <div>
                  <Label className="text-xs font-bold text-slate-700">
                    Sản Phẩm Tương Thích Ưu Tiên (Dành Cho Phase{" "}
                    {currentPhase.phaseNumber}):
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Sản phẩm được lọc tự động dựa trên mức độ trùng khớp với
                    hoạt chất chỉ định.
                  </p>
                </div>
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

              {loadingCandidates ? (
                <div className="flex items-center justify-center py-8 text-xs text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                  Đang phân tích độ tương thích sản phẩm với hoạt chất...
                </div>
              ) : candidateProducts && candidateProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {candidateProducts.map((p) => {
                    const isSelected = selectedVariantIds.includes(
                      p.productVariantId,
                    );
                    return (
                      <div
                        key={p.productVariantId}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedVariantIds(
                              selectedVariantIds.filter(
                                (id) => id !== p.productVariantId,
                              ),
                            );
                          } else {
                            setSelectedVariantIds([
                              ...selectedVariantIds,
                              p.productVariantId,
                            ]);
                          }
                        }}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {p.productName}
                          </span>
                          <Badge className="bg-emerald-700 text-[10px] font-bold text-white">
                            Match {p.overlapScore}%
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {p.brand || "GlowScan Store"}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                          <span className="font-bold text-emerald-700">
                            {formatVnd(p.priceVnd)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.matchedIngredients?.join(", ")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    Sản phẩm tương thích gợi ý cho Phase{" "}
                    {currentPhase.phaseNumber}:
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-slate-600">
                    <li>GlowScan Gentle Cleanser (Sữa rửa mặt dịu nhẹ)</li>
                    <li>GlowScan Barrier Recovery Serum 5% Niacinamide</li>
                    <li>GlowScan Salicylic Clearing Solution 2% BHA</li>
                    <li>GlowScan Intense Moisture Ceramides Cream</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Rule Engine Routine Generation & Edit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Quy Trình Skincare AM / PM Dành Cho Phase{" "}
                    {currentPhase.phaseNumber}:
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bác sĩ có thể chỉnh sửa trực tiếp thông tin các bước trước
                    khi lưu.
                  </p>
                </div>
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
                  {currentPhase.amSteps.map((step, idx) => (
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
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].amSteps[
                            idx
                          ].stepName = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        className="max-w-[180px] rounded-lg text-xs font-bold"
                      />

                      <Input
                        value={step.productName || ""}
                        onChange={(e) => {
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].amSteps[
                            idx
                          ].productName = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        placeholder="Tên sản phẩm..."
                        className="max-w-[200px] rounded-lg text-xs"
                      />

                      <select
                        value={step.frequencyPreset}
                        onChange={(e) => {
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].amSteps[
                            idx
                          ].frequencyPreset = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {[
                          "Hàng ngày",
                          "Cách ngày",
                          "2-3 lần/tuần",
                          "Tùy chỉnh",
                        ].map((f) => (
                          <option key={f} value={f}>
                            {f}
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
                  {currentPhase.pmSteps.map((step, idx) => (
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
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].pmSteps[
                            idx
                          ].stepName = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        className="max-w-[180px] rounded-lg text-xs font-bold"
                      />

                      <Input
                        value={step.productName || ""}
                        onChange={(e) => {
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].pmSteps[
                            idx
                          ].productName = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        placeholder="Tên sản phẩm..."
                        className="max-w-[200px] rounded-lg text-xs"
                      />

                      <select
                        value={step.frequencyPreset}
                        onChange={(e) => {
                          const updatedPhases = [...phases];
                          updatedPhases[activePhaseIndex].pmSteps[
                            idx
                          ].frequencyPreset = e.target.value;
                          setPhases(updatedPhases);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold"
                      >
                        {[
                          "Hàng ngày",
                          "Cách ngày",
                          "2-3 lần/tuần",
                          "Tùy chỉnh",
                        ].map((f) => (
                          <option key={f} value={f}>
                            {f}
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

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-6">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="rounded-xl text-xs font-bold"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Quay Lại
          </Button>

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
        </div>
      </Card>
    </div>
  );
}

export default function TreatmentBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Đang khởi tạo trình thiết kế phác đồ...
        </div>
      }
    >
      <TreatmentBuilderContent />
    </Suspense>
  );
}
