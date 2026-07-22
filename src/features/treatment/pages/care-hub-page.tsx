"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  Clock,
  Droplets,
  Bed,
  Smile,
  Meh,
  Frown,
  Activity,
  Calendar,
  Layers,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useRoutines } from "@/features/profile/hooks/useRoutines";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

interface DailyCheckInData {
  feeling: "BETTER" | "SAME" | "WORSE";
  symptoms: string[];
  note: string;
  checkedInAt: string;
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
  const { data: routines, isLoading: isRoutinesLoading } = useRoutines();

  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"MORNING" | "EVENING">(
    "MORNING",
  );
  const [sideEffectNote, setSideEffectNote] = useState("");
  const [isSideEffectOpen, setIsSideEffectOpen] = useState(false);

  // Daily Check-In state
  const [dailyCheckIn, setDailyCheckIn] = useState<DailyCheckInData | null>(
    () => {
      if (typeof window !== "undefined") {
        const today = new Date().toDateString();
        const saved = localStorage.getItem(`glowscan_checkin_${today}`);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            // ignore
          }
        }
      }
      return null;
    },
  );
  const [checkInFeeling, setCheckInFeeling] = useState<
    "BETTER" | "SAME" | "WORSE"
  >("SAME");
  const [checkInSymptoms, setCheckInSymptoms] = useState<string[]>([]);
  const [checkInNote, setCheckInNote] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Habits state
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`glowscan_habits_${today}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return [];
  });

  const isLoggedIn = !!session.data;
  const userRoutines = routines ?? [];
  const hasRoutine = userRoutines.length > 0;

  const steps = userRoutines
    .flatMap((r) => r.steps)
    .filter((s) => s.period === selectedPeriod)
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const toggleStepComplete = (stepId: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
    toast.success("Đã cập nhật trạng thái bước chăm sóc!");
  };

  const handleReportSideEffect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideEffectNote.trim()) {
      toast.error("Vui lòng mô tả triệu chứng gặp phải.");
      return;
    }
    toast.success(
      "Đã ghi nhận báo cáo tác dụng phụ. Bác sĩ sẽ phản hồi sớm nhất!",
    );
    setSideEffectNote("");
    setIsSideEffectOpen(false);
  };

  const handleDailyCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkInData: DailyCheckInData = {
      feeling: checkInFeeling,
      symptoms: checkInSymptoms,
      note: checkInNote,
      checkedInAt: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const today = new Date().toDateString();
    localStorage.setItem(
      `glowscan_checkin_${today}`,
      JSON.stringify(checkInData),
    );
    setDailyCheckIn(checkInData);
    setIsCheckInOpen(false);
    toast.success("Đã check-in thành công nhật ký da hôm nay!");
  };

  const toggleHabit = (habitId: string) => {
    setCompletedHabitIds((prev) => {
      const next = prev.includes(habitId)
        ? prev.filter((id) => id !== habitId)
        : [...prev, habitId];
      const today = new Date().toDateString();
      localStorage.setItem(`glowscan_habits_${today}`, JSON.stringify(next));
      return next;
    });
    toast.success("Đã ghi nhận thói quen tốt!");
  };

  const toggleSymptom = (sym: string) => {
    setCheckInSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  };

  // State 1: Guest User
  if (!session.isLoading && !isLoggedIn) {
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

  // State 2: Logged in but no routine
  if (isLoggedIn && !isRoutinesLoading && !hasRoutine) {
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

  const progressPct =
    steps.length > 0
      ? Math.round((completedStepIds.length / steps.length) * 100)
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
      {/* Top Welcome Panel */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>
              Da Baumann:{" "}
              <strong className="text-primary">
                {profile?.baumannCode || "Khảo sát AI"}
              </strong>
            </span>
            <span>•</span>
            <span>
              Hôm nay:{" "}
              <strong className="text-slate-700">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </strong>
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Skincare Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Side Effect Reporting Modal */}
          <Dialog open={isSideEffectOpen} onOpenChange={setIsSideEffectOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                />
              }
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Báo Tác Dụng Phụ
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  Báo Cáo Tác Dụng Phụ / Dị Ứng
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleReportSideEffect}
                className="space-y-4 pt-2"
              >
                <p className="text-xs text-slate-600">
                  Mô tả triệu chứng da bị đỏ, rát, bong tróc hoặc mụn bùng phát.
                  Bác sĩ tư vấn sẽ cập nhật phác đồ ngay lập tức.
                </p>
                <Textarea
                  placeholder="Mô tả hiện trạng làn da của bạn..."
                  value={sideEffectNote}
                  onChange={(e) => setSideEffectNote(e.target.value)}
                  className="h-24 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSideEffectOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-red-600 font-bold text-white hover:bg-red-700"
                  >
                    Gửi Báo Cáo
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Link href="/experts">
            <Button
              size="sm"
              className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
            >
              <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
              Liên Hệ Bác Sĩ
            </Button>
          </Link>
        </div>
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
                    Rửa mặt sạch và thoa toner dịu nhẹ khi da còn ẩm để hấp thu
                    dưỡng chất tốt nhất.
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
                      onClick={() => setSelectedPeriod("MORNING")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                        selectedPeriod === "MORNING"
                          ? "bg-white text-amber-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      Buổi Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("EVENING")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                        selectedPeriod === "EVENING"
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
                      <span>
                        Tiến độ {selectedPeriod === "MORNING" ? "Sáng" : "Tối"}
                      </span>
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
                  {dailyCheckIn && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      Đã ghi nhận lúc {dailyCheckIn.checkedInAt}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  {dailyCheckIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600">
                          Đánh giá chung:
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {dailyCheckIn.feeling === "BETTER" && (
                            <>
                              <Smile className="h-4 w-4 text-emerald-500" />
                              Cải thiện
                            </>
                          )}
                          {dailyCheckIn.feeling === "SAME" && (
                            <>
                              <Meh className="h-4 w-4 text-amber-500" />
                              Không đổi
                            </>
                          )}
                          {dailyCheckIn.feeling === "WORSE" && (
                            <>
                              <Frown className="h-4 w-4 text-red-500" />
                              Tệ hơn
                            </>
                          )}
                        </span>
                      </div>
                      {dailyCheckIn.symptoms.length > 0 ? (
                        <div className="flex items-start gap-3">
                          <span className="mt-1 text-xs font-bold text-slate-600">
                            Triệu chứng gặp phải:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dailyCheckIn.symptoms.map((s) => (
                              <span
                                key={s}
                                className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Da khỏe mạnh, không có kích ứng.
                        </div>
                      )}
                      {dailyCheckIn.note && (
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 italic">
                          &quot;{dailyCheckIn.note}&quot;
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCheckInOpen(true)}
                        className="mt-2 w-full text-xs"
                      >
                        Cập nhật Check-in
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="mb-3 text-xs text-slate-500">
                        Bạn chưa ghi nhận trạng thái da hôm nay.
                      </p>
                      <Button
                        size="sm"
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
                    Khung giờ: {selectedPeriod === "MORNING" ? "Sáng" : "Tối"}
                  </span>
                </div>
                {steps.length === 0 ? (
                  <Card className="border-slate-200 p-8 text-center shadow-xs">
                    <Clock className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs text-slate-500">
                      Chưa có bước chăm sóc nào cho khung giờ này.
                    </p>
                  </Card>
                ) : (
                  steps.map((step, idx) => {
                    const isDone = completedStepIds.includes(step.id);
                    return (
                      <Card
                        key={step.id}
                        className={`border-slate-200 shadow-xs transition-all ${
                          isDone
                            ? "border-slate-200 bg-slate-50/80"
                            : "bg-white hover:border-[#6b5cf6]/40"
                        }`}
                      >
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                          <div className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-xs font-bold text-[#2C3E35]">
                              {idx + 1}
                            </span>
                            <div className="space-y-1">
                              <h3
                                className={`text-sm font-bold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}
                              >
                                {step.name}
                              </h3>
                              {step.instructions && (
                                <p className="text-xs leading-relaxed text-slate-600">
                                  {step.instructions}
                                </p>
                              )}
                              <div className="flex gap-2 pt-1.5">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  Lượng dùng: Hạt đậu
                                </span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  Thời gian chờ: 1-2 phút
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isDone ? "outline" : "default"}
                            onClick={() => toggleStepComplete(step.id)}
                            className={`shrink-0 rounded-xl text-xs font-bold ${
                              isDone
                                ? "border-slate-300 text-slate-600"
                                : "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                            }`}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            {isDone ? "Hoàn thành" : "Check-in"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Treatment Phase details */}
        <TabsContent value="treatment" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Overview Box */}
            <Card className="border-slate-200 shadow-2xs md:col-span-1">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <HeartPulse className="h-4.5 w-4.5 text-rose-500" />
                  Thông Tin Điều Trị
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 text-xs text-slate-600">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-700">Liệu trình:</span>
                  <span className="max-w-fit rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                    Điều trị mụn viêm & phục hồi
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-700">
                    Bác sĩ phụ trách:
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    BS. Nguyễn Văn A
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-700">Cơ sở khám:</span>
                  <span className="font-medium text-slate-800">
                    GlowScan Clinic & Spa
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-700">
                    Tiến trình chung:
                  </span>
                  <span className="font-semibold text-slate-800">
                    Tuần 4 / 12 (Đang ở Giai đoạn Tích cực)
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <Link href="/experts">
                    <Button className="w-full rounded-xl bg-[#6b5cf6] py-2 text-xs font-bold text-white hover:bg-[#5a4ae5]">
                      Đặt Lịch Tái Khám Bác Sĩ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Phases Roadmap */}
            <Card className="border-slate-200 shadow-2xs md:col-span-2">
              <CardHeader className="border-b border-slate-100 p-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Layers className="h-4.5 w-4.5 text-[#6b5cf6]" />
                  Lộ Trình Các Giai Đoạn Điều Trị
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative ml-3 space-y-8 border-l border-slate-200 pl-6">
                  {/* Phase 1 */}
                  <div className="relative">
                    <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">
                          Giai đoạn 1: Đánh giá ban đầu
                        </h4>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          1 tuần (Hoàn tất)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Đánh giá cơ địa da Baumann, kiểm tra dị ứng ban đầu,
                        chụp ảnh baseline và thiết lập routine phục hồi đầu
                        tiên.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                          Xác định baseline
                        </span>
                        <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                          Loại trừ dị ứng mỹ phẩm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="relative">
                    <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#6b5cf6] text-white shadow-md ring-4 ring-[#6b5cf6]/20">
                      <div className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Giai đoạn 2: Điều trị tích cực
                        </h4>
                        <span className="rounded-full bg-[#6b5cf6]/10 px-2 py-0.5 text-[10px] font-bold text-[#6b5cf6]">
                          8 tuần (Đang tiến hành)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Bắt đầu tập làm quen hoạt chất retinol nồng độ thấp và
                        niacinamide trị mụn dưới sự hướng dẫn chặt chẽ của bác
                        sĩ.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          Tập trung làm sạch bã nhờn
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          Kiểm soát viêm & đỏ rát
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="relative opacity-60">
                    <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-700">
                          Giai đoạn 3: Duy trì
                        </h4>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          3 tuần (Sắp diễn ra)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Giảm tần suất hoạt chất mạnh, tăng cường cấp ẩm chuyên
                        biệt và thiết lập routine lâu dài phòng ngừa tái phát
                        mụn.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Timeline & Skin History */}
        <TabsContent value="history" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-2xs">
            <CardHeader className="border-b border-slate-100 p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Calendar className="h-4.5 w-4.5 text-[#6b5cf6]" />
                Lịch Sử Chăm Sóc & Biến Động Da
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative ml-4 space-y-6 border-l border-slate-100 pl-6">
                {/* Event 1 */}
                <div className="relative">
                  <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500">
                    <Stethoscope className="h-3 w-3" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">15/06/2026</span>
                    <h5 className="mt-0.5 font-bold text-slate-800">
                      Tư vấn khởi đầu cùng BS. Nguyễn Văn A
                    </h5>
                    <p className="mt-0.5 text-slate-500">
                      Bác sĩ đánh giá tình trạng da baseline, chụp ảnh đa chiều
                      tại clinic và kê đơn phác đồ điều trị ban đầu.
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative">
                  <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500">
                    <Layers className="h-3 w-3" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">22/06/2026</span>
                    <h5 className="mt-0.5 font-bold text-slate-800">
                      Chuyển sang Giai đoạn Điều trị tích cực
                    </h5>
                    <p className="mt-0.5 text-slate-500">
                      Kích hoạt routine chứa Retinol 0.5% vào buổi tối. Theo dõi
                      kích ứng vùng má.
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative">
                  <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full border border-red-200 bg-red-100 text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                  <div className="text-xs text-red-950">
                    <span className="text-slate-400">07/07/2026</span>
                    <h5 className="mt-0.5 font-bold text-red-800">
                      Đã gửi báo cáo tác dụng phụ / kích ứng
                    </h5>
                    <p className="mt-0.5 text-red-700">
                      Phát hiện mẩn đỏ và rát nhẹ sau 3 đêm liên tiếp bôi
                      Retinol. Đã gửi hình ảnh kèm mô tả chi tiết cho bác sĩ.
                    </p>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="relative">
                  <div className="absolute top-1 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">08/07/2026</span>
                    <h5 className="mt-0.5 font-bold text-emerald-800">
                      Routine được bác sĩ cập nhật trực tuyến
                    </h5>
                    <p className="mt-0.5 text-slate-500">
                      BS. Nguyễn Văn A chỉ định tạm dừng Retinol 0.5% buổi tối
                      trong 1 tuần, bổ sung kem dưỡng phục hồi Centella để làm
                      dịu da rát.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Check-in Form Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Activity className="h-5 w-5 text-[#6b5cf6]" />
              Check-in Tình Trạng Da Hàng Ngày
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDailyCheckInSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Cảm giác chung trên da hôm nay
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCheckInFeeling("BETTER")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                    checkInFeeling === "BETTER"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200"
                  }`}
                >
                  <Smile className="h-6 w-6 text-emerald-500" />
                  <span className="text-[10px] font-bold">Cải thiện</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInFeeling("SAME")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                    checkInFeeling === "SAME"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200"
                  }`}
                >
                  <Meh className="h-6 w-6 text-amber-500" />
                  <span className="text-[10px] font-bold">Không đổi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInFeeling("WORSE")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                    checkInFeeling === "WORSE"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200"
                  }`}
                >
                  <Frown className="h-6 w-6 text-red-500" />
                  <span className="text-[10px] font-bold">Tệ đi</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Triệu chứng da hiện tại (nếu có)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Khô da rát",
                  "Dầu thừa nhiều",
                  "Mẩn đỏ ngứa",
                  "Mụn bùng phát",
                  "Bong tróc",
                ].map((sym) => {
                  const active = checkInSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        active
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Ghi chú thêm về da
              </label>
              <Textarea
                placeholder="Ví dụ: Vùng má còn hơi đỏ sau khi rửa mặt..."
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                className="h-20 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCheckInOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
              >
                Lưu Check-in
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
