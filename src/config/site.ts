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
        title: "Tổng quan",
        url: "/dashboard",
        icon: "LayoutDashboard",
      },
      {
        title: "Người dùng",
        url: "/dashboard/users",
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
        title: "Cảnh báo hủy lịch",
        url: "/dashboard/experts/cancellations",
        icon: "ShieldAlert",
      },
      {
        title: "Duyệt phiếu nhập kho",
        url: "/dashboard/stock-imports",
        icon: "PackagePlus",
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
        title: "Dòng tiền & Đối soát",
        url: "/dashboard/finance",
        icon: "ReceiptText",
      },
      {
        title: "Sổ cái giao dịch",
        url: "/dashboard/ledger",
        icon: "ReceiptText",
      },
      {
        title: "Duyệt rút tiền phòng khám",
        url: "/dashboard/clinic-withdrawals",
        icon: "Banknote",
      },
      {
        title: "Nhật ký hoạt động",
        url: "/dashboard/activity",
        icon: "List",
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

  // Config for clinic manager portal
  clinicPortal: {
    portal: "clinic" as const,
    title: "GlowScan Clinic",
    navMain: [
      {
        title: "Tổng quan",
        url: "/clinic",
        icon: "LayoutDashboard",
      },
      {
        title: "Quản lý Chuyên gia",
        url: "/clinic/experts",
        icon: "Users",
      },
      {
        title: "Lịch hẹn Tư vấn",
        url: "/clinic/bookings",
        icon: "Calendar",
      },
      {
        title: "Cảnh báo hủy lịch",
        url: "/clinic/expert-cancellations",
        icon: "ShieldAlert",
      },
      {
        title: "Phác đồ Điều trị",
        url: "/clinic/treatments",
        icon: "FileText",
      },
      {
        title: "Ví & Ngân hàng",
        url: "/clinic/wallet",
        icon: "Wallet",
      },
      {
        title: "Yêu cầu Rút tiền",
        url: "/clinic/withdrawals",
        icon: "Banknote",
      },
      {
        title: "Sao kê & Xuất CSV",
        url: "/clinic/statement",
        icon: "ReceiptText",
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
        title: "Tổng quan",
        url: "/expert",
        icon: "LayoutDashboard",
      },
      {
        title: "Ca tư vấn",
        url: "/expert/consultations",
        icon: "Stethoscope",
      },
      {
        title: "Phác đồ điều trị",
        url: "/expert/treatments",
        icon: "FileText",
      },
      {
        title: "Lịch khám & khung giờ",
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
        title: "Tra cứu người dùng",
        url: "/staff/users",
        icon: "Users",
      },
      {
        title: "Quản lý kho",
        url: "/staff/catalog",
        icon: "PackagePlus",
      },
      {
        title: "Phiếu nhập kho",
        url: "/staff/stock-imports",
        icon: "Boxes",
      },
      {
        title: "Bàn kiểm hàng trả",
        url: "/staff/restock-desk",
        icon: "PackageCheck",
      },
      {
        title: "Bàn giao hàng & GHN",
        url: "/staff/deliveries",
        icon: "Truck",
      },
      {
        title: "Hỗ trợ khách hàng",
        url: "/staff/support-chat",
        icon: "MessageSquare",
      },
      {
        title: "Cài đặt lịch hẹn",
        url: "/staff/booking-settings",
        icon: "Settings2",
      },
      {
        title: "Hồ sơ cá nhân",
        url: "/staff/profile",
        icon: "UserCheck",
      },
    ],
    navSecondary: [],
    documents: [],
  },
};

export type SiteConfig = typeof siteConfig;
