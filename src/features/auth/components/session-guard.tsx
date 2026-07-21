"use client";

import type { Route } from "next";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { appConfig } from "@/lib/env";

import { useSession } from "../hooks/use-session";

export function SessionGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionQuery = useSession();

  useEffect(() => {
    if (appConfig.devBypassAuth) {
      return;
    }

    if (!(sessionQuery.error instanceof ApiError)) {
      return;
    }

    if (sessionQuery.error.status === 401) {
      const loginTarget = pathname
        ? `/login?redirectTo=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(loginTarget as Route);
    }
  }, [pathname, router, sessionQuery.error]);

  if (appConfig.devBypassAuth) {
    return <>{children}</>;
  }

  if (sessionQuery.isLoading) {
    return <AdminShellLoading label="Restoring admin session..." />;
  }

  if (
    sessionQuery.error instanceof ApiError &&
    sessionQuery.error.status === 401
  ) {
    return (
      <AdminShellLoading label="Session expired. Redirecting to login..." />
    );
  }

  if (sessionQuery.error) {
    return (
      <Card className="surface-glass max-w-2xl">
        <CardHeader>
          <CardTitle>Session validation failed.</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          The admin shell is reachable, but the frontend could not load the
          current user from <code>/auth/me</code>. Check the backend session and
          proxy response first.
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
