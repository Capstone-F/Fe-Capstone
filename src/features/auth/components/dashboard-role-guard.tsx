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

  useEffect(() => {
    if (!isLoading && session?.roles) {
      const roles = session.roles;
      const isAdmin = hasRole(roles, "app_admin");

      if (!isAdmin) {
        if (hasRole(roles, "clinic_manager")) {
          router.replace("/clinic/experts");
        } else if (hasRole(roles, "staff")) {
          router.replace("/staff/user-lookup");
        } else if (hasRole(roles, "expert")) {
          router.replace("/expert");
        }
      }
    }
  }, [session, isLoading, router]);

  return <>{children}</>;
}
