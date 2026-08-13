"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useAdminDashboard } from "../hooks/useDashboard";
import type { DashboardRange } from "../types/dashboard.types";
import {
  DashboardEmptyPanel,
  DashboardError,
  DashboardLoading,
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSectionCard,
  formatChartDate,
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
} from "./dashboard-shell";

const chartConfig = {
  netProductRevenueVnd: { label: "Sản phẩm", color: "#2563eb" },
  netConsultationFeesVnd: { label: "Tư vấn", color: "#059669" },
  newCustomers: { label: "Khách hàng mới", color: "#d97706" },
} satisfies ChartConfig;

export function AdminDashboardView() {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const query = useAdminDashboard(range);
  const data = query.data;

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Tổng quan quản trị"
        description="Theo dõi sức khỏe nền tảng, dòng tiền và các luồng vận hành cần ưu tiên."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {query.isPending ? (
        <DashboardLoading />
      ) : query.isError || !data ? (
        <DashboardError retry={() => void query.refetch()} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DashboardMetricCard
              icon={Users}
              label="Khách hàng hoạt động"
              value={data.metrics.activeCustomers}
              href="/dashboard/users"
            />
            <DashboardMetricCard
              icon={UserCheck}
              label="Chuyên gia hoạt động"
              value={data.metrics.activeExperts}
              href="/dashboard/experts"
            />
            <DashboardMetricCard
              icon={Building2}
              label="Phòng khám hoạt động"
              value={data.metrics.activeClinics}
              href="/dashboard/clinics"
            />
            <DashboardMetricCard
              icon={ShoppingBag}
              label="Đơn đã thanh toán"
              value={data.metrics.paidOrders}
              hint={`Trong ${range.replace("d", " ngày")}`}
              href="/dashboard/commerce"
            />
            <DashboardMetricCard
              icon={CircleDollarSign}
              label="Doanh số sản phẩm ròng"
              value={formatCurrency(data.metrics.netProductRevenueVnd)}
              hint="Đã trừ hoàn tiền"
              href="/dashboard/commerce"
            />
            <DashboardMetricCard
              icon={Banknote}
              label="Phí tư vấn ròng"
              value={formatCurrency(data.metrics.netConsultationFeesVnd)}
              hint="Không gồm nạp ví"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
            <DashboardSectionCard
              title="Xu hướng hoạt động"
              description="Doanh số ròng và số khách hàng mới theo ngày"
            >
              <ChartContainer config={chartConfig} className="h-[310px] w-full">
                <ComposedChart
                  accessibilityLayer
                  data={data.trend.map((point) => ({
                    ...point,
                    label: formatChartDate(point.date),
                  }))}
                  margin={{ left: 4, right: 8, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    yAxisId="money"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                    width={56}
                  />
                  <YAxis
                    yAxisId="count"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <span>
                            {name === "newCustomers"
                              ? Number(value).toLocaleString("vi-VN")
                              : formatCurrency(Number(value))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Area
                    yAxisId="money"
                    dataKey="netProductRevenueVnd"
                    type="monotone"
                    stroke="var(--color-netProductRevenueVnd)"
                    fill="var(--color-netProductRevenueVnd)"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="money"
                    dataKey="netConsultationFeesVnd"
                    type="monotone"
                    stroke="var(--color-netConsultationFeesVnd)"
                    fill="var(--color-netConsultationFeesVnd)"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                  <Bar
                    yAxisId="count"
                    dataKey="newCustomers"
                    fill="var(--color-newCustomers)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </ComposedChart>
              </ChartContainer>
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Cần xử lý"
              description="Các luồng đang chờ hoặc cần can thiệp"
            >
              <div className="space-y-2">
                <AttentionRow
                  icon={PackageCheck}
                  label="Phiếu nhập chờ duyệt"
                  value={data.attention.submittedStockForms}
                  href="/dashboard/stock-imports"
                />
                <AttentionRow
                  icon={RefreshCw}
                  label="Luồng hủy/hoàn chưa xong"
                  value={data.attention.openCancellations}
                  href="/dashboard/cancellations"
                />
                <AttentionRow
                  icon={AlertTriangle}
                  label="Workflow lỗi"
                  value={data.attention.failedWorkflows}
                  href="/dashboard/cancellations"
                  destructive={data.attention.failedWorkflows > 0}
                />
                <AttentionRow
                  icon={UserCheck}
                  label="Expert thiếu hồ sơ"
                  value={data.attention.expertsMissingProfile}
                  href="/dashboard/experts"
                />
              </div>
            </DashboardSectionCard>
          </section>

          <DashboardSectionCard
            title="Hoạt động gần đây"
            description="Tối đa 10 thay đổi mới nhất trong kỳ đã chọn"
          >
            {data.recentActivity.length === 0 ? (
              <DashboardEmptyPanel
                title="Chưa có hoạt động"
                description="Không có sự kiện hệ thống nào trong kỳ này."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Chi tiết</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead className="text-right">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentActivity.map((activity) => (
                    <TableRow key={`${activity.type}-${activity.id}`}>
                      <TableCell>
                        <Badge variant="outline">{activity.title}</Badge>
                      </TableCell>
                      <TableCell className="max-w-72 truncate">
                        {activity.description || "—"}
                      </TableCell>
                      <TableCell>
                        {activity.amountVnd == null
                          ? "—"
                          : formatCurrency(activity.amountVnd)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDateTime(activity.occurredAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DashboardSectionCard>
        </>
      )}
    </main>
  );
}

function AttentionRow({
  icon: Icon,
  label,
  value,
  href,
  destructive = false,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: number;
  href: string;
  destructive?: boolean;
}) {
  return (
    <Button
      render={<Link href={href} />}
      nativeButton={false}
      variant="ghost"
      className="h-auto w-full justify-between px-3 py-3"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className={destructive ? "text-destructive" : "text-primary"} />
        <span className="truncate">{label}</span>
      </span>
      <Badge variant={destructive ? "destructive" : "secondary"}>{value}</Badge>
    </Button>
  );
}
