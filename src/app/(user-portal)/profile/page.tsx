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
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useSurveyHistory,
} from "@/features/profile/hooks/use-profile";
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

const COMMON_ALLERGENS = [
  "Retinol",
  "AHA (Glycolic Acid)",
  "BHA (Salicylic Acid)",
  "Hương liệu (Fragrance)",
  "Parabens",
  "Corticoid",
  "Cồn khô (Alcohol Denat)",
];

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: history, isLoading: isHistoryLoading } = useSurveyHistory();
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

  const handleAllergyToggle = (allergen: string) => {
    setAllergies((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen],
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

              {/* Allergy Edit */}
              <div className="mt-2 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <HeartCrack className="h-4.5 w-4.5 text-red-500" />
                  Thành phần da bị kích ứng / dị ứng
                </Label>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  Các hoạt chất được đánh dấu dưới đây sẽ tự động bị loại bỏ
                  khỏi phác đồ bôi da (Routine) và đưa ra cảnh báo nếu bạn thêm
                  vào giỏ hàng.
                </p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {COMMON_ALLERGENS.map((allergen) => {
                    const isChecked = allergies.includes(allergen);
                    return (
                      <div key={allergen} className="flex items-center gap-2">
                        <Checkbox
                          id={`allergy_${allergen}`}
                          checked={isChecked}
                          onCheckedChange={() => handleAllergyToggle(allergen)}
                        />
                        <Label
                          htmlFor={`allergy_${allergen}`}
                          className="cursor-pointer text-xs font-medium text-slate-700"
                        >
                          {allergen}
                        </Label>
                      </div>
                    );
                  })}
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

        {/* Baumann & History sidebar */}
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
