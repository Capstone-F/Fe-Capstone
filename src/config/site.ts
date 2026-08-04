/**
 * WHAT: Global Site Configuration
 * WHY: Centralizes navigation menus, metadata, and routing structure to avoid hardcoding in layouts.
 * HOW: Layouts (DashboardLayout, AdminLayout) import this config and pass the relevant menu array to the reusable AppSidebar.
 * Note: Icons are stored as string names to prevent Next.js Server-to-Client serialization crashes.
 */

export const siteConfig = {
  // Config for the general dashboard
  dashboard: {
    portal: "admin" as const,
    title: "GlowScan Admin",
    navMain: [
      {
        title: "Quản lý người dùng",
        url: "/dashboard",
        icon: "Users",
      },
      {
        title: "Quản lý chuyên gia",
        url: "/dashboard/experts",
        icon: "Users",
      },
      {
        title: "Cổng chuyên gia",
        url: "/expert",
        icon: "Stethoscope",
      },
    ],
    navSecondary: [],
    documents: [],
  },

  // Config for user portal
  userPortal: {
    portal: "customer" as const,
    title: "GlowScan Portal",
    navMain: [
      {
        title: "Bảng điều khiển & Soi da",
        url: "/scan",
        icon: "LayoutDashboard",
      },
      {
        title: "Danh sách Chuyên gia",
        url: "/experts",
        icon: "Users",
      },
      {
        title: "Lịch hẹn của tôi",
        url: "/profile?tab=appointments",
        icon: "Calendar",
      },
      {
        title: "Hồ sơ cá nhân",
        url: "/profile",
        icon: "Settings2",
      },
    ],
    navSecondary: [],
    documents: [],
  },

  // Config for expert portal
  expertPortal: {
    portal: "expert" as const,
    title: "GlowScan Expert",
    navMain: [
      {
        title: "Ca Tư Vấn Bệnh Nhân",
        url: "/expert",
        icon: "Stethoscope",
      },
      {
        title: "Phác Đồ Điều Trị",
        url: "/expert/treatments",
        icon: "FileText",
      },
      {
        title: "Lịch Khám & Slots",
        url: "/expert/schedule",
        icon: "Calendar",
      },
    ],
    navSecondary: [],
    documents: [],
  },
};

export type SiteConfig = typeof siteConfig;
