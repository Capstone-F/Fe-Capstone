"use client";

import * as React from "react";
import Link from "next/link";

import { NavDocuments } from "@/shared/components/nav-documents";
import { NavMain } from "@/shared/components/nav-main";
import { NavSecondary } from "@/shared/components/nav-secondary";
import { NavUser } from "@/shared/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  LucideIcon,
  ShoppingBagIcon,
  CalendarIcon,
  Stethoscope,
  FileText,
  Boxes,
  MessageSquare,
  PackagePlus,
  UserCheck,
} from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useSession } from "@/features/auth/hooks/useSession";
import { BrandMark } from "@/shared/components/brand-mark";

// Icon Map to convert string names from Server Config to Client React Components
const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  List: ListIcon,
  ChartBar: ChartBarIcon,
  Folder: FolderIcon,
  Users: UsersIcon,
  UserCheck: UserCheck,
  Settings2: Settings2Icon,
  CircleHelp: CircleHelpIcon,
  Search: SearchIcon,
  Database: DatabaseIcon,
  FileChartColumn: FileChartColumnIcon,
  File: FileIcon,
  ShoppingBag: ShoppingBagIcon,
  Calendar: CalendarIcon,
  Stethoscope: Stethoscope,
  FileText: FileText,
  Boxes: Boxes,
  MessageSquare: MessageSquare,
  PackagePlus: PackagePlus,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config: {
    portal: "admin" | "expert" | "customer" | "staff";
    title: string;
    navMain: { title: string; url: string; icon: string }[];
    navSecondary?: { title: string; url: string; icon: string }[];
    documents?: { name: string; url: string; icon: string }[];
  };
}

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  const session = useSession();
  const { data: profile } = useProfile();

  const currentUser = session.data || profile || null;
  const isExpertPortal = config.portal === "expert";
  const isAdminPortal = config.portal === "admin";
  const isStaffPortal = config.portal === "staff";

  // Dynamic User Profile
  const user = {
    name:
      currentUser?.name ||
      (isExpertPortal
        ? "Chuyên Gia Da Liễu"
        : isStaffPortal
          ? "GlowScan Staff"
          : isAdminPortal
            ? "GlowScan Admin"
            : "Khách Hàng"),
    email: currentUser?.email || "user@glowscan.local",
    avatar: "",
  };

  // Map string icons to React Nodes
  const mappedNavMain = config.navMain.map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  const mappedNavSecondary = (config.navSecondary || []).map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  const mappedDocuments = (config.documents || []).map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1! data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              {/* Collapsed to the icon rail only the logo survives — the wordmark is
                  hidden and the mark shrinks to fit the narrower button. */}
              <BrandMark
                asLink={false}
                showLabel={false}
                className="gap-0 [&_img]:h-9 group-data-[collapsible=icon]:[&_img]:h-6"
              />
              <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">
                {config.title}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mappedNavMain} />
        <NavDocuments items={mappedDocuments} />
        <NavSecondary items={mappedNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
