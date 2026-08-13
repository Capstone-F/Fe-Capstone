"use client";

import React from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { Forbidden403 } from "./error-states";
import { Building2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ClinicBindingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading, refetch } = useSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang kiểm tra quyền truy cập...
        </span>
      </div>
    );
  }

  // If user is not authenticated or lacks clinic_manager role
  const isClinicManager =
    user?.roles?.includes("clinic_manager") ||
    user?.roles?.includes("app_admin");

  if (!user || !isClinicManager) {
    return (
      <Forbidden403
        title="Truy cập Bảng điều khiển Phòng khám bị từ chối"
        description="Bạn cần đăng nhập bằng tài khoản Quản lý phòng khám (clinic_manager) để vào khu vực này."
      />
    );
  }

  // If bound clinicId is null
  if (user.clinicId === null) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-3xl border border-amber-200 bg-amber-50/70 p-8 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                Tài khoản chưa gán Phòng khám
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
              Tài khoản Quản lý của bạn (
              <strong>{user.email || user.name}</strong>) chưa được gán mã phòng
              khám (<code>clinicId: null</code>) trên hệ thống.
            </p>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Tất cả các tính năng quản lý tài chính, nhân sự và ca khám đều tạm
              thời bị khóa. Vui lòng liên hệ Quản trị viên (App Admin) để hoàn
              tất liên kết phòng khám.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="rounded-xl border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
              >
                Kiểm tra lại trạng thái
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
