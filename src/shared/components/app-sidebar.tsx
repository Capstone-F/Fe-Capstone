"use client";

import * as React from "react";

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
  CommandIcon,
  LucideIcon,
  ShoppingBagIcon,
  CalendarIcon,
} from "lucide-react";
import { vi } from "@/config/locales/vi";
import { useProfile } from "@/features/profile/hooks/use-profile";

// Icon Map to convert string names from Server Config to Client React Components
const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  List: ListIcon,
  ChartBar: ChartBarIcon,
  Folder: FolderIcon,
  Users: UsersIcon,
  Settings2: Settings2Icon,
  CircleHelp: CircleHelpIcon,
  Search: SearchIcon,
  Database: DatabaseIcon,
  FileChartColumn: FileChartColumnIcon,
  File: FileIcon,
  ShoppingBag: ShoppingBagIcon,
  Calendar: CalendarIcon,
};

// Temporary static user for UI mock
const MOCK_USER = {
  name: "GlowScan Admin",
  email: "admin@glowscan.com",
  avatar: "/avatars/shadcn.jpg",
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config: {
    navMain: { title: string; url: string; icon: string }[];
    navSecondary: { title: string; url: string; icon: string }[];
    documents: { name: string; url: string; icon: string }[];
  };
}

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  const { data: profile } = useProfile();

  // Check if we are rendering the user portal sidebar
  const isUserPortal = config.navMain.some(
    (item) => item.url === "/scan" || item.url === "/experts",
  );

  const user =
    isUserPortal && profile
      ? {
          name: profile.name || "GlowScan User",
          email: profile.email || "user@glowscan.local",
          avatar: "/avatars/shadcn.jpg",
        }
      : MOCK_USER;

  // Map string icons to React Nodes
  const mappedNavMain = config.navMain.map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  const mappedNavSecondary = config.navSecondary.map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  const mappedDocuments = config.documents.map((item) => {
    const Icon = IconMap[item.icon];
    return { ...item, icon: Icon ? <Icon /> : undefined };
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">
                {vi.sidebar.brand}
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
