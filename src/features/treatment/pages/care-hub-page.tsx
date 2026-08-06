"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Clock,
  Droplets,
  Bed,
  Smile,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/core/api/errors";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { DailyCheckInDialog } from "../components/daily-check-in-dialog";
import { LowStockBanner } from "../components/low-stock-banner";
import { RestockDialog } from "../components/restock-dialog";
import { RoutineHistoryPanel } from "../components/routine-history-panel";
import { RoutineStepItem } from "../components/routine-step-item";
import { SkipStepDialog } from "../components/skip-step-dialog";
import { RoutineWeeklyCheckInDialog } from "../components/routine-weekly-checkin-dialog";
import { SideEffectReportDialog } from "../components/side-effect-report-dialog";
import { RoutineStepDetailSheet } from "../components/routine-step-detail-sheet";
import { ProgressPhotoGallery } from "../components/progress-photo-gallery";
import { CustomerTreatmentView } from "@/features/treatments/components/customer-treatment-view";
import { useTreatmentPlans } from "@/features/treatments/hooks/useTreatments";
import {
  MOOD_LABELS,
  PERIOD_LABELS,
  SIDE_EFFECT_LABELS,
} from "../constants/routine-tracking";
import { useLowStockSteps } from "../hooks/useLowStockSteps";
import { useRestockStatus } from "../hooks/useRestockStatus";
import {
  useCompleteStep,
  useSkipStep,
  useTodayCheckIns,
  useTodayRoutines,
} from "../hooks/useRoutineTracking";
import {
  aggregateProgress,
  resolveCareHubState,
  shouldPromptCheckIn,
} from "../lib/care-hub-state";
import {
  restockDismissalKey,
  shouldPromptRestock,
  summarizeLowStock,
} from "../lib/restock-prompt";
import { formatVnLongDate } from "../lib/routine-history";
import type { RoutinePeriod, TodayStep } from "../types/routine-tracking.types";

/** Read the locally stored habit ticks for one server calendar date. */
function readHabitIds(storageKey: string): string[] {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return [];
  }
  try {
    return JSON.parse(saved) as string[];
  } catch {
    return [];
  }
}

const SUPPORT_HABITS = [
  { id: "water", label: "Uống đủ 2L nước", icon: Droplets },
  { id: "sleep", label: "Ngủ trước 23h", icon: Moon },
  { id: "pillow", label: "Thay vỏ gối", icon: Bed },
  { id: "no-touch", label: "Không chạm tay lên mặt", icon: Smile },
];

export function CareHubPage() {
  const session = useSession();
  const { data: profile } = useProfile();

  // null = no explicit tab choice yet, so the backend picks the period from its own
  // Asia/Ho_Chi_Minh clock (VN hour < 14 → MORNING, else EVENING).
  const [periodOverride, setPeriodOverride] = useState<RoutinePeriod | null>(
    null,
  );
  const isLoggedIn = !!session.data;

  const {
    data: todayData,
    isLoading: isTodayLoading,
    isError: isTodayError,
  } = useTodayRoutines(periodOverride ?? undefined, { enabled: isLoggedIn });

  const { data: treatmentPlans } = useTreatmentPlans(
    "customer",
    {},
    { enabled: isLoggedIn },
  );
  const activeTreatment = treatmentPlans?.[0];
  const isTreatmentCancelled = activeTreatment?.status === "CANCELLED";
  const assignedDoctorId = activeTreatment?.expertId;
  const contactDoctorHref = assignedDoctorId
    ? `/booking/${assignedDoctorId}`
    : "/experts";

  // The period the screen is actually showing: user's tab, else whatever the server chose.
  const activePeriod: RoutinePeriod =
    periodOverride ?? todayData?.period ?? "MORNING";

  const completeStep = useCompleteStep(periodOverride ?? undefined);
  const skipStep = useSkipStep(periodOverride ?? undefined);

  // Multiple ACTIVE routines are possible; check-in and history target the newest
  // one (backend orders by createdAt DESC). TODO(BE/UX): per-routine check-in.
  const primaryRoutine = todayData?.routines[0];
  const { data: todayCheckIns } = useTodayCheckIns(
    primaryRoutine?.id,
    todayData?.date,
  );
  const currentCheckIn = todayCheckIns?.find(
    (checkIn) => checkIn.period === activePeriod,
  );

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isWeeklyCheckInOpen, setIsWeeklyCheckInOpen] = useState(false);
  const [isSideEffectReportOpen, setIsSideEffectReportOpen] = useState(false);
  const [selectedStepDetail, setSelectedStepDetail] =
    useState<TodayStep | null>(null);
  const [stepToSkip, setStepToSkip] = useState<{
    routineId: string;
    step: TodayStep;
  } | null>(null);

  // Habits state — keyed by the server's VN calendar date, never the device clock.
  // The key only exists after Today loads (client-side), so there is nothing to read
  // during SSR and no hydration mismatch.
  const serverDate = todayData?.date;
  const habitsStorageKey = serverDate ? `glowscan_habits_${serverDate}` : null;
  const [habitsByKey, setHabitsByKey] = useState<Record<string, string[]>>({});
  const persistedHabitIds = useMemo(
    () => (habitsStorageKey ? readHabitIds(habitsStorageKey) : []),
    [habitsStorageKey],
  );
  const completedHabitIds = habitsStorageKey
    ? (habitsByKey[habitsStorageKey] ?? persistedHabitIds)
    : [];

  // Flow §5: after the last step is acted on, prompt the daily check-in. The rule lives
  // in lib/care-hub-state.ts (unit-tested); the ref only carries the previous render.
  const previousSessionStateRef = useRef(todayData?.sessionState);
  useEffect(() => {
    const previous = previousSessionStateRef.current;
    previousSessionStateRef.current = todayData?.sessionState;
    if (
      shouldPromptCheckIn({
        previous,
        current: todayData?.sessionState,
        hasCheckIn: Boolean(currentCheckIn),
      })
    ) {
      setIsCheckInOpen(true);
    }
  }, [todayData?.sessionState, currentCheckIn]);

  const careHubState = resolveCareHubState({
    isSessionLoading: session.isLoading,
    isLoggedIn,
    isTodayLoading,
    isTodayError,
    sessionState: todayData?.sessionState,
  });

  // Reorder prompt. The backend owns the stock estimate (routine-tracking-flow.md
  // §4.6); this only reads `warning` off the steps already in cache. Products already
  // ordered are split out so they neither nag nor count towards the banner.
  const warnedProducts = useLowStockSteps(todayData);
  const restock = useRestockStatus(warnedProducts, serverDate);
  const lowStock = summarizeLowStock(restock.active);

  // Dismissal is keyed by the server's VN calendar date, never the device clock —
  // the same convention the support-habit ticks use below.
  const dismissRestock = () => {
    if (serverDate) {
      localStorage.setItem(restockDismissalKey(serverDate), serverDate);
    }
    setIsRestockOpen(false);
  };

  // Chained after the check-in dialog rather than racing it: the reorder prompt only
  // fires once the check-in closes, and at most once per server day.
  const wasCheckInOpenRef = useRef(false);
  useEffect(() => {
    const justClosed = wasCheckInOpenRef.current && !isCheckInOpen;
    wasCheckInOpenRef.current = isCheckInOpen;
    if (!serverDate) {
      return;
    }
    if (
      shouldPromptRestock({
        hasItems: lowStock.hasItems,
        checkInJustClosed: justClosed,
        dismissedDate: localStorage.getItem(restockDismissalKey(serverDate)),
        serverDate,
      })
    ) {
      setIsRestockOpen(true);
    }
  }, [isCheckInOpen, lowStock.hasItems, serverDate]);

  const stepEntries = (todayData?.routines ?? []).flatMap((routine) =>
    routine.steps.map((step) => ({ routineId: routine.id, step })),
  );

  const progressPct = aggregateProgress(
    todayData?.routines ?? [],
  ).completionRate;

  const handleStepError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) {
      toast.error(
        "Bước này đã được ghi nhận hôm nay, không thể đổi trạng thái.",
      );
      return;
    }
    toast.error(
      error instanceof ApiError
        ? error.message
        : "Không cập nhật được bước chăm sóc. Vui lòng thử lại.",
    );
  };

  const handleCompleteStep = (routineId: string, stepId: string) => {
    completeStep.mutate(
      { routineId, stepId },
      {
        onSuccess: () => toast.success("Đã hoàn thành bước chăm sóc!"),
        onError: handleStepError,
      },
    );
  };

  const toggleHabit = (habitId: string) => {
    if (!habitsStorageKey) {
      return;
    }
    const next = completedHabitIds.includes(habitId)
      ? completedHabitIds.filter((id) => id !== habitId)
      : [...completedHabitIds, habitId];
    localStorage.setItem(habitsStorageKey, JSON.stringify(next));
    setHabitsByKey((prev) => ({ ...prev, [habitsStorageKey]: next }));
    toast.success("Đã ghi nhận thói quen tốt!");
  };

  // Render branches follow resolveCareHubState's priority order.
  if (careHubState.status === "AUTH_PENDING") {
    return (
      <div className="flex w-full justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (careHubState.status === "GUEST") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] shadow-xs">
          <Sparkles className="h-8 w-8 text-[#6b5cf6]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E35]">
            Trung Tâm Chăm Sóc Da Cá Nhân Hóa
          </h1>
          <p className="max-w-md text-sm text-[#5C7468]">
            Đăng nhập hoặc làm bài khảo sát da Baumann để kích hoạt phác đồ chăm
            sóc da chuyên biệt cùng AI & Bác sĩ Da Liễu.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/scan">
            <Button
              size="lg"
              className="rounded-xl bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              Làm Khảo Sát Da Ngay
            </Button>
          </Link>
          <Link href="/experts">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-slate-300 font-semibold"
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              Khám Phá Chuyên Gia
            </Button>
          </Link>
          <Link href="/login?redirectTo=/care">
            <Button
              variant="ghost"
              size="lg"
              className="font-semibold text-[#2C3E35]"
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (careHubState.status === "ERROR") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E35]">
            Không Tải Được Routine
          </h1>
          <p className="max-w-md text-sm text-[#5C7468]">
            Không tải được routine hôm nay. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  if (careHubState.status === "NO_ROUTINE") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#2C3E35] shadow-xs">
          <Sun className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E35]">
            Chưa Có Lộ Trình Chăm Sóc
          </h1>
          <p className="max-w-md text-sm text-[#5C7468]">
            Chào {profile?.name || "bạn"}, hoàn thành bài khảo sát 16 loại da
            Baumann và mua gói sản phẩm tương ứng để AI tự động sinh Routine cho
            bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/scan">
            <Button
              size="lg"
              className="rounded-xl bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              Bắt Đầu Khảo Sát Da
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-slate-300"
            >
              Xem Sản Phẩm Gợi Ý
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
      {/* Top Welcome Panel */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/survey" className="hover:underline">
              <span>
                Da Baumann:{" "}
                <strong className="text-primary">
                  {profile?.baumannCode || "Khảo sát AI"}
                </strong>
              </span>
            </Link>
            <span>•</span>
            <span>
              Hôm nay:{" "}
              <strong className="text-slate-700">
                {/* Server VN calendar date from GET /routines/me/today — never the device clock. */}
                {todayData ? formatVnLongDate(todayData.date) : "—"}
              </strong>
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Skincare Command Center
          </h1>
        </div>

        {!isTreatmentCancelled && primaryRoutine && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWeeklyCheckInOpen(true)}
              className="rounded-xl border-amber-300 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
              Đánh Giá Tuần
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSideEffectReportOpen(true)}
              className="rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
              Báo Tác Dụng Phụ
            </Button>
            <Link href={contactDoctorHref}>
              <Button
                size="sm"
                className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
                {assignedDoctorId
                  ? "Liên Hệ / Tái Khám Bác Sĩ"
                  : "Liên Hệ Bác Sĩ"}
              </Button>
            </Link>
          </div>
        )}

        {isTreatmentCancelled && (
          <Link href="/experts">
            <Button
              size="sm"
              className="rounded-xl bg-[#6b5cf6] text-xs font-bold text-white shadow-xs hover:bg-[#5a4ae5]"
            >
              <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
              Tìm Bác Sĩ Phác Đồ Mới
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="routine" className="w-full">
        <TabsList className="mb-4 rounded-xl bg-slate-100 p-1">
          <TabsTrigger
            value="routine"
            className="rounded-lg px-4 py-2 text-xs font-semibold"
          >
            Nhật Ký Hôm Nay
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="rounded-lg px-4 py-2 text-xs font-semibold"
          >
            So Sánh Tiến Trình Da
          </TabsTrigger>
          <TabsTrigger
            value="treatment"
            className="rounded-lg px-4 py-2 text-xs font-semibold"
          >
            Liệu Trình Điều Trị
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg px-4 py-2 text-xs font-semibold"
          >
            Lịch Sử & Báo Cáo
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Routine & Daily Check-in */}
        <TabsContent value="routine" className="space-y-6 outline-none">
          {isTreatmentCancelled || (!isTodayLoading && !primaryRoutine) ? (
            <Card className="border-slate-200 p-8 shadow-xs">
              <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isTreatmentCancelled
                    ? "Phác Đồ Điều Trị Hiện Tại Đã Hủy"
                    : "Chưa Có Phác Đồ Skincare Hoạt Động"}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {isTreatmentCancelled
                    ? "Phác đồ điều trị của bạn đã được hủy bỏ. Bạn có thể thực hiện bài khảo sát phân tích da AI mới hoặc đặt lịch tư vấn cùng Bác sĩ để thiết lập phác đồ phù hợp."
                    : "Bạn chưa có phác đồ chăm sóc da sáng/tối. Hãy làm khảo sát phân tích da AI hoặc đặt lịch tư vấn với Bác sĩ da liễu."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/survey">
                    <Button className="rounded-xl bg-[#6b5cf6] font-bold text-white shadow-xs hover:bg-[#5a4ae5]">
                      <Sparkles className="mr-1.5 h-4 w-4" />
                      Bắt Đầu Bài Test Da AI
                    </Button>
                  </Link>
                  <Link href="/experts">
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-300 font-semibold text-slate-700"
                    >
                      <Stethoscope className="mr-1.5 h-4 w-4 text-emerald-600" />
                      Tìm Bác Sĩ Chuyên Gia
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <LowStockBanner
                lowCount={lowStock.lowCount}
                emptyCount={lowStock.emptyCount}
                topWarning={lowStock.topWarning}
                onOpen={() => setIsRestockOpen(true)}
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Left Side: Period Selector, Habits check-in */}
                <div className="flex flex-col gap-6 md:col-span-1">
                  {/* Daily Tip */}
                  <Card className="border-slate-200 bg-blue-50/30 shadow-2xs">
                    <CardContent className="flex gap-3 p-4">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                      <div className="text-xs">
                        <span className="font-bold text-blue-800">
                          Mẹo nhỏ hôm nay:
                        </span>{" "}
                        Rửa mặt sạch và thoa toner dịu nhẹ khi da còn ẩm để hấp
                        thu dưỡng chất tốt nhất.
                      </div>
                    </CardContent>
                  </Card>

                  {/* Day Period Selector */}
                  <Card className="border-slate-200 shadow-2xs">
                    <CardHeader className="border-b border-slate-100 p-4">
                      <CardTitle className="text-sm font-bold text-slate-800">
                        Khung Giờ Chăm Sóc
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 p-4">
                      <div className="flex rounded-xl bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setPeriodOverride("MORNING")}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                            activePeriod === "MORNING"
                              ? "bg-white text-amber-600 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                          Buổi Sáng
                        </button>
                        <button
                          type="button"
                          onClick={() => setPeriodOverride("EVENING")}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                            activePeriod === "EVENING"
                              ? "bg-white text-indigo-600 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                          Buổi Tối
                        </button>
                      </div>

                      <div className="space-y-2 border-t border-slate-100 pt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Tiến độ {PERIOD_LABELS[activePeriod]}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-[#6b5cf6] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* TODO(BE): gap G4 — support habits are localStorage-only. SupportHabit /
                  RoutineSupportHabit entities exist in Be-Capstone but have no API, so
                  ticks are not persisted server-side. */}
                  {/* Habits Check-in */}
                  <Card className="border-slate-200 shadow-2xs">
                    <CardHeader className="border-b border-slate-100 p-4">
                      <CardTitle className="text-sm font-bold text-slate-800">
                        Thói Quen Tốt Mỗi Ngày
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 p-4">
                      {SUPPORT_HABITS.map((habit) => {
                        const HabitIcon = habit.icon;
                        const done = completedHabitIds.includes(habit.id);
                        return (
                          <button
                            key={habit.id}
                            type="button"
                            onClick={() => toggleHabit(habit.id)}
                            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                              done
                                ? "border-emerald-100 bg-emerald-50/50"
                                : "border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <HabitIcon
                                className={`h-4.5 w-4.5 ${done ? "text-emerald-600" : "text-slate-400"}`}
                              />
                              <span
                                className={`text-xs font-medium ${done ? "text-emerald-900" : "text-slate-700"}`}
                              >
                                {habit.label}
                              </span>
                            </div>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                done
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {done && <CheckCircle2 className="h-3 w-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Skincare Steps & Daily Diary Check-in Card */}
                <div className="flex flex-col gap-4 md:col-span-2">
                  {/* Daily Diary Card */}
                  <Card className="border-slate-200 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Activity className="h-4 w-4 text-[#6b5cf6]" />
                        Nhật Ký Tình Trạng Da Hôm Nay
                      </CardTitle>
                      {currentCheckIn && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Đã ghi nhận · {currentCheckIn.completionRate ?? 0}%
                          hoàn thành
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      {currentCheckIn ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-600">
                              Đánh giá chung:
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {currentCheckIn.overallMood
                                ? MOOD_LABELS[currentCheckIn.overallMood]
                                : "Chưa đánh giá"}
                            </span>
                          </div>
                          {currentCheckIn.sideEffects.length > 0 ? (
                            <div className="flex items-start gap-3">
                              <span className="mt-1 text-xs font-bold text-slate-600">
                                Tác dụng phụ:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {currentCheckIn.sideEffects.map(
                                  (sideEffect) => (
                                    <span
                                      key={sideEffect.id}
                                      className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700"
                                    >
                                      {SIDE_EFFECT_LABELS[sideEffect.type]}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              Da khỏe mạnh, không có kích ứng.
                            </div>
                          )}
                          {currentCheckIn.note && (
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 italic">
                              &quot;{currentCheckIn.note}&quot;
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="mb-3 text-xs text-slate-500">
                            Bạn chưa ghi nhận trạng thái da cho{" "}
                            {PERIOD_LABELS[activePeriod].toLowerCase()} hôm nay.
                          </p>
                          <Button
                            size="sm"
                            disabled={!primaryRoutine}
                            onClick={() => setIsCheckInOpen(true)}
                            className="rounded-xl bg-[#6b5cf6] px-5 text-xs font-bold text-white hover:bg-[#5a4ae5]"
                          >
                            Bắt đầu Check-in Da
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skincare Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-bold text-slate-800">
                        Các Bước Skincare Khung Giờ
                      </h2>
                      <span className="text-xs font-medium text-slate-500">
                        Khung giờ: {PERIOD_LABELS[activePeriod]}
                      </span>
                    </div>
                    {isTodayLoading ? (
                      <Card className="border-slate-200 p-8 text-center shadow-xs">
                        <p className="text-xs text-slate-500">
                          Đang tải routine...
                        </p>
                      </Card>
                    ) : stepEntries.length === 0 ? (
                      <Card className="border-slate-200 p-8 text-center shadow-xs">
                        <Clock className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-xs text-slate-500">
                          Chưa có bước chăm sóc nào cho khung giờ này.
                        </p>
                      </Card>
                    ) : (
                      stepEntries.map((entry, index) => (
                        <RoutineStepItem
                          key={entry.step.id}
                          step={entry.step}
                          index={index}
                          isRestocking={
                            entry.step.productVariant !== null &&
                            restock.restockingIds.has(
                              entry.step.productVariant.id,
                            )
                          }
                          isPending={
                            completeStep.isPending || skipStep.isPending
                          }
                          onComplete={() =>
                            handleCompleteStep(entry.routineId, entry.step.id)
                          }
                          onSkip={() =>
                            setStepToSkip({
                              routineId: entry.routineId,
                              step: entry.step,
                            })
                          }
                          onSelectDetail={() =>
                            setSelectedStepDetail(entry.step)
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab 2: Treatment Phase details (Real Data via CustomerTreatmentView) */}
        <TabsContent value="treatment" className="space-y-6 outline-none">
          <CustomerTreatmentView />
        </TabsContent>

        {/* Tab 3: Timeline & Skin History */}
        <TabsContent value="history" className="space-y-6 outline-none">
          {primaryRoutine && todayData && (
            <RoutineHistoryPanel
              routineId={primaryRoutine.id}
              today={todayData.date}
            />
          )}
        </TabsContent>

        {/* Tab 2: Progress Photo Gallery */}
        <TabsContent value="progress" className="space-y-6 outline-none">
          <ProgressPhotoGallery />
        </TabsContent>
      </Tabs>

      {primaryRoutine && (
        <>
          <DailyCheckInDialog
            key={`${primaryRoutine.id}-${activePeriod}`}
            open={isCheckInOpen}
            onOpenChange={setIsCheckInOpen}
            routineId={primaryRoutine.id}
            period={activePeriod}
          />

          <RoutineWeeklyCheckInDialog
            isOpen={isWeeklyCheckInOpen}
            onClose={() => setIsWeeklyCheckInOpen(false)}
            routineId={primaryRoutine.id}
          />

          <SideEffectReportDialog
            isOpen={isSideEffectReportOpen}
            onClose={() => setIsSideEffectReportOpen(false)}
            routineId={primaryRoutine.id}
            steps={stepEntries.map((e) => ({
              id: e.step.id,
              name: e.step.name,
            }))}
          />
        </>
      )}

      <RoutineStepDetailSheet
        isOpen={Boolean(selectedStepDetail)}
        onClose={() => setSelectedStepDetail(null)}
        step={
          selectedStepDetail
            ? {
                id: selectedStepDetail.id,
                routineId: primaryRoutine?.id || "",
                order: 1,
                period: activePeriod,
                stepName: selectedStepDetail.name,
                productName: selectedStepDetail.productVariant?.name,
                productImageUrl: selectedStepDetail.productVariant?.imageUrl,
                usageInstructions: selectedStepDetail.instructions || undefined,
                productId: selectedStepDetail.productVariant?.productId,
              }
            : null
        }
      />

      {lowStock.hasItems && (
        <RestockDialog
          // Resets the dialog's checked/quantity state when the product set changes,
          // e.g. after a purchase clears one of them.
          key={restock.active.map((item) => item.variantId).join("-")}
          open={isRestockOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsRestockOpen(true);
              return;
            }
            // Closing by any route counts as "later" for today.
            dismissRestock();
          }}
          items={restock.active}
          onMarkRestocked={restock.markRestocked}
        />
      )}

      {stepToSkip && (
        <SkipStepDialog
          key={stepToSkip.step.id}
          open={stepToSkip !== null}
          onOpenChange={(open) => {
            if (!open) setStepToSkip(null);
          }}
          stepName={stepToSkip.step.name}
          isPending={skipStep.isPending}
          onSubmit={(payload) => {
            skipStep.mutate(
              {
                routineId: stepToSkip.routineId,
                stepId: stepToSkip.step.id,
                payload,
              },
              {
                onSuccess: () => {
                  toast.success("Đã ghi nhận bỏ qua bước này.");
                  setStepToSkip(null);
                },
                onError: handleStepError,
              },
            );
          }}
        />
      )}
    </div>
  );
}
