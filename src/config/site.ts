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
        title: "Bảng điều khiển",
        url: "/dashboard",
        icon: "LayoutDashboard",
      },
      {
        title: "Vòng đời khách hàng",
        url: "#",
        icon: "List",
      },
      {
        title: "Phân tích & Thống kê",
        url: "#",
        icon: "ChartBar",
      },
      {
        title: "Dự án",
        url: "#",
        icon: "Folder",
      },
      {
        title: "Đội ngũ",
        url: "#",
        icon: "Users",
      },
    ],
    navSecondary: [
      {
        title: "Cài đặt hệ thống",
        url: "#",
        icon: "Settings2",
      },
      {
        title: "Trợ giúp & Hỗ trợ",
        url: "#",
        icon: "CircleHelp",
      },
      {
        title: "Tìm kiếm...",
        url: "#",
        icon: "Search",
      },
    ],
    documents: [
      {
        name: "Thư viện dữ liệu",
        url: "#",
        icon: "Database",
      },
      {
        name: "Báo cáo",
        url: "#",
        icon: "FileChartColumn",
      },
      {
        name: "Trợ lý AI",
        url: "#",
        icon: "File",
      },
    ],
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
