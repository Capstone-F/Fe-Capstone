"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Lock, FileQuestion, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function Forbidden403({
  title = "Không có quyền truy cập",
  description = "Tài khoản của bạn không có quyền thực hiện thao tác hoặc truy cập vào khu vực này.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <Lock className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <Link href="/clinic" className="mt-5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          Quay lại Bảng điều khiển
        </Button>
      </Link>
    </div>
  );
}

export function NotFound404({
  title = "Không tìm thấy dữ liệu",
  description = "Dữ liệu bạn yêu cầu không tồn tại hoặc đã bị xóa khỏi hệ thống.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function NetworkError({
  message = "Có lỗi kết nối mạng hoặc máy chủ. Vui lòng thử lại sau.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center dark:border-rose-950/50 dark:bg-rose-950/20">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="max-w-md text-xs font-medium text-rose-700 dark:text-rose-300">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 rounded-xl border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Thử lại
        </Button>
      )}
    </div>
  );
}
