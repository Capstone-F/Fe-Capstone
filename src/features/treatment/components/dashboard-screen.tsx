"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Home,
  BarChart3,
  Calendar,
  User,
  CheckCircle,
  RefreshCw,
  Award,
  TrendingUp,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTreatment } from "../context/treatment-context";
import { Checkbox } from "@/components/ui/checkbox";

export function DashboardScreen() {
  const { state, toggleRoutine, resetAll } = useTreatment();
  const [activeTab, setActiveTab] = useState<
    "home" | "report" | "history" | "profile"
  >("home");

  // Routine lists
  const morningList = state.morningRoutine;
  const eveningList = state.eveningRoutine;
  const totalItems = morningList.length + eveningList.length;
  const completedItems =
    morningList.filter((item) => item.completed).length +
    eveningList.filter((item) => item.completed).length;

  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // SVG Gauge calculations
  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-background animate-in fade-in relative flex min-h-[580px] flex-1 flex-col pb-16 duration-300">
      {/* Scrollable Dashboard Body */}
      <div className="max-h-[500px] flex-1 overflow-y-auto px-4 pr-1 pb-4">
        {/* Tab 1: Home (Tracker) */}
        {activeTab === "home" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-foreground text-xl font-extrabold">
                  Theo Dõi Hàng Ngày
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  Cập nhật tiến trình chăm sóc da hôm nay
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={resetAll}
                title="Làm lại khảo sát"
                className="border-border/80 text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Circular Progress Arc Card */}
            <div className="surface-glass flex items-center gap-4.5 rounded-3xl border border-white/60 bg-white/70 p-4.5 shadow-sm">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    stroke="oklch(var(--primary) / 0.12)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="translate-x-1.5 translate-y-1.5"
                  />
                  <circle
                    stroke="oklch(var(--primary))"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + " " + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="translate-x-1.5 translate-y-1.5 transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-foreground text-lg font-black">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-foreground text-xs font-extrabold">
                  Tiến Độ Hôm Nay
                </h4>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  Bạn đã hoàn thành{" "}
                  <span className="text-foreground font-bold">
                    {completedItems}/{totalItems}
                  </span>{" "}
                  bước chăm sóc da đề xuất.
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    progressPercentage === 100
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                      : progressPercentage > 50
                        ? "bg-primary/5 text-primary border-primary/10 border"
                        : "border border-amber-100 bg-amber-50 text-amber-600"
                  }`}
                >
                  {progressPercentage === 100
                    ? "Xuất sắc! Đã hoàn thành 100%"
                    : progressPercentage > 50
                      ? "Đang hoàn thành khá tốt"
                      : "Hãy bắt đầu routine nhé!"}
                </span>
              </div>
            </div>

            {/* Checklist: Sáng */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pl-1.5 text-xs font-extrabold tracking-wider text-amber-600 uppercase">
                <Sun className="h-4 w-4" />
                <span>Routine Buổi Sáng</span>
              </div>
              <div className="space-y-2">
                {morningList.map((item) => (
                  <label
                    key={item.id}
                    className={`shadow-inner-sm flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200 select-none ${
                      item.completed
                        ? "text-muted-foreground/80 decoration-muted-foreground/30 border-emerald-100 bg-emerald-50/10 line-through"
                        : "border-border/60 hover:bg-primary/5 hover:border-primary/30 bg-white/60"
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleRoutine(item.id, "morning")}
                      className="border-border/80 mt-0.5 h-4.5 w-4.5 rounded-md data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground text-xs leading-none font-bold">
                        {item.text}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Checklist: Tối */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pl-1.5 text-xs font-extrabold tracking-wider text-indigo-600 uppercase">
                <Moon className="h-4 w-4" />
                <span>Routine Buổi Tối</span>
              </div>
              <div className="space-y-2">
                {eveningList.map((item) => (
                  <label
                    key={item.id}
                    className={`shadow-inner-sm flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200 select-none ${
                      item.completed
                        ? "text-muted-foreground/80 decoration-muted-foreground/30 border-emerald-100 bg-emerald-50/10 line-through"
                        : "border-border/60 hover:bg-primary/5 hover:border-primary/30 bg-white/60"
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleRoutine(item.id, "evening")}
                      className="border-border/80 mt-0.5 h-4.5 w-4.5 rounded-md data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground text-xs leading-none font-bold">
                        {item.text}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Report (Biểu đồ tiến trình) */}
        {activeTab === "report" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">
                Biểu Đồ Sức Khỏe Da
              </h3>
              <p className="text-muted-foreground text-[11px]">
                Theo dõi chỉ số cải thiện qua các tuần
              </p>
            </div>

            {/* Micro Chart Mockup */}
            <div className="surface-glass space-y-4 rounded-3xl bg-white/60 p-5 shadow-sm">
              <div className="border-border/50 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <span className="text-foreground text-xs font-bold">
                    Chỉ số phục hồi hàng rào bảo vệ
                  </span>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
                  +12%
                </span>
              </div>

              {/* Chart bars simulation */}
              <div className="flex h-32 items-end justify-between px-2 pt-4">
                <div className="flex w-10 flex-col items-center gap-2">
                  <div className="bg-primary/20 h-[40%] w-full rounded-t-lg" />
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    T1
                  </span>
                </div>
                <div className="flex w-10 flex-col items-center gap-2">
                  <div className="bg-primary/40 h-[55%] w-full rounded-t-lg" />
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    T2
                  </span>
                </div>
                <div className="flex w-10 flex-col items-center gap-2">
                  <div className="bg-primary/60 h-[68%] w-full rounded-t-lg" />
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    T3
                  </span>
                </div>
                <div className="flex w-10 flex-col items-center gap-2">
                  <div className="bg-primary relative h-[78%] w-full rounded-t-lg">
                    <div className="bg-primary absolute -top-6 left-1/2 -translate-x-1/2 rounded px-1 py-0.5 text-[8px] font-bold text-white">
                      78
                    </div>
                  </div>
                  <span className="text-foreground text-[10px] font-bold">
                    T4 (Hiện tại)
                  </span>
                </div>
              </div>
            </div>

            {/* Health parameters breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border-border/60 flex flex-col gap-1.5 rounded-2xl border bg-white/50 p-3 shadow-sm">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                  Độ ẩm
                </span>
                <span className="text-base font-bold text-blue-600">
                  65% (+5%)
                </span>
                <p className="text-muted-foreground text-[9px]">
                  Tình trạng khô ráp giảm dần
                </p>
              </div>

              <div className="border-border/60 flex flex-col gap-1.5 rounded-2xl border bg-white/50 p-3 shadow-sm">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                  Bã nhờn thừa
                </span>
                <span className="text-base font-bold text-amber-600">
                  Giảm 25%
                </span>
                <p className="text-muted-foreground text-[9px]">
                  Tuyến bã nhờn dịu lại
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History (Nhật ký) */}
        {activeTab === "history" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">
                Lịch Sử Liệu Trình
              </h3>
              <p className="text-muted-foreground text-[11px]">
                Xem nhật ký hoàn thành chăm sóc da
              </p>
            </div>

            {/* History List */}
            <div className="space-y-3">
              {/* Day 1 */}
              <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-foreground text-xs font-bold">
                      Hôm nay
                    </span>
                    <p className="text-muted-foreground text-[10px]">
                      Đã hoàn thành {completedItems} trên {totalItems} bước
                    </p>
                  </div>
                </div>
                <span className="text-primary text-xs font-extrabold">
                  {progressPercentage}%
                </span>
              </div>

              {/* Day 2 */}
              <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-foreground text-xs font-bold">
                      Hôm qua - 19/06
                    </span>
                    <p className="text-muted-foreground text-[10px]">
                      Hoàn thành tất cả các bước (6/6)
                    </p>
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
                  100%
                </span>
              </div>

              {/* Day 3 */}
              <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-foreground text-xs font-bold">
                      18/06
                    </span>
                    <p className="text-muted-foreground text-[10px]">
                      Hoàn thành routine tối, bỏ lỡ routine sáng (3/6)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-600">
                  50%
                </span>
              </div>

              {/* Day 4 */}
              <div className="border-border/60 flex items-center justify-between rounded-2xl border bg-white/50 p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-foreground text-xs font-bold">
                      17/06
                    </span>
                    <p className="text-muted-foreground text-[10px]">
                      Hoàn thành tất cả các bước (6/6)
                    </p>
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
                  100%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Profile (Hồ sơ Baumann) */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">
                Hồ Sơ Loại Da
              </h3>
              <p className="text-muted-foreground text-[11px]">
                Thông tin phân tích theo chuẩn Baumann
              </p>
            </div>

            {/* Profile Detail Card */}
            <div className="surface-glass space-y-4 rounded-3xl bg-white/60 p-5 shadow-sm">
              <div className="border-border/50 flex items-center gap-3 border-b pb-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-foreground text-xs font-extrabold">
                    Loại da:{" "}
                    {(state.surveyAnswers.baumannOilyDry || "O") +
                      (state.surveyAnswers.baumannSensitiveResistant || "S") +
                      (state.surveyAnswers.baumannPigmentNon || "P") +
                      (state.surveyAnswers.baumannWrinkleTight || "T")}
                  </h4>
                  <span className="text-primary text-[10px] font-bold">
                    {state.surveyAnswers.baumannOilyDry === "O"
                      ? "Da dầu (Oily)"
                      : "Da khô (Dry)"}{" "}
                    •{" "}
                    {state.surveyAnswers.baumannSensitiveResistant === "S"
                      ? "Nhạy cảm (Sensitive)"
                      : "Đề kháng (Resistant)"}
                  </span>
                </div>
              </div>

              <div className="text-muted-foreground space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-foreground block font-bold">
                    Đặc tính tuyến bã nhờn:
                  </span>
                  <span>
                    {state.surveyAnswers.baumannOilyDry === "O"
                      ? "Da của bạn thuộc nhóm tiết nhiều bã nhờn, dễ gây bít tắc lỗ chân lông. Cần chú trọng các sản phẩm làm sạch kiềm dầu nhẹ như Glycerin, Niacinamide."
                      : "Da của bạn thuộc nhóm da khô, tuyến dầu hoạt động kém. Cần bù ẩm khóa ẩm lipid để duy trì sự mượt mà."}
                  </span>
                </div>
                <div>
                  <span className="text-foreground block font-bold">
                    Mức độ nhạy cảm:
                  </span>
                  <span>
                    {state.surveyAnswers.baumannSensitiveResistant === "S"
                      ? "Lớp sừng bảo vệ mỏng yếu, dễ đỏ ửng hoặc kích ứng nhẹ. Cần sử dụng Niacinamide phục hồi để củng cố hàng rào lipid bảo vệ da."
                      : "Da khỏe mạnh đề kháng tốt, dung nạp tốt hầu hết các thành phần hoạt chất mà ít bị đỏ rát."}
                  </span>
                </div>

                <div className="bg-border/40 h-[1px]" />

                <div>
                  <span className="text-foreground block font-bold">
                    Thông tin an toàn thai kỳ:
                  </span>
                  <span
                    className={
                      state.surveyAnswers.pregnancy === "yes"
                        ? "font-bold text-red-500"
                        : ""
                    }
                  >
                    {state.surveyAnswers.pregnancy === "yes"
                      ? "Đang mang thai - Chế độ an toàn thai kỳ hoạt động (Đã loại trừ Retinol và BHA liều cao khỏi phác đồ)."
                      : "Bình thường - Không mang thai."}
                  </span>
                </div>

                {state.surveyAnswers.currentActiveIngredients.length > 0 && (
                  <div>
                    <span className="text-foreground block font-bold">
                      Hoạt chất cũ đang sử dụng:
                    </span>
                    <span>
                      {state.surveyAnswers.currentActiveIngredients.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <Button
              onClick={resetAll}
              variant="outline"
              className="border-border/80 text-destructive hover:bg-destructive/5 hover:text-destructive w-full rounded-2xl py-5 text-xs font-bold transition-colors"
            >
              Reset Phác Đồ & Khảo Sát Lại
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Fixed Navigation Bar */}
      <div className="border-border/40 absolute right-0 bottom-0 left-0 z-20 flex h-14 items-center justify-around rounded-b-3xl border-t bg-white/90 backdrop-blur-md">
        {/* Nav 1: Home */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "home"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Theo dõi</span>
        </button>

        {/* Nav 2: Report */}
        <button
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "report"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Biểu đồ</span>
        </button>

        {/* Nav 3: History */}
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "history"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Nhật ký</span>
        </button>

        {/* Nav 4: Profile */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "profile"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Hồ sơ</span>
        </button>
      </div>
    </div>
  );
}
