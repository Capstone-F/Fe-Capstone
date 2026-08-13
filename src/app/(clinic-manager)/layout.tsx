import React from "react";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { ClinicBindingGuard } from "@/features/clinic-manager/components/clinic-binding-guard";

export default function ClinicManagerLayout({
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
      <AppSidebar variant="inset" config={siteConfig.clinicPortal} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <ClinicBindingGuard>{children}</ClinicBindingGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
