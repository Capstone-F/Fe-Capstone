"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Star,
  Stethoscope,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { useExpertDashboard } from "../hooks/useDashboard";
import type {
  DashboardRange,
  ExpertBookingQueueItem,
} from "../types/dashboard.types";
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
  completedConsultations: { label: "Ca hoàn tất", color: "#7c3aed" },
  netConsultationFeesVnd: { label: "Phí đã thu", color: "#059669" },
} satisfies ChartConfig;

export function ExpertOverviewView() {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const query = useExpertDashboard(range);
  const data = query.data;

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Tổng quan chuyên gia"
        description="Nắm lịch tư vấn, theo dõi hiệu suất và ưu tiên các ca đang chờ xác nhận."
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
              icon={CalendarCheck}
              label="Lịch hôm nay"
              value={data.metrics.appointmentsToday}
              href="/expert/consultations"
            />
            <DashboardMetricCard
              icon={Clock3}
              label="Chờ xác nhận"
              value={data.metrics.paidPendingConfirmation}
              hint="Đã trả phí hoặc tái khám"
              href="/expert/consultations"
            />
            <DashboardMetricCard
              icon={CheckCircle2}
              label="Ca hoàn tất"
              value={data.metrics.completedConsultations}
              hint={`Trong ${range.replace("d", " ngày")}`}
              href="/expert/consultations"
            />
            <DashboardMetricCard
              icon={RefreshCw}
              label="Ca tái khám"
              value={data.metrics.followUpConsultations}
              href="/expert/consultations"
            />
            <DashboardMetricCard
              icon={Banknote}
              label="Phí tư vấn đã thu ròng"
              value={formatCurrency(data.metrics.netConsultationFeesVnd)}
              hint="Không phải thu nhập quyết toán"
            />
            <DashboardMetricCard
              icon={Star}
              label="Đánh giá trung bình"
              value={`${data.metrics.averageRating.toFixed(1)} / 5`}
              hint={`${data.metrics.ratingCount} lượt đánh giá`}
            />
          </section>

          <DashboardSectionCard
            title="Hiệu suất tư vấn"
            description="Số ca hoàn tất và phí tư vấn ròng theo ngày"
          >
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
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
                  yAxisId="fees"
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  yAxisId="fees"
                  dataKey="netConsultationFeesVnd"
                  type="monotone"
                  stroke="var(--color-netConsultationFeesVnd)"
                  fill="var(--color-netConsultationFeesVnd)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  yAxisId="count"
                  dataKey="completedConsultations"
                  type="monotone"
                  stroke="var(--color-completedConsultations)"
                  fill="var(--color-completedConsultations)"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </DashboardSectionCard>

          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardSectionCard
              title="Ca cần xác nhận"
              description="Các lịch đã đủ điều kiện để chuyên gia duyệt"
              action={
                <Button
                  render={<Link href="/expert/consultations" />}
                  nativeButton={false}
                  size="sm"
                  variant="ghost"
                >
                  Xem tất cả <ArrowRight />
                </Button>
              }
            >
              <BookingQueue
                items={data.pendingConfirmation}
                emptyTitle="Không có ca chờ xác nhận"
              />
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Lịch sắp tới"
              description="Năm ca đã xác nhận gần nhất"
              action={
                <Button
                  render={<Link href="/expert/schedule" />}
                  nativeButton={false}
                  size="sm"
                  variant="ghost"
                >
                  Xem lịch <ArrowRight />
                </Button>
              }
            >
              <BookingQueue
                items={data.upcomingBookings}
                emptyTitle="Chưa có lịch sắp tới"
              />
            </DashboardSectionCard>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <QuickAction
              href="/expert/consultations"
              icon={Stethoscope}
              title="Quản lý ca tư vấn"
            />
            <QuickAction
              href="/expert/treatments"
              icon={FileText}
              title="Phác đồ điều trị"
            />
            <QuickAction
              href="/expert/schedule"
              icon={CalendarCheck}
              title="Lịch khám & slots"
            />
          </section>
        </>
      )}
    </main>
  );
}

function BookingQueue({
  items,
  emptyTitle,
}: {
  items: ExpertBookingQueueItem[];
  emptyTitle: string;
}) {
  if (items.length === 0) {
    return (
      <DashboardEmptyPanel
        title={emptyTitle}
        description="Danh sách sẽ tự cập nhật khi có lịch phù hợp."
      />
    );
  }
  return (
    <div className="divide-y">
      {items.map((item) => (
        <Link
          key={item.id}
          href="/expert/consultations"
          className="hover:bg-muted/50 flex items-center justify-between gap-3 px-1 py-3 transition-colors"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium">
                {item.customerName || "Khách hàng chưa cập nhật tên"}
              </p>
              {item.isFollowUp ? (
                <Badge variant="outline">Tái khám</Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {item.reason || "Không ghi nhận lý do"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium">
              {formatDateTime(item.scheduledAt)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCurrency(item.feeChargedVnd)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
}: {
  href: string;
  icon: typeof Stethoscope;
  title: string;
}) {
  return (
    <Button
      render={<Link href={href} />}
      nativeButton={false}
      variant="outline"
      className="h-auto justify-between px-4 py-4"
    >
      <span className="flex items-center gap-2">
        <Icon className="text-primary" /> {title}
      </span>
      <ArrowRight />
    </Button>
  );
}
