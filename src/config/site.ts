/**
 * WHAT: Global Site Configuration
 * WHY: Centralizes navigation menus, metadata, and routing structure to avoid hardcoding in layouts.
 * HOW: Layouts (DashboardLayout, AdminLayout) import this config and pass the relevant menu array to the reusable AppSidebar.
 * Note: Icons are stored as string names to prevent Next.js Server-to-Client serialization crashes.
 */

export const siteConfig = {
  // Config for the general dashboard
  dashboard: {
    navMain: [
      {
        title: "Quản lý Bác sĩ",
        url: "/dashboard/experts",
        icon: "Users",
      },
      {
        title: "Workspace Bác sĩ",
        url: "/expert",
        icon: "Stethoscope",
      },
      {
        title: "Trang chủ Admin",
        url: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
    navSecondary: [],
    documents: [],
  },

  // Config for user portal
  userPortal: {
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
        url: "/appointments",
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
};

export type SiteConfig = typeof siteConfig;
