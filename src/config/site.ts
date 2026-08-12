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
    // Labels stay short so they survive the sidebar's single-line truncation.
    navMain: [
      {
        title: "Người dùng",
        url: "/dashboard",
        icon: "Users",
      },
      {
        title: "Phòng khám",
        url: "/dashboard/clinics",
        icon: "Folder",
      },
      {
        title: "Chuyên gia",
        url: "/dashboard/experts",
        icon: "UserCheck",
      },
      {
        title: "Hủy đơn & Kho trả",
        url: "/dashboard/cancellations",
        icon: "Boxes",
      },
      {
        title: "Ngân hàng câu hỏi",
        url: "/dashboard/surveys",
        icon: "FileText",
      },
      {
        title: "Thương mại & Ví",
        url: "/dashboard/commerce",
        icon: "ShoppingBag",
      },
      {
        title: "QA Cheats",
        url: "/dashboard/qa-cheats",
        icon: "Settings2",
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

  // Config for staff portal
  staffPortal: {
    portal: "staff" as const,
    title: "GlowScan Staff",
    navMain: [
      {
        title: "Tổng quan",
        url: "/staff",
        icon: "LayoutDashboard",
      },
      {
        title: "Phiếu nhập kho",
        url: "/staff/stock-imports",
        icon: "Boxes",
      },
      {
        title: "Hỗ trợ khách hàng",
        url: "/staff/support-chat",
        icon: "MessageSquare",
      },
      {
        title: "Onboard sản phẩm",
        url: "/staff/catalog",
        icon: "PackagePlus",
      },
    ],
    navSecondary: [],
    documents: [],
  },
};

export type SiteConfig = typeof siteConfig;
