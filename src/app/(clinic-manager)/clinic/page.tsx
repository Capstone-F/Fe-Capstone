"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  Wallet,
  Banknote,
  ReceiptText,
  Building2,
  TrendingUp,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserPlus,
  PlusCircle,
  Stethoscope,
  BarChart3,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useSession } from "@/features/auth/hooks/useSession";
import { useClinicWallet } from "@/features/clinic-manager/hooks/useClinicWallet";
import { useClinicExperts } from "@/features/clinic-manager/hooks/useClinicExperts";
import { useClinicBookings } from "@/features/clinic-manager/hooks/useClinicBookings";
import { useClinicTreatments } from "@/features/clinic-manager/hooks/useClinicTreatments";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const formatVnd = (val?: number | string | null) => {
  if (val === undefined || val === null) return "0 ₫";
  const num = typeof val === "number" ? val : Number(val) || 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "--/--/----";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const SPECIALIZATION_MAP: Record<string, string> = {
  DERMATOLOGY: "Da liễu tổng quát",
  ACNE_TREATMENT: "Điều trị mụn",
  LASER_THERAPY: "Trị liệu Laser",
  COSMETIC_DERMATOLOGY: "Da liễu thẩm mỹ",
  ANTI_AGING: "Trẻ hóa & Chống lão hóa",
  PIGMENTATION: "Điều trị sắc tố & Nám",
};

export default function ClinicDashboardPage() {
  const { data: user } = useSession();
  const { data: wallet, isLoading: isWalletLoading } = useClinicWallet();
  const { data: expertsRes, isLoading: isExpertsLoading } = useClinicExperts({
    limit: 100,
  });
  const { data: bookingsRes, isLoading: isBookingsLoading } = useClinicBookings(
    { limit: 100 },
  );
  const { data: treatmentsRes, isLoading: isTreatmentsLoading } =
    useClinicTreatments({ limit: 100 });

  const expertsList = expertsRes?.items || [];
  const bookingsList = bookingsRes?.items || [];
  const treatmentsList = treatmentsRes?.items || [];

  const activeExpertsCount = expertsList.filter((e) => e.isActive).length;
  const completedBookingsCount = bookingsList.filter(
    (b) => b.status === "COMPLETED",
  ).length;

  // Real Status Breakdown Chart Data computed from real API bookings
  const statusCounts: Record<string, number> = {
    "Chờ khám": 0,
    "Đã xác nhận": 0,
    "Đang khám": 0,
    "Hoàn thành": 0,
    "Đã hủy": 0,
  };

  bookingsList.forEach((b) => {
    switch (b.status) {
      case "PENDING":
        statusCounts["Chờ khám"] += 1;
        break;
      case "CONFIRMED":
        statusCounts["Đã xác nhận"] += 1;
        break;
      case "IN_PROGRESS":
        statusCounts["Đang khám"] += 1;
        break;
      case "COMPLETED":
        statusCounts["Hoàn thành"] += 1;
        break;
      case "CANCELLED":
        statusCounts["Đã hủy"] += 1;
        break;
    }
  });

  const realBookingStatusChartData = Object.entries(statusCounts).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const CHART_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

  // Real Treatment Revenue Chart Data computed from real API treatments
  const treatmentStatusRevenue: Record<string, number> = {
    "Đang điều trị": 0,
    "Tạm dừng": 0,
    "Hoàn thành": 0,
    "Đã hủy": 0,
  };

  treatmentsList.forEach((t) => {
    const released = Number(t.escrow?.releasedVnd) || 0;
    switch (t.status) {
      case "ACTIVE":
        treatmentStatusRevenue["Đang điều trị"] += released;
        break;
      case "PAUSED":
        treatmentStatusRevenue["Tạm dừng"] += released;
        break;
      case "COMPLETED":
        treatmentStatusRevenue["Hoàn thành"] += released;
        break;
      case "CANCELLED":
        treatmentStatusRevenue["Đã hủy"] += released;
        break;
    }
  });

  const realTreatmentChartData = Object.entries(treatmentStatusRevenue).map(
    ([name, value]) => ({
      name,
      revenue: value,
    }),
  );

  const renderBookingStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 font-semibold text-amber-800"
          >
            Chờ khám
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="border-blue-300 bg-blue-50 font-semibold text-blue-800"
          >
            Đã xác nhận
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="border-purple-300 bg-purple-50 font-semibold text-purple-800"
          >
            Đang khám
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 font-semibold text-emerald-800"
          >
            Hoàn thành
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="border-rose-300 bg-rose-50 font-semibold text-rose-800"
          >
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const navCards = [
    {
      title: "Quản lý Chuyên gia",
      desc: "Xem danh sách bác sĩ thuộc phòng khám, khai báo thông tin & lịch làm việc",
      href: "/clinic/experts",
      icon: Users,
    },
    {
      title: "Lịch hẹn Tư vấn",
      desc: "Theo dõi lịch hẹn tư vấn của bệnh nhân & trạng thái giữ tiền Escrow",
      href: "/clinic/bookings",
      icon: Calendar,
    },
    {
      title: "Phác đồ Điều trị",
      desc: "Giám sát các phác đồ điều trị chuyên sâu, tiến độ giai đoạn & giải ngân Escrow",
      href: "/clinic/treatments",
      icon: FileText,
    },
    {
      title: "Ví & Ngân hàng",
      desc: "Kiểm tra số dư khả dụng, tiền tạm giữ Escrow & cấu hình tài khoản rút tiền",
      href: "/clinic/wallet",
      icon: Wallet,
    },
    {
      title: "Yêu cầu Rút tiền",
      desc: "Tạo đơn rút số dư khả dụng về ngân hàng & theo dõi tiến độ duyệt Admin",
      href: "/clinic/withdrawals",
      icon: Banknote,
    },
    {
      title: "Sao kê & Xuất CSV",
      desc: "Lịch sử biến động số dư chi tiết, tra cứu loại giao dịch & tải báo cáo CSV",
      href: "/clinic/statement",
      icon: ReceiptText,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Executive Page Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Bảng điều khiển Phòng khám
              </h1>
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 font-bold text-emerald-800"
              >
                Xác thực Clinic
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Xin chào,{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || user?.email}
              </span>{" "}
              (Mã PK:{" "}
              <code className="font-mono text-emerald-600 dark:text-emerald-400">
                {user?.clinicId || "N/A"}
              </code>
              )
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/clinic/experts">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              <UserPlus className="mr-1.5 h-4 w-4 text-emerald-600" /> Thêm
              Chuyên gia
            </Button>
          </Link>
          <Link href="/clinic/withdrawals">
            <Button
              size="sm"
              className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> Yêu cầu Rút tiền
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Số dư khả dụng
              </p>
              <p className="truncate font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isWalletLoading ? "..." : formatVnd(wallet?.balanceVnd)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tạm giữ (Escrow)
              </p>
              <p className="truncate font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isWalletLoading ? "..." : formatVnd(wallet?.heldEscrowVnd)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chờ duyệt rút
              </p>
              <p className="truncate font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isWalletLoading
                  ? "..."
                  : formatVnd(wallet?.pendingWithdrawalsVnd)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ca khám hoàn thành
              </p>
              <p className="truncate font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isBookingsLoading
                  ? "..."
                  : `${completedBookingsCount} / ${bookingsList.length}`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              <Stethoscope className="h-5 w-5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chuyên gia hoạt động
              </p>
              <p className="truncate font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isExpertsLoading
                  ? "..."
                  : `${activeExpertsCount} / ${expertsList.length}`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Visualizer Grid (100% Real API Data) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Real Consultation Bookings by Status */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-100 p-6 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Phân bổ Trạng thái Ca tư vấn
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Số lượng lịch hẹn tương ứng từng trạng thái xử lý hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isBookingsLoading ? (
              <div className="flex h-64 items-center justify-center text-xs text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />{" "}
                Đang tải phân bổ lịch hẹn...
              </div>
            ) : bookingsList.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400 italic">
                Chưa có ca tư vấn nào được khởi tạo.
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={realBookingStatusChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        borderColor: "#e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" name="Số ca hẹn" radius={[8, 8, 0, 0]}>
                      {realBookingStatusChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Real Treatment Released Revenue by Status */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-100 p-6 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Doanh thu Giải ngân Phác đồ
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Tổng tiền Escrow đã giải ngân từ các phác đồ theo trạng thái
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isTreatmentsLoading ? (
              <div className="flex h-64 items-center justify-center text-xs text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />{" "}
                Đang tải dữ liệu doanh thu phác đồ...
              </div>
            ) : treatmentsList.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400 italic">
                Chưa có dữ liệu phác đồ điều trị.
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={realTreatmentChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val / 1000000}M`}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={(val) => [
                        formatVnd(Number(val)),
                        "Đã giải ngân",
                      ]}
                      contentStyle={{
                        borderRadius: "16px",
                        borderColor: "#e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu giải ngân"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid Section: Live Recent Bookings Table + Active Doctors Roster */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Recent Bookings Table (2 Columns Span) */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ca khám & Tư vấn Gần nhất
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Cập nhật thời gian thực các ca hẹn vừa phát sinh
              </CardDescription>
            </div>
            <Link href="/clinic/bookings">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                Xem tất cả ({bookingsList.length}){" "}
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isBookingsLoading ? (
              <div className="flex h-48 items-center justify-center text-xs text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />{" "}
                Đang tải danh sách ca khám...
              </div>
            ) : bookingsList.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 italic">
                Chưa có lịch hẹn nào gần đây.
              </p>
            ) : (
              <div className="max-h-[350px] overflow-y-auto pr-1">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Mã ca hẹn
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Bệnh nhân
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Chuyên gia
                      </TableHead>

                      <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Thời gian
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Trạng thái
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsList.map((b) => (
                      <TableRow
                        key={b.id}
                        className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      >
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          #{b.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                          {b.customerName || "Bệnh nhân"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {b.expertName || "Bác sĩ"}
                        </TableCell>

                        <TableCell className="font-mono text-slate-500">
                          {formatDate(b.scheduledAt || b.createdAt)}
                        </TableCell>
                        <TableCell>
                          {renderBookingStatusBadge(b.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Experts Team Card (1 Column Span) */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Đội ngũ Chuyên gia
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Chuyên gia phụ trách phòng khám
              </CardDescription>
            </div>
            <Link href="/clinic/experts">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                Quản lý ({expertsList.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {isExpertsLoading ? (
              <div className="flex h-48 items-center justify-center text-xs text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />{" "}
                Đang tải danh sách bác sĩ...
              </div>
            ) : expertsList.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 italic">
                Chưa có chuyên gia nào được gán.
              </p>
            ) : (
              <div className="flex max-h-[350px] flex-col gap-3 overflow-y-auto pr-1">
                {expertsList.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {(exp.name || exp.user?.name || "BS")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                          {exp.name || exp.user?.name || "Bác sĩ"}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {SPECIALIZATION_MAP[exp.specialization] ||
                            exp.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {formatVnd(exp.consultationFee)}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          exp.isActive
                            ? "border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800"
                            : "border-slate-300 bg-slate-100 text-[10px] text-slate-600"
                        }
                      >
                        {exp.isActive ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
          Chức năng Quản lý chính
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card
                key={c.href}
                className="group overflow-hidden rounded-3xl border border-slate-200 transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <Link href={c.href}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </Link>
                  </div>
                  <CardTitle className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                    {c.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {c.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Link href={c.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      Truy cập ngay{" "}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
