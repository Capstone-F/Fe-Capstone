"use client";

import React from "react";
import { useMergeGuestCartOnLogin } from "@/features/commerce/hooks/use-merge-guest-cart-on-login";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function AppShell({ children, showFooter = true }: AppShellProps) {
  useMergeGuestCartOnLogin();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] font-sans text-slate-800 antialiased selection:bg-[#E2EBE6]">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {showFooter && <Footer />}
      <BottomNav />
    </div>
  );
}
