"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Clock3,
  Headphones,
  MessageSquare,
  PackageCheck,
  PackagePlus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { useStaffDashboard } from "../hooks/useDashboard";
import type { DashboardRange } from "../types/dashboard.types";
import {
  DashboardEmptyPanel,
  DashboardError,
  DashboardLoading,
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSectionCard,
  formatChartDate,
  formatCurrency,
  formatDateTime,
} from "./dashboard-shell";

const supportChartConfig = {
  openedSupportSessions: { label: "Tạo mới", color: "#2563eb" },
  closedSupportSessions: { label: "Đã đóng", color: "#059669" },
} satisfies ChartConfig;

const stockChartConfig = {
  submittedStockForms: { label: "Trình duyệt", color: "#d97706" },
  confirmedStockForms: { label: "Đã xác nhận", color: "#7c3aed" },
} satisfies ChartConfig;

const shortcuts = [
  {
    href: "/staff/restock-desk",
    icon: PackageCheck,
    title: "Bàn kiểm hàng trả",
    description: "Kiểm kê và xác nhận nhập lại kho.",
  },
  {
    href: "/staff/stock-imports",
    icon: Boxes,
    title: "Phiếu nhập kho",
    description: "Tạo, trình duyệt và xác nhận phiếu nhập.",
  },
  {
    href: "/staff/support-chat",
    icon: MessageSquare,
    title: "Tổng đài hỗ trợ",
    description: "Tiếp nhận và xử lý chat khách hàng.",
  },
  {
    href: "/staff/catalog",
    icon: PackagePlus,
    title: "Onboard sản phẩm",
    description: "Thêm SKU và thông tin sản phẩm mới.",
  },
] as const;

export function StaffDashboardView() {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const query = useStaffDashboard(range);
  const data = query.data;

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Tổng quan vận hành Staff"
        description="Ưu tiên support, phiếu nhập và hàng hoàn trả bằng số liệu toàn hệ thống."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {query.isPending ? (
        <DashboardLoading cards={5} />
      ) : query.isError || !data ? (
        <DashboardError retry={() => void query.refetch()} />
      ) : (
        <>
          {data.metrics.failedWorkflows > 0 ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>
                {data.metrics.failedWorkflows} workflow hoàn trả cần kiểm tra
              </AlertTitle>
              <AlertDescription>
                Mở danh sách lỗi bên dưới hoặc vào bàn kiểm hàng trả để xử lý.
              </AlertDescription>
            </Alert>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <DashboardMetricCard
              icon={Clock3}
              label="Chat chưa được nhận"
              value={data.metrics.unassignedOpenSupport}
              href="/staff/support-chat"
            />
            <DashboardMetricCard
              icon={Headphones}
              label="Tôi đang hỗ trợ"
              value={data.metrics.myActiveSupport}
              href="/staff/support-chat"
            />
            <DashboardMetricCard
              icon={Boxes}
              label="Phiếu nhập chờ duyệt"
              value={data.metrics.submittedStockForms}
              href="/staff/stock-imports"
            />
            <DashboardMetricCard
              icon={PackageCheck}
              label="Hàng trả chờ kiểm"
              value={data.metrics.returnsReadyForInspection}
              href="/staff/restock-desk"
            />
            <DashboardMetricCard
              icon={AlertTriangle}
              label="Workflow lỗi"
              value={data.metrics.failedWorkflows}
              href="/staff/restock-desk"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardSectionCard
              title="Xu hướng support"
              description="Phiên tạo mới và đã đóng theo ngày"
            >
              <ChartContainer
                config={supportChartConfig}
                className="h-[270px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={data.trend.map((point) => ({
                    ...point,
                    label: formatChartDate(point.date),
                  }))}
                  margin={{ left: 0, right: 8, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={18}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="openedSupportSessions"
                    type="monotone"
                    stroke="var(--color-openedSupportSessions)"
                    fill="var(--color-openedSupportSessions)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="closedSupportSessions"
                    type="monotone"
                    stroke="var(--color-closedSupportSessions)"
                    fill="var(--color-closedSupportSessions)"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Xu hướng phiếu nhập"
              description="Phiếu trình duyệt và xác nhận theo ngày"
            >
              <ChartContainer
                config={stockChartConfig}
                className="h-[270px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={data.trend.map((point) => ({
                    ...point,
                    label: formatChartDate(point.date),
                  }))}
                  margin={{ left: 0, right: 8, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={18}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="submittedStockForms"
                    fill="var(--color-submittedStockForms)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="confirmedStockForms"
                    fill="var(--color-confirmedStockForms)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ChartContainer>
            </DashboardSectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <DashboardSectionCard
              title="Chat chờ lâu nhất"
              action={<QueueLink href="/staff/support-chat" />}
            >
              {data.queues.openSupportSessions.length === 0 ? (
                <DashboardEmptyPanel
                  title="Không có khách đang chờ"
                  description="Hàng đợi support hiện đã được xử lý hết."
                />
              ) : (
                <div className="divide-y">
                  {data.queues.openSupportSessions.map((item) => (
                    <QueueRow
                      key={item.id}
                      href="/staff/support-chat"
                      title={item.customerName || "Khách hàng"}
                      description={item.subject || "Không có chủ đề"}
                      meta={formatDateTime(item.waitingSince)}
                    />
                  ))}
                </div>
              )}
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Phiếu nhập chờ duyệt"
              action={<QueueLink href="/staff/stock-imports" />}
            >
              {data.queues.submittedStockForms.length === 0 ? (
                <DashboardEmptyPanel
                  title="Không có phiếu chờ duyệt"
                  description="Tất cả phiếu nhập đã được xử lý."
                />
              ) : (
                <div className="divide-y">
                  {data.queues.submittedStockForms.map((item) => (
                    <QueueRow
                      key={item.id}
                      href="/staff/stock-imports"
                      title={item.productName}
                      description={`${item.sku} · ${item.quantity} sản phẩm`}
                      meta={formatDateTime(item.submittedAt)}
                    />
                  ))}
                </div>
              )}
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Hàng trả sẵn sàng kiểm"
              action={<QueueLink href="/staff/restock-desk" />}
            >
              {data.queues.readyReturns.length === 0 ? (
                <DashboardEmptyPanel
                  title="Không có hàng trả chờ kiểm"
                  description="Chưa có kiện hoàn nào đã về kho."
                />
              ) : (
                <div className="divide-y">
                  {data.queues.readyReturns.map((item) => (
                    <QueueRow
                      key={item.id}
                      href="/staff/restock-desk"
                      title={`Đơn #${item.orderId.slice(0, 8)}`}
                      description={formatCurrency(item.refundAmountVnd)}
                      meta={formatDateTime(item.returnedAt)}
                    />
                  ))}
                </div>
              )}
            </DashboardSectionCard>
          </section>

          {data.queues.workflowFailures.length > 0 ? (
            <DashboardSectionCard
              title="Workflow cần can thiệp"
              description="Lỗi được sắp theo thời gian chờ lâu nhất"
              action={<QueueLink href="/staff/restock-desk" />}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.queues.workflowFailures.map((item) => (
                  <Link
                    key={item.id}
                    href="/staff/restock-desk"
                    className="border-destructive/30 hover:bg-destructive/5 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        Đơn #{item.orderId.slice(0, 8)}
                      </p>
                      <Badge variant="destructive">{item.status}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {item.lastError || "Workflow cần được kiểm tra thủ công"}
                    </p>
                  </Link>
                ))}
              </div>
            </DashboardSectionCard>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:border-primary/30 group rounded-xl border p-4 transition-colors"
              >
                <item.icon className="text-primary size-5" />
                <p className="mt-3 text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.description}
                </p>
                <span className="text-primary mt-3 flex items-center gap-1 text-xs font-medium">
                  Mở nghiệp vụ
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

function QueueLink({ href }: { href: string }) {
  return (
    <Button
      render={<Link href={href} />}
      nativeButton={false}
      variant="ghost"
      size="sm"
    >
      Xem tất cả <ArrowRight />
    </Button>
  );
}

function QueueRow({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-muted/50 block px-1 py-3 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {description}
          </p>
        </div>
        <p className="text-muted-foreground shrink-0 text-[11px]">{meta}</p>
      </div>
    </Link>
  );
}
