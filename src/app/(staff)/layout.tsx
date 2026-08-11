import React from "react";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { siteConfig } from "@/config/site";

export default function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" config={siteConfig.staffPortal} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-slate-50/50 p-6 dark:bg-slate-950/20">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
