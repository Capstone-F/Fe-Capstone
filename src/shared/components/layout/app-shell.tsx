"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMergeGuestCartOnLogin } from "@/features/commerce/hooks/useMergeGuestCartOnLogin";
import { ProfileOnboardingGuard } from "@/features/profile/components/profile-onboarding-guard";
import { useSession } from "@/features/auth/hooks/useSession";
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
    if (session?.user?.roles || session?.roles) {
      const roles: string[] = session.user?.roles || session.roles || [];
      const isManagement = roles.some((r) =>
        ["app_admin", "staff", "clinic_manager"].includes(r),
      );
      if (isManagement && pathname === "/") {
        router.replace("/dashboard/experts");
      } else if (roles.includes("expert") && pathname === "/") {
        router.replace("/expert");
      }
    }
  }, [session, pathname, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] font-sans text-slate-800 antialiased selection:bg-[#E2EBE6]">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {showFooter && <Footer />}
      <BottomNav />
      <ProfileOnboardingGuard />
    </div>
  );
}
