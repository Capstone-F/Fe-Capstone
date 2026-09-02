"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { ThemeSwitcher } from "@/shared/components/theme-switcher";

export function SiteHeader() {
  const pathname = usePathname();

  let pageTitle = "GlowScan Portal";
  if (pathname === "/expert") {
    pageTitle = "Tổng quan chuyên gia";
  } else if (pathname?.startsWith("/expert/consultations")) {
    pageTitle = "Ca tư vấn";
  } else if (pathname === "/expert/treatments") {
    pageTitle = "Phác đồ điều trị";
  } else if (pathname?.startsWith("/expert/treatments/builder")) {
    pageTitle = "Thiết kế phác đồ điều trị";
  } else if (pathname === "/expert/schedule") {
    pageTitle = "Lịch khám và khung giờ";
  } else if (pathname === "/dashboard") {
    pageTitle = "Quản Lý Người Dùng & Phân Quyền";
  } else if (pathname === "/dashboard/experts") {
    pageTitle = "Onboard & Quản Lý Chuyên Gia";
  } else if (pathname === "/dashboard/clinics") {
    pageTitle = "Quản Lý Phòng Khám Đối Tác";
  } else if (pathname === "/dashboard/cancellations") {
    pageTitle = "Bàn Hủy Đơn & Kho Trả (Restock)";
  } else if (pathname === "/dashboard/surveys") {
    pageTitle = "Ngân Hàng Câu Hỏi Khảo Sát";
  } else if (pathname === "/dashboard/commerce") {
    pageTitle = "Cấu Hình";
  } else if (pathname === "/dashboard/qa-cheats") {
    pageTitle = "Bảng Công Cụ QA Cheats";
  } else if (pathname === "/dashboard/products") {
    pageTitle = "Quản Lý Sản Phẩm & Stock";
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-sm font-semibold text-slate-800">{pageTitle}</h1>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
