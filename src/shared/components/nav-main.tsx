"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { useSupportSessions } from "@/features/support/hooks/useSupport";
import { SupportSessionStatus } from "@/features/support/types/support.types";
import { Badge } from "@/shared/components/ui/badge";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const pathname = usePathname();

  const isStaffSection = pathname.startsWith("/staff");

  // Load active sessions for ping badge (Staff only)
  const { data: supportSessions } = useSupportSessions(
    {
      status: SupportSessionStatus.ACTIVE,
      assigned: "me",
    },
    { enabled: isStaffSection },
  );

  const unreadCount =
    supportSessions?.items?.filter((s) => s.messageCount > s.staffLastReadSeq)
      .length || 0;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {items.map((item) => {
            // Highlight chính xác: các trang tổng quan gốc (/staff, /expert, /dashboard, /clinic, /admin) chỉ active khi khớp 100% path
            const isRootRoute =
              item.url === "/staff" ||
              item.url === "/expert" ||
              item.url === "/dashboard" ||
              item.url === "/clinic" ||
              item.url === "/admin";
            const isActive = isRootRoute
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={<Link href={item.url} />}
                  className={
                    isActive
                      ? "bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                >
                  {item.icon}
                  <span className="flex-1">{item.title}</span>
                  {item.url === "/staff/support-chat" && unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-[10px]"
                      title="Bạn còn phiên chat chưa đóng"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
