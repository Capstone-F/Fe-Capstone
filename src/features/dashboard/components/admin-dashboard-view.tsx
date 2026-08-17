"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartLegendContent,
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
  MoneyChart,
  formatChartDate,
  formatCurrency,
} from "./dashboard-shell";

const ecommerceChartConfig = {
  productPaymentsCollectedVnd: {
    label: "Tiền order đã thu",
    color: "#2563eb",
  },
  productRefundsVnd: { label: "Hoàn tiền sản phẩm", color: "#dc2626" },
} satisfies ChartConfig;

const serviceChartConfig = {
  consultationFeesCollectedVnd: {
    label: "Phí tư vấn đã thu",
    color: "#0d9488",
  },
  consultationRefundsVnd: {
    label: "Hoàn phí tư vấn",
    color: "#ea580c",
  },
  platformCommissionRevenueVnd: {
    label: "Hoa hồng nền tảng",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

const customerChartConfig = {
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
        description="Theo dõi nền tảng, thương mại điện tử và doanh thu hoa hồng bằng dữ liệu giao dịch thật."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {query.isPending ? (
        <DashboardLoading cards={9} />
      ) : query.isError || !data ? (
        <DashboardError retry={() => void query.refetch()} />
      ) : (
        <>
          <DashboardSectionCard
            title="Tổng quan nền tảng"
            description="Quy mô đang hoạt động trên toàn hệ thống"
          >
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
            </section>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Thương mại điện tử"
            description="Tiền order đã thanh toán; không phải lợi nhuận và không tính giá vốn"
          >
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardMetricCard
                icon={ShoppingBag}
                label="Đơn đã thanh toán"
                value={data.metrics.paidOrders}
                hint={`Trong ${range.replace("d", " ngày")}`}
                href="/dashboard/commerce"
              />
              <DashboardMetricCard
                icon={CircleDollarSign}
                label="Tổng tiền order đã thu"
                value={formatCurrency(data.metrics.productPaymentsCollectedVnd)}
                hint="Bao gồm vận chuyển, sau giảm giá"
                href="/dashboard/finance?tab=platform"
              />
              <DashboardMetricCard
                icon={RefreshCw}
                label="Hoàn tiền sản phẩm"
                value={formatCurrency(data.metrics.productRefundsVnd)}
                hint="Hiển thị riêng, không tạo net sales"
                href="/dashboard/finance?tab=refunds"
              />
              <DashboardMetricCard
                icon={ReceiptText}
                label="Giá trị thanh toán trung bình"
                value={formatCurrency(data.metrics.averageOrderValueVnd)}
                hint="Tiền đã thu / số order"
              />
            </section>
            <div className="bg-muted/20 mt-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-3">
              <Breakdown
                label="Giá trị sản phẩm trước giảm"
                value={data.metrics.grossProductSalesVnd}
              />
              <Breakdown label="Giảm giá" value={data.metrics.discountsVnd} />
              <Breakdown
                label="Phí vận chuyển đã thu"
                value={data.metrics.shippingCollectedVnd}
              />
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Dịch vụ và doanh thu nền tảng"
            description="Tách tiền khách thanh toán khỏi phần hoa hồng thực sự thuộc GlowScan"
          >
            <section className="grid gap-4 sm:grid-cols-3">
              <DashboardMetricCard
                icon={Banknote}
                label="Phí tư vấn đã thu"
                value={formatCurrency(
                  data.metrics.consultationFeesCollectedVnd,
                )}
                hint="Đang giữ hoặc chuyển cho clinic"
              />
              <DashboardMetricCard
                icon={RefreshCw}
                label="Hoàn phí tư vấn"
                value={formatCurrency(data.metrics.consultationRefundsVnd)}
              />
              <DashboardMetricCard
                icon={CircleDollarSign}
                label="Hoa hồng nền tảng đã ghi nhận"
                value={formatCurrency(
                  data.metrics.platformCommissionRevenueVnd,
                )}
                hint="COMMISSION → PLATFORM_REVENUE"
                href="/dashboard/finance?tab=platform"
              />
            </section>
          </DashboardSectionCard>

          <section className="grid gap-6 xl:grid-cols-2">
            <MoneyChart
              title="Dòng tiền ecommerce"
              description="Tiền order đã thu và hoàn tiền theo ngày"
              config={ecommerceChartConfig}
              data={data.trend}
              keys={["productPaymentsCollectedVnd", "productRefundsVnd"]}
            />
            <MoneyChart
              title="Dịch vụ và hoa hồng"
              description="Phí tư vấn, hoàn phí và hoa hồng theo ngày"
              config={serviceChartConfig}
              data={data.trend}
              keys={[
                "consultationFeesCollectedVnd",
                "consultationRefundsVnd",
                "platformCommissionRevenueVnd",
              ]}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
            <DashboardSectionCard
              title="Tăng trưởng khách hàng"
              description="Tài khoản customer mới theo ngày"
            >
              <ChartContainer
                config={customerChartConfig}
                className="h-[270px] w-full"
              >
                <BarChart
                  data={data.trend.map((point) => ({
                    ...point,
                    label: formatChartDate(point.date),
                  }))}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span>
                            {Number(value).toLocaleString("vi-VN")} khách hàng
                          </span>
                        )}
                      />
                    }
                  />
                  <Legend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="newCustomers"
                    fill="var(--color-newCustomers)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ChartContainer>
            </DashboardSectionCard>
            <AttentionPanel data={data.attention} />
          </section>

          <DashboardSectionCard
            title="Acquisition funnel"
            description="Mỗi phiên được tính tối đa một lần ở mỗi bước và phải đi đúng thứ tự"
          >
            {data.funnel.isPartial ? (
              <Alert className="mb-4">
                <AlertTriangle />
                <AlertTitle>Dữ liệu funnel chưa phủ toàn bộ kỳ</AlertTitle>
                <AlertDescription>
                  {data.funnel.availableFrom
                    ? `Tracking chỉ có từ ${data.funnel.availableFrom}. Dữ liệu trước ngày này không được giả lập.`
                    : "Tracking chưa ghi nhận event nào trong hệ thống."}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-3 md:grid-cols-4">
              {data.funnel.steps.map((step, index) => (
                <div
                  key={step.eventType}
                  className="bg-card relative rounded-xl border p-4"
                >
                  <p className="text-muted-foreground text-xs">
                    Bước {index + 1}
                  </p>
                  <p className="mt-1 font-medium">{step.label}</p>
                  <p className="mt-3 text-2xl font-semibold">
                    {step.sessions.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    phiên · {step.conversionFromPreviousPct}% từ bước trước
                  </p>
                </div>
              ))}
            </div>
          </DashboardSectionCard>

          <TopProducts products={data.topProducts} />

          <DashboardSectionCard
            title="Nhật ký hoạt động"
            description="Các thay đổi gần nhất trên toàn hệ thống"
          >
            <DashboardEmptyPanel
              title="Xem nhật ký đầy đủ"
              description="Hoạt động gần đây đã chuyển sang trang riêng, có bộ lọc theo loại và tìm kiếm."
              href="/dashboard/activity"
              action="Mở nhật ký hoạt động"
            />
          </DashboardSectionCard>
        </>
      )}
    </main>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}

function AttentionPanel({
  data,
}: {
  data: {
    submittedStockForms: number;
    openCancellations: number;
    failedWorkflows: number;
    expertsMissingProfile: number;
  };
}) {
  return (
    <DashboardSectionCard
      title="Cần xử lý"
      description="Các luồng đang chờ hoặc cần can thiệp"
    >
      <div className="space-y-2">
        <AttentionRow
          icon={PackageCheck}
          label="Phiếu nhập chờ duyệt"
          value={data.submittedStockForms}
          href="/dashboard/stock-imports"
        />
        <AttentionRow
          icon={RefreshCw}
          label="Luồng hủy/hoàn chưa xong"
          value={data.openCancellations}
          href="/dashboard/cancellations"
        />
        <AttentionRow
          icon={AlertTriangle}
          label="Workflow lỗi"
          value={data.failedWorkflows}
          href="/dashboard/cancellations"
          destructive={data.failedWorkflows > 0}
        />
        <AttentionRow
          icon={UserCheck}
          label="Expert thiếu hồ sơ"
          value={data.expertsMissingProfile}
          href="/dashboard/experts"
        />
      </div>
    </DashboardSectionCard>
  );
}

function TopProducts({
  products,
}: {
  products: Array<{
    productId: string;
    productVariantId: string;
    productName: string;
    sku: string;
    unitsSold: number;
    grossSalesVnd: number;
  }>;
}) {
  return (
    <DashboardSectionCard
      title="Sản phẩm nổi bật"
      description="Top 5 theo giá trị dòng hàng trước giảm giá"
    >
      {products.length === 0 ? (
        <DashboardEmptyPanel
          title="Chưa có sản phẩm bán ra"
          description="Không có order đã thanh toán trong kỳ này."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Đã bán</TableHead>
              <TableHead className="text-right">Giá trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productVariantId}>
                <TableCell>
                  <Link
                    href={`/dashboard/products?productId=${product.productId}`}
                    className="font-medium hover:underline"
                  >
                    {product.productName}
                  </Link>
                  <p className="text-muted-foreground text-xs">{product.sku}</p>
                </TableCell>
                <TableCell>{product.unitsSold}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.grossSalesVnd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardSectionCard>
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
