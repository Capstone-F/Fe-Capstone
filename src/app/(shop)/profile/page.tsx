"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Award,
  History,
  HeartCrack,
  ClipboardList,
  Info,
  Sun,
  Moon,
  Calendar,
  LogOut,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useSurveyHistory,
  useAllergyOptions,
} from "@/features/profile/hooks/use-profile";
import { useRoutines } from "@/features/profile/hooks/use-routines";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { logout } from "@/features/auth/api/auth-client";

export default function ProfilePage() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: history, isLoading: isHistoryLoading } = useSurveyHistory();
  const { data: allergyOptions, isLoading: isAllergyLoading } =
    useAllergyOptions();
  const { data: routines, isLoading: isRoutinesLoading } = useRoutines();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);

  // Set local state when profile is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setGender(profile.gender || "");
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "");
      setAllergies(profile.allergies || []);
    }
  }, [profile]);

  const handleAllergyToggle = (allergenCode: string) => {
    setAllergies((prev) =>
      prev.includes(allergenCode)
        ? prev.filter((a) => a !== allergenCode)
        : [...prev, allergenCode],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        name,
        phone,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        allergies,
      });
      toast.success("Cập nhật hồ sơ cá nhân thành công!");
    } catch {
      toast.error("Không thể lưu thay đổi.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const morningSteps =
    routines
      ?.flatMap((r) => r.steps)
      .filter((s) => s.period === "MORNING")
      .sort((a, b) => a.stepOrder - b.stepOrder) ?? [];

  const eveningSteps =
    routines
      ?.flatMap((r) => r.steps)
      .filter((s) => s.period === "EVENING")
      .sort((a, b) => a.stepOrder - b.stepOrder) ?? [];

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6b5cf6] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-[#131336]/60">Đang tải hồ sơ của bạn...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-16">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-[#131336]">
          Tài khoản
        </h2>
        <p className="text-sm text-[#131336]/60">
          Thông tin cá nhân & Chỉ số phân tích làn da bằng công nghệ AI GlowScan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left Column: Personal Info Form */}
        <div className="flex flex-col gap-6 md:col-span-7">
          <Card className="border-[#e5e5e5] bg-white shadow-sm rounded-2xl overflow-hidden">
            <form onSubmit={handleSave}>
              <CardHeader className="border-b border-[#e5e5e5] bg-[#FAF8F5] p-5">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-[#131336]">
                  <User className="h-5 w-5 text-[#6b5cf6]" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5 p-6">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-xs font-bold text-[#131336]">
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <User className="absolute top-3 left-3.5 h-4 w-4 text-[#131336]/40" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 text-sm rounded-xl border-[#e5e5e5] focus-visible:ring-[#6b5cf6]"
                      required
                    />
                  </div>
                </div>

                {/* Email (Disabled / Managed by Keycloak) */}
                <div className="flex flex-col gap-2 opacity-70">
                  <Label htmlFor="email" className="text-xs font-bold text-[#131336]">
                    Địa chỉ Email (Xác thực)
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3.5 h-4 w-4 text-[#131336]/40" />
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="pl-10 h-11 text-sm bg-slate-50 border-[#e5e5e5] cursor-not-allowed rounded-xl"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-[#131336]">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute top-3 left-3.5 h-4 w-4 text-[#131336]/40" />
                    <Input
                      id="phone"
                      placeholder="Nhập số điện thoại..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-11 text-sm rounded-xl border-[#e5e5e5] focus-visible:ring-[#6b5cf6]"
                    />
                  </div>
                </div>

                {/* Birthdate & Gender row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Birthdate */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dob" className="text-xs font-bold text-[#131336]">
                      Ngày sinh
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute top-3 left-3.5 h-4 w-4 text-[#131336]/40" />
                      <Input
                        id="dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="pl-10 h-11 text-sm rounded-xl border-[#e5e5e5] focus-visible:ring-[#6b5cf6]"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="gender" className="text-xs font-bold text-[#131336]">
                      Giới tính
                    </Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="h-11 w-full rounded-xl border border-[#e5e5e5] px-3 bg-white text-sm text-[#131336] focus:border-[#6b5cf6] focus:outline-none focus:ring-1 focus:ring-[#6b5cf6]"
                    >
                      <option value="">Chưa chọn</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Allergies checkboxes */}
                <div className="mt-2 flex flex-col gap-3 border-t border-[#e5e5e5] pt-5">
                  <Label className="flex items-center gap-2 text-sm font-bold text-[#131336]">
                    <HeartCrack className="h-5 w-5 text-rose-500" />
                    Thành phần da bị kích ứng / dị ứng
                  </Label>
                  <p className="text-xs text-[#131336]/60 leading-relaxed">
                    Các hoạt chất được đánh dấu dưới đây sẽ tự động được loại bỏ khỏi quy trình chăm sóc da (Routine) do AI sinh ra và cảnh báo nếu bạn cố ý thêm vào giỏ hàng.
                  </p>
                  <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {isAllergyLoading ? (
                      <p className="text-xs text-[#131336]/60">Đang tải danh sách thành phần...</p>
                    ) : (
                      allergyOptions?.map((option) => {
                        const isChecked = allergies.includes(option.code);
                        return (
                          <div key={option.code} className="flex items-center gap-2.5">
                            <Checkbox
                              id={`allergy_${option.code}`}
                              checked={isChecked}
                              onCheckedChange={() => handleAllergyToggle(option.code)}
                              className="rounded border-[#e5e5e5] text-[#6b5cf6] focus:ring-[#6b5cf6]"
                            />
                            <Label
                              htmlFor={`allergy_${option.code}`}
                              className="cursor-pointer text-xs font-semibold text-[#131336]/80"
                            >
                              {option.name}
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-[#e5e5e5] bg-[#FAF8F5] p-5">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="rounded-full bg-[#6b5cf6] px-8 py-2 text-sm font-bold text-white hover:bg-[#5a4ae5]"
                >
                  {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Web Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center justify-center gap-2 h-12 w-full rounded-2xl border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-bold transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất</span>
          </Button>
        </div>

        {/* Right Column: AI Insights & Activities */}
        <div className="flex flex-col gap-6 md:col-span-5">
          {/* AI Skin Profile Card */}
          <Card className="border-[#e5e5e5] shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#e5e5e5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#131336]">
                <Sparkles className="h-4.5 w-4.5 text-[#6b5cf6]" />
                Chỉ số da AI (GlowScan)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              {profile?.baumannCode || typeof profile?.oilyDryScore === "number" ? (
                <div className="grid grid-cols-3 gap-3 text-center">
                  {/* O/D Score */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#e5e5e5] flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-[#131336]/50 uppercase tracking-wider">Điểm O/D</span>
                    <span className="text-xl font-extrabold text-[#6b5cf6] mt-1">
                      {typeof profile.oilyDryScore === "number" ? profile.oilyDryScore : "--"}
                    </span>
                    <span className="text-[9px] text-[#131336]/40 mt-1">trên 100</span>
                  </div>

                  {/* Skin Type */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#e5e5e5] flex flex-col justify-center col-span-2">
                    <span className="text-[10px] font-bold text-[#131336]/50 uppercase tracking-wider">Loại da Baumann</span>
                    <span className="text-base font-extrabold text-[#131336] mt-1">
                      {profile.baumannCode || "Chưa xác định"}
                    </span>
                    <span className="text-[9px] text-[#131336]/40 mt-1">Hệ thống AI GlowScan</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center py-4 border-2 border-dashed border-[#e5e5e5] rounded-xl p-4">
                  <Award className="h-8 w-8 text-[#6b5cf6]/40" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#131336]">Chưa có hồ sơ phân tích da</h4>
                    <p className="text-[10px] text-[#131336]/60 leading-relaxed">
                      Làm bài khảo sát da mặt để đo lường lượng bã nhờn và phân loại da của bạn.
                    </p>
                  </div>
                  <a href="/scan" className="w-full">
                    <Button size="sm" className="w-full rounded-full bg-[#6b5cf6] text-white hover:bg-[#5a4ae5] text-xs font-bold h-9">
                      Soi da & phân tích ngay
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Routine List */}
          <Card className="border-[#e5e5e5] shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#e5e5e5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#131336]">
                <ClipboardList className="h-4.5 w-4.5 text-[#6b5cf6]" />
                Lộ trình chăm sóc da
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              {isRoutinesLoading ? (
                <p className="text-xs text-[#131336]/60 text-center">Đang tải lộ trình...</p>
              ) : routines && routines.length > 0 ? (
                <div className="space-y-4">
                  {/* Morning routine */}
                  {morningSteps.length > 0 && (
                    <div className="space-y-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase">
                        <Sun className="h-3.5 w-3.5" />
                        Buổi sáng
                      </span>
                      <ol className="space-y-2">
                        {morningSteps.map((step, i) => (
                          <li
                            key={step.id}
                            className="flex items-start gap-2.5 rounded-xl border border-[#e5e5e5]/50 bg-white p-3 text-xs"
                          >
                            <span className="text-[#6b5cf6] font-bold mt-0.5">{i + 1}.</span>
                            <div>
                              <span className="font-bold text-[#131336]">{step.name}</span>
                              {step.instructions && (
                                <p className="text-[#131336]/60 mt-1 text-[10px] leading-relaxed">
                                  {step.instructions}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Evening routine */}
                  {eveningSteps.length > 0 && (
                    <div className="space-y-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase">
                        <Moon className="h-3.5 w-3.5" />
                        Buổi tối
                      </span>
                      <ol className="space-y-2">
                        {eveningSteps.map((step, i) => (
                          <li
                            key={step.id}
                            className="flex items-start gap-2.5 rounded-xl border border-[#e5e5e5]/50 bg-white p-3 text-xs"
                          >
                            <span className="text-indigo-500 font-bold mt-0.5">{i + 1}.</span>
                            <div>
                              <span className="font-bold text-[#131336]">{step.name}</span>
                              {step.instructions && (
                                <p className="text-[#131336]/60 mt-1 text-[10px] leading-relaxed">
                                  {step.instructions}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Info className="h-5 w-5 text-[#131336]/30" />
                  <p className="text-[10px] text-[#131336]/60 leading-relaxed">
                    Chưa có lộ trình chăm sóc da nào. Hãy hoàn thành khảo sát và mua combo đề xuất để AI tự động kích hoạt Routine.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs / Survey History */}
          <Card className="border-[#e5e5e5] shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#e5e5e5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#131336]">
                <History className="h-4.5 w-4.5 text-[#6b5cf6]" />
                Lịch sử quét da AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[250px] overflow-y-auto">
              {isHistoryLoading ? (
                <p className="text-xs text-[#131336]/60 text-center">Đang tải lịch sử...</p>
              ) : history && history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-xl border border-[#e5e5e5]/60 bg-white p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ClipboardList className="h-4 w-4 text-[#131336]/40" />
                        <div>
                          <span className="block text-xs font-bold text-[#131336]">
                            Baumann: <span className="text-[#6b5cf6]">{record.baumannCode}</span>
                          </span>
                          <span className="text-[9px] text-[#131336]/50">
                            {new Date(record.createdAt).toLocaleDateString("vi-VN")}{" "}
                            {new Date(record.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#FAF8F5] border border-[#e5e5e5] px-2.5 py-0.5 text-[9px] font-bold text-[#131336]/70">
                        Hoàn thành
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#131336]/60 text-center py-4">Bạn chưa tham gia khảo sát nào.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
