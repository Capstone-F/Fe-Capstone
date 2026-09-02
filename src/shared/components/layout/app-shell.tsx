"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMergeGuestCartOnLogin } from "@/features/commerce/hooks/useMergeGuestCartOnLogin";
import { ProfileOnboardingGuard } from "@/features/profile/components/profile-onboarding-guard";
import { useSession } from "@/features/auth/hooks/useSession";
import { CustomerSupportWidget } from "@/features/support/components/customer-support-widget";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function AppShell({ children, showFooter = true }: AppShellProps) {
  useMergeGuestCartOnLogin();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.roles && pathname === "/") {
      const roles: string[] = session.roles || [];
      if (roles.includes("clinic_manager")) {
        router.replace("/clinic/experts");
      } else if (roles.includes("staff")) {
        router.replace("/staff");
      } else if (roles.includes("app_admin")) {
        router.replace("/dashboard");
      } else if (roles.includes("expert")) {
        router.replace("/expert");
      }
    }
  }, [session, pathname, router]);

  const roles = session?.roles || [];
  const isStaffOrAdmin = roles.some((r) =>
    ["app_admin", "staff", "clinic_manager", "expert"].includes(r),
  );
  const showCustomerSupportWidget = !isStaffOrAdmin && pathname !== "/support";

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] font-sans text-slate-800 antialiased selection:bg-[#E2EBE6]">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {showFooter && <Footer />}
      <BottomNav />
      <ProfileOnboardingGuard />
      {showCustomerSupportWidget && <CustomerSupportWidget />}
    </div>
  );
}
