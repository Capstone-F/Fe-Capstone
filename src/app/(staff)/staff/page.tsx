"use client";

import React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Boxes,
  Clock,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  PackagePlus,
  ShieldCheck,
} from "lucide-react";

import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";
import { StaffMetricCard } from "@/features/staff/components/staff-metric-card";
import {
  buildStockStatusBreakdown,
  buildSupportSessionTrend,
  isSeriesEmpty,
} from "@/features/staff/lib/overview-metrics";
import { useStockImportForms } from "@/features/stock/hooks/useStock";
import { useSupportSessions } from "@/features/support/hooks/useSupport";
import { StockImportFormStatus } from "@/features/stock/types/stock.types";
import { SupportSessionStatus } from "@/features/support/types/support.types";

/** Charts sample the most recent records; no analytics endpoint exists yet. */
const CHART_SAMPLE_SIZE = 100;
const SUPPORT_TREND_DAYS = 14;

/**
 * Single-series hues, validated against light and dark chart surfaces
 * (lightness band, chroma floor, CVD separation, 3:1 contrast).
 */
const stockChartConfig = {
  count: { label: "Số phiếu", color: "#059669" },
} satisfies ChartConfig;

const supportChartConfig = {
  count: { label: "Phiên hỗ trợ", color: "#3b82f6" },
} satisfies ChartConfig;

const shortcuts = [
  {
    href: "/staff/restock-desk",
    icon: PackageCheck,
    title: "Bàn Kiểm Hàng Trả",
    description:
      "Kiểm kê sản phẩm từ đơn hủy, phân loại hàng tốt/hỏng và xác nhận nhập lại kho.",
    cta: "Bàn kiểm kho",
    primary: true,
  },
  {
    href: "/staff/stock-imports",
    icon: Boxes,
    title: "Phiếu Nhập Kho",
    description:
      "Tạo bản nháp, trình duyệt, xác nhận cộng kho thực tế hoặc hủy/từ chối phiếu nhập.",
    cta: "Quản lý kho hàng",
    primary: false,
  },
  {
    href: "/staff/support-chat",
    icon: MessageSquare,
    title: "Tổng Đài Support Chat 1-1",
    description:
      "Tiếp nhận phiên hỗ trợ khách hàng, giải đáp thắc mắc đơn hàng và sản phẩm.",
    cta: "Mở tổng đài Support",
    primary: false,
  },
  {
    href: "/staff/catalog",
    icon: PackagePlus,
    title: "Onboard Sản Phẩm Mới",
    description:
      "Khai báo SKU sản phẩm mới, cập nhật hình ảnh biến thể và danh mục thành phần mỹ phẩm.",
    cta: "Onboard SKU mới",
    primary: false,
  },
] as const;

export default function StaffDashboardPage() {
  const { data: stockData, isPending: isStockPending } = useStockImportForms({
    limit: CHART_SAMPLE_SIZE,
  });
  const { data: supportData, isPending: isSupportPending } = useSupportSessions(
    { limit: CHART_SAMPLE_SIZE },
  );

  const stockForms = React.useMemo(() => stockData?.items ?? [], [stockData]);
  const supportSessions = React.useMemo(
    () => supportData?.items ?? [],
    [supportData],
  );

  const pendingDraftCount = stockForms.filter(
    (form) => form.status === StockImportFormStatus.DRAFT,
  ).length;
  const submittedCount = stockForms.filter(
    (form) => form.status === StockImportFormStatus.SUBMITTED,
  ).length;
  const openChatCount = supportSessions.filter(
    (session) => session.status === SupportSessionStatus.OPEN,
  ).length;
  const activeChatCount = supportSessions.filter(
    (session) => session.status === SupportSessionStatus.ACTIVE,
  ).length;

  const stockBreakdown = React.useMemo(
    () => buildStockStatusBreakdown(stockForms),
    [stockForms],
  );
  // Recomputed per fetch; day-granularity so the exact instant does not matter.
  const supportTrend = React.useMemo(
    () =>
      buildSupportSessionTrend(supportSessions, new Date(), SUPPORT_TREND_DAYS),
    [supportSessions],
  );
  const supportTrendTotal = supportTrend.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={LayoutDashboard}
        title="Bảng Điều Khiển Vận Hành & Hỗ Trợ Nhân Viên"
        description="Hệ thống quản lý phiếu nhập kho e-commerce và tổng đài chat hỗ trợ khách hàng 1-1."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaffMetricCard
          icon={Clock}
          tone="amber"
          label="Phiên chat chờ tiếp nhận"
          value={openChatCount}
          hint="Khách hàng đang chờ tư vấn"
        />
        <StaffMetricCard
          icon={Headphones}
          tone="emerald"
          label="Phiên chat đang hỗ trợ"
          value={activeChatCount}
          hint="Đang trò chuyện 1-1 với khách"
        />
        <StaffMetricCard
          icon={Boxes}
          tone="blue"
          label="Phiếu nhập chờ duyệt"
          value={submittedCount}
          hint="Phiếu ở trạng thái Chờ duyệt"
        />
        <StaffMetricCard
          icon={ShieldCheck}
          tone="purple"
          label="Phiếu nháp đang tạo"
          value={pendingDraftCount}
          hint="Phiếu ở trạng thái Bản nháp"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Phiếu nhập kho theo trạng thái
            </CardTitle>
            <CardDescription className="text-xs">
              {CHART_SAMPLE_SIZE} phiếu gần nhất, tổng {stockForms.length} phiếu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStockPending ? (
              <Skeleton className="h-[240px] w-full rounded-xl" />
            ) : isSeriesEmpty(stockBreakdown) ? (
              <EmptyState
                icon={Boxes}
                title="Chưa có phiếu nhập kho nào"
                description="Tạo phiếu nhập đầu tiên để bắt đầu theo dõi số liệu."
                action={{
                  label: "Tạo phiếu nhập",
                  href: "/staff/stock-imports",
                }}
                className="h-[240px] justify-center p-6"
              />
            ) : (
              <ChartContainer
                config={stockChartConfig}
                className="aspect-auto h-[240px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={stockBreakdown}
                  layout="vertical"
                  margin={{ left: 4, right: 32 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="count" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    width={96}
                    tickMargin={4}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                    barSize={18}
                  >
                    {/* Direct labels double as the table view for these 5 bars. */}
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={8}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Phiên hỗ trợ tạo mới
            </CardTitle>
            <CardDescription className="text-xs">
              {SUPPORT_TREND_DAYS} ngày gần nhất — tổng {supportTrendTotal}{" "}
              phiên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSupportPending ? (
              <Skeleton className="h-[240px] w-full rounded-xl" />
            ) : isSeriesEmpty(supportTrend) ? (
              <EmptyState
                icon={MessageSquare}
                title="Chưa có phiên hỗ trợ nào"
                description={`Không có phiên chat nào được tạo trong ${SUPPORT_TREND_DAYS} ngày qua.`}
                className="h-[240px] justify-center p-6"
              />
            ) : (
              <ChartContainer
                config={supportChartConfig}
                className="aspect-auto h-[240px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={supportTrend}
                  margin={{ left: 4, right: 12, top: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="staff-support-trend-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-count)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-count)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={16}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="count"
                    type="monotone"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    fill="url(#staff-support-trend-fill)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <Card
            key={shortcut.href}
            className="flex flex-col justify-between rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <shortcut.icon className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
                {shortcut.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {shortcut.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href={shortcut.href}
                className={buttonVariants({
                  variant: shortcut.primary ? "default" : "outline",
                  className: shortcut.primary
                    ? "w-full gap-2 rounded-xl bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                    : "w-full gap-2 rounded-xl",
                })}
              >
                {shortcut.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
