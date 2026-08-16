"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserCheck,
  LogOut,
  Loader2,
  ShieldCheck,
  Mail,
  User,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { profileApi } from "@/features/profile/api/profile.api";
import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/query/keys";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { StaffPageHeader } from "./staff-page-header";

export function StaffProfileView() {
  const session = useSession();
  const user = session.data;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [prevUserName, setPrevUserName] = useState(user?.name);
  const [name, setName] = useState(user?.name ?? "");
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (user?.name !== undefined && user.name !== prevUserName) {
    setPrevUserName(user.name);
    setName(user.name ?? "");
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ tên.");
      return;
    }

    try {
      setUpdating(true);
      const res = await profileApi.patchUserMe(name.trim());
      toast.success("Cập nhật thông tin thành công!");
      queryClient.setQueryData(queryKeys.session, res.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật thông tin";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      queryClient.setQueryData(queryKeys.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.profile });
      router.replace("/");
    }
  };

  if (session.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-xs text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#2C3E35]" />
        Đang tải thông tin tài khoản staff...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={UserCheck}
        title="Hồ Sơ Nhân Viên (Staff Profile)"
        description="Xem thông tin cá nhân, cập nhật tên hiển thị và kiểm tra vai trò được cấp trên hệ thống."
      />

      <Card className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <User className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
            Chi tiết tài khoản Staff
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Địa chỉ Email
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  value={user?.email || "staff@glowscan.local"}
                  disabled
                  className="rounded-xl border-slate-200 bg-slate-100 pl-9 text-xs font-medium text-slate-600 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Họ và Tên Staff *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhân viên..."
                className="rounded-xl border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Vai trò hệ thống (Roles)
              </Label>
              <div className="flex flex-wrap gap-2">
                {user?.roles?.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="flex items-center gap-1 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
              >
                {loggingOut ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                )}
                Đăng xuất
              </Button>

              <Button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white shadow-md hover:bg-[#3A5246]"
              >
                {updating ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
