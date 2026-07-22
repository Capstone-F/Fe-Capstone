"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { appConfig } from "@/lib/env";

import { useSession } from "../hooks/useSession";
import { shouldRedirectToLogin } from "../lib/session-access";

export function SessionGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const sessionQuery = useSession();

  useEffect(() => {
    if (appConfig.devBypassAuth) {
      return;
    }

    if (
      shouldRedirectToLogin({
        isLoading: sessionQuery.isLoading,
        hasSession: Boolean(sessionQuery.data),
      })
    ) {
      const loginTarget = pathname
        ? `/login?redirectTo=${encodeURIComponent(pathname)}`
        : "/login";
      window.location.href = loginTarget;
    }
  }, [pathname, sessionQuery.data, sessionQuery.isLoading]);

  if (appConfig.devBypassAuth) {
    return <>{children}</>;
  }

  if (sessionQuery.isLoading) {
    return <AdminShellLoading label="Đang khôi phục phiên đăng nhập..." />;
  }

  if (
    shouldRedirectToLogin({
      isLoading: sessionQuery.isLoading,
      hasSession: Boolean(sessionQuery.data),
    })
  ) {
    return (
      <AdminShellLoading label="Phiên đăng nhập không còn hợp lệ. Đang chuyển tới đăng nhập..." />
    );
  }

  if (sessionQuery.error) {
    return (
      <Card className="surface-glass max-w-2xl">
        <CardHeader>
          <CardTitle>Không thể xác thực phiên đăng nhập.</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Frontend không thể tải người dùng hiện tại từ <code>/users/me</code>.
          Kiểm tra lại API xác thực và token đăng nhập hiện tại.
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

type AdminShellLoadingProps = {
  label: string;
};

export function AdminShellLoading({ label }: AdminShellLoadingProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="surface-glass">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
