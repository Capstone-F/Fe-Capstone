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
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useSurveyHistory,
  useAllergyOptions,
} from "@/features/profile/hooks/use-profile";
import { useRoutines } from "@/features/profile/hooks/use-routines";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "sonner";

export function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: history, isLoading: isHistoryLoading } = useSurveyHistory();
  const { data: allergyOptions, isLoading: isAllergyLoading } =
    useAllergyOptions();
  const { data: routines, isLoading: isRoutinesLoading } = useRoutines();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);

  // Set local state when profile is loaded
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setAllergies(profile.allergies || []);
      }, 0);
      return () => clearTimeout(timer);
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
        allergies,
      });
      toast.success("Cập nhật hồ sơ cá nhân thành công!");
    } catch {
      toast.error("Không thể lưu thay đổi.");
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
          Hồ sơ cá nhân
        </h2>
        <p className="text-muted-foreground text-sm">
          Quản lý thông tin liên hệ, thành phần gây dị ứng và lịch sử khảo sát
          da của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Profile edit card */}
        <Card className="border-slate-200 shadow-sm md:col-span-7">
          <form onSubmit={handleSave}>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <User className="text-primary h-4.5 w-4.5" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-slate-700"
                >
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only for Keycloak) */}
              <div className="flex flex-col gap-1.5 opacity-80">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-700"
                >
                  Địa chỉ Email (Xác thực)
                </Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="cursor-not-allowed bg-slate-50 pl-8 text-xs"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-slate-700"
                >
                  Số điện thoại liên hệ
                </Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="phone"
                    placeholder="Nhập số điện thoại..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>
              </div>

              {/* Allergy Edit — Dynamic from backend */}
              <div className="mt-2 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <HeartCrack className="h-4.5 w-4.5 text-red-500" />
                  Thành phần da bị kích ứng / dị ứng
                </Label>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  Các hoạt chất được đánh dấu dưới đây sẽ tự động bị loại bỏ
                  khỏi quy trình chăm sóc da (Routine) và đưa ra cảnh báo nếu
                  bạn thêm vào giỏ hàng.
                </p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {isAllergyLoading ? (
                    <p className="text-muted-foreground col-span-2 text-center text-xs">
                      Đang tải danh sách thành phần...
                    </p>
                  ) : (
                    allergyOptions?.map((option) => {
                      const isChecked = allergies.includes(option.code);
                      return (
                        <div
                          key={option.code}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`allergy_${option.code}`}
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleAllergyToggle(option.code)
                            }
                          />
                          <Label
                            htmlFor={`allergy_${option.code}`}
                            className="cursor-pointer text-xs font-medium text-slate-700"
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
            <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-5">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-lg px-6 text-xs font-semibold"
              >
                {updateProfileMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Baumann, History & Routine sidebar */}
        <div className="flex flex-col gap-4 md:col-span-5">
          {/* Baumann type badge card */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                  Loại da Baumann hiện tại
                </span>
                <span className="block text-lg font-bold tracking-wide text-slate-900">
                  {profile?.baumannCode ? (
                    <span className="text-primary">{profile.baumannCode}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm font-normal italic">
                      Chưa xác định (Chưa soi da)
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Routine card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 p-4">
              <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ClipboardList className="text-primary h-4.5 w-4.5" />
                Lộ trình chăm sóc da
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              {isRoutinesLoading ? (
                <p className="text-muted-foreground text-center text-xs">
                  Đang tải lộ trình...
                </p>
              ) : routines && routines.length > 0 ? (
                <>
                  {/* Morning routine */}
                  {morningSteps.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase">
                        <Sun className="h-3.5 w-3.5" />
                        Buổi sáng
                      </span>
                      <ol className="flex flex-col gap-1">
                        {morningSteps.map((step, i) => (
                          <li
                            key={step.id}
                            className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs"
                          >
                            <span className="text-primary mt-0.5 font-bold">
                              {i + 1}.
                            </span>
                            <div>
                              <span className="font-semibold text-slate-800">
                                {step.name}
                              </span>
                              {step.instructions && (
                                <p className="text-muted-foreground mt-0.5 text-[10px]">
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
                    <div className="mt-2 flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase">
                        <Moon className="h-3.5 w-3.5" />
                        Buổi tối
                      </span>
                      <ol className="flex flex-col gap-1">
                        {eveningSteps.map((step, i) => (
                          <li
                            key={step.id}
                            className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs"
                          >
                            <span className="mt-0.5 font-bold text-indigo-500">
                              {i + 1}.
                            </span>
                            <div>
                              <span className="font-semibold text-slate-800">
                                {step.name}
                              </span>
                              {step.instructions && (
                                <p className="text-muted-foreground mt-0.5 text-[10px]">
                                  {step.instructions}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center">
                  <Info className="text-slate-350 h-6 w-6" />
                  <p className="text-[10px]">
                    Chưa có lộ trình chăm sóc da nào. Hoàn thành khảo sát và mua
                    gói sản phẩm để hệ thống AI tự động sinh Routine cho bạn.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Survey History list card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 p-4">
              <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <History className="text-primary h-4.5 w-4.5" />
                Lịch sử khảo sát da
              </CardTitle>
            </CardHeader>
            <CardContent className="flex max-h-[300px] flex-col gap-3 overflow-y-auto p-4">
              {isHistoryLoading ? (
                <p className="text-muted-foreground text-center text-xs">
                  Đang tải lịch sử...
                </p>
              ) : history && history.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="text-muted-foreground h-4 w-4" />
                        <div>
                          <span className="block text-xs font-bold text-slate-800">
                            Baumann:{" "}
                            <span className="text-primary">
                              {record.baumannCode}
                            </span>
                          </span>
                          <span className="text-muted-foreground block text-[9px]">
                            {new Date(record.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}{" "}
                            {new Date(record.createdAt).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                        Bước 7/7
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 p-6 text-center">
                  <Info className="text-slate-350 h-8 w-8" />
                  <p className="text-xs">
                    Bạn chưa hoàn thành cuộc khảo sát nào.
                  </p>
                  <a href="/login?redirectTo=/scan">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px]"
                    >
                      Soi da ngay
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
