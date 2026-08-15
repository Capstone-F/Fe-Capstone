"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { hasRole } from "../utils/role-utils";

export function DashboardRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();

  const isAdmin = Boolean(
    session?.roles && hasRole(session.roles, "app_admin"),
  );

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace("/login");
        return;
      }
      const roles = session.roles;
      if (!hasRole(roles, "app_admin")) {
        if (hasRole(roles, "clinic_manager")) {
          router.replace("/clinic/experts");
        } else if (hasRole(roles, "staff")) {
          router.replace("/staff");
        } else if (hasRole(roles, "expert")) {
          router.replace("/expert");
        } else {
          router.replace("/");
        }
      }
    }
  }, [session, isLoading, router]);

  if (isLoading || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
