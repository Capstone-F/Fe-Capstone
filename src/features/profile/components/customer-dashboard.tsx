"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Home,
  BarChart3,
  Calendar,
  User,
  Award,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getProfile } from "../api/profile-client";
import { getMyRoutines } from "../api/routines-client";
import { useRouter } from "next/navigation";

export function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "home" | "report" | "history" | "profile"
  >("home");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: routines, isLoading: isLoadingRoutines } = useQuery({
    queryKey: ["routines"],
    queryFn: getMyRoutines,
  });

  // Load check-in state from local storage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`glowscan_checkin_${today}`);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleRoutine = (stepId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const next = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(next);
    localStorage.setItem(`glowscan_checkin_${today}`, JSON.stringify(next));
  };

  const isLoading = isLoadingProfile || isLoadingRoutines;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải hồ sơ...</p>
      </div>
    );
  }

  const activeRoutine = routines && routines.length > 0 ? routines[0] : null;
  const morningList = activeRoutine?.steps.filter(s => s.period === "MORNING") || [];
  const eveningList = activeRoutine?.steps.filter(s => s.period === "EVENING") || [];
  
  const totalItems = morningList.length + eveningList.length;
  const completedItemsCount =
    morningList.filter((item) => completedSteps[item.id]).length +
    eveningList.filter((item) => completedSteps[item.id]).length;

  const progressPercentage =
    totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-[#F4F3ED] animate-in fade-in relative flex min-h-[580px] w-full max-w-2xl mx-auto flex-1 flex-col pb-16 duration-300">
      <div className="max-h-full flex-1 overflow-y-auto px-4 pr-1 pb-4 pt-6">
        {/* Tab 1: Home (Tracker) */}
        {activeTab === "home" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-foreground text-xl font-extrabold">
                  Theo Dõi Hàng Ngày
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  Cập nhật tiến trình chăm sóc da hôm nay
                </p>
              </div>
            </div>

            {totalItems === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/60 rounded-3xl border border-white/60 shadow-sm">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">Chưa có Phác đồ</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Bạn cần hoàn thành bài khảo sát cấu trúc da để nhận phác đồ.
                </p>
                <Button onClick={() => router.push("/scan")} className="mt-4 rounded-full bg-primary font-bold">
                  Bắt đầu Khảo sát
                </Button>
              </div>
            ) : (
              <>
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
                        {completedItemsCount}/{totalItems}
                      </span>{" "}
                      bước chăm sóc da đề xuất.
                    </p>
                  </div>
                </div>

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
                          completedSteps[item.id]
                            ? "text-muted-foreground/80 border-emerald-100 bg-emerald-50/10 line-through"
                            : "border-border/60 hover:bg-primary/5 hover:border-primary/30 bg-white/60"
                        }`}
                      >
                        <Checkbox
                          checked={!!completedSteps[item.id]}
                          onCheckedChange={() => toggleRoutine(item.id)}
                          className={`mt-0.5 h-5 w-5 rounded-full border-2 transition-colors ${
                            completedSteps[item.id]
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-primary/30"
                          }`}
                        />
                        <div className="flex-1 space-y-1">
                          <span className="block text-sm font-bold leading-tight">
                            {item.name}
                          </span>
                          <span className="block text-[11px] leading-relaxed opacity-80">
                            {item.instructions || "Thực hiện theo chỉ định."}
                          </span>
                        </div>
                      </label>
                    ))}
                    {morningList.length === 0 && (
                      <p className="text-xs text-muted-foreground pl-2">Không có bước chăm sóc buổi sáng.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 pl-1.5 pt-4 text-xs font-extrabold tracking-wider text-indigo-500 uppercase">
                    <Moon className="h-4 w-4" />
                    <span>Routine Buổi Tối</span>
                  </div>
                  <div className="space-y-2">
                    {eveningList.map((item) => (
                      <label
                        key={item.id}
                        className={`shadow-inner-sm flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200 select-none ${
                          completedSteps[item.id]
                            ? "text-muted-foreground/80 border-emerald-100 bg-emerald-50/10 line-through"
                            : "border-border/60 hover:bg-primary/5 hover:border-primary/30 bg-white/60"
                        }`}
                      >
                        <Checkbox
                          checked={!!completedSteps[item.id]}
                          onCheckedChange={() => toggleRoutine(item.id)}
                          className={`mt-0.5 h-5 w-5 rounded-full border-2 transition-colors ${
                            completedSteps[item.id]
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-primary/30"
                          }`}
                        />
                        <div className="flex-1 space-y-1">
                          <span className="block text-sm font-bold leading-tight">
                            {item.name}
                          </span>
                          <span className="block text-[11px] leading-relaxed opacity-80">
                            {item.instructions || "Thực hiện theo chỉ định."}
                          </span>
                        </div>
                      </label>
                    ))}
                    {eveningList.length === 0 && (
                      <p className="text-xs text-muted-foreground pl-2">Không có bước chăm sóc buổi tối.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty States for Report and History */}
        {activeTab === "report" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">Biểu Đồ Sức Khỏe Da</h3>
              <p className="text-muted-foreground text-[11px]">Theo dõi chỉ số cải thiện qua các tuần</p>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/60 rounded-3xl border border-white/60 shadow-sm">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <h4 className="text-sm font-bold text-foreground">Chưa có Dữ liệu Biểu đồ</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Hãy duy trì check-in hàng ngày để hệ thống cập nhật tiến trình của bạn.</p>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">Nhật Ký Chăm Sóc Da</h3>
              <p className="text-muted-foreground text-[11px]">Lịch sử và tiến độ hoàn thành</p>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/60 rounded-3xl border border-white/60 shadow-sm">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <h4 className="text-sm font-bold text-foreground">Nhật ký trống</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Bạn chưa ghi nhận hoạt động chăm sóc da nào trong tuần này.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-foreground text-xl font-extrabold">Hồ Sơ Loại Da</h3>
              <p className="text-muted-foreground text-[11px]">Thông tin phân tích theo chuẩn Baumann</p>
            </div>
            <div className="surface-glass space-y-4 rounded-3xl bg-white/60 p-5 shadow-sm">
              <div className="border-border/50 flex items-center gap-3 border-b pb-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-foreground text-xs font-extrabold">
                    Loại da: {profileResponse?.skinType?.code || "Chưa xác định"}
                  </h4>
                  <span className="text-primary text-[10px] font-bold">
                    {profileResponse?.skinType?.description || "Hãy hoàn thành khảo sát để cập nhật"}
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-foreground block font-bold">Lưu ý y khoa:</span>
                  <span>{profileResponse?.skinType?.medicalAdvice || "Hệ thống sẽ cập nhật sau khi bạn hoàn thành khảo sát."}</span>
                </div>
                <div className="bg-border/40 h-[1px]" />
                <div>
                  <span className="text-foreground block font-bold">Đặc tính tuyến bã nhờn:</span>
                  <span>
                    {profileResponse?.skinType?.code?.includes("O") 
                      ? "Da có xu hướng tiết nhiều dầu, dễ bít tắc lỗ chân lông."
                      : profileResponse?.skinType?.code?.includes("D")
                        ? "Da có xu hướng khô, thiếu độ ẩm."
                        : "Chưa có thông tin."}
                  </span>
                </div>
                <div>
                  <span className="text-foreground block font-bold">Mức độ nhạy cảm:</span>
                  <span>
                    {profileResponse?.skinType?.code?.includes("S")
                      ? "Da nhạy cảm, dễ kích ứng hoặc mẩn đỏ."
                      : profileResponse?.skinType?.code?.includes("R")
                        ? "Da khỏe, ít bị nhạy cảm với các sản phẩm mới."
                        : "Chưa có thông tin."}
                  </span>
                </div>
                <div>
                  <span className="text-foreground block font-bold">Thông tin an toàn thai kỳ:</span>
                  <span>Bình thường - Không mang thai.</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-red-100 bg-red-50/50 text-red-600 hover:bg-red-50 hover:text-red-700 mt-4"
                onClick={() => router.push("/scan")}
              >
                Reset Phác Đồ & Khảo Sát Lại
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="border-border/50 absolute right-0 bottom-0 left-0 flex items-center justify-between border-t bg-white/95 px-6 py-2.5 backdrop-blur-md pb-4">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">Theo dõi</span>
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === "report" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-bold">Biểu đồ</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-bold">Nhật ký</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === "profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-bold">Hồ sơ</span>
        </button>
      </div>
    </div>
  );
}
