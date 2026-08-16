"use client";

import Link from "next/link";
import { CircleDollarSign, Percent } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { type ChartConfig } from "@/shared/components/ui/chart";
import {
  DashboardMetricCard,
  DashboardSectionCard,
  MoneyChart,
  formatCurrency,
} from "@/features/dashboard/components/dashboard-shell";
import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import {
  useAdminComboDiscount,
  useAdminPlatformCommission,
} from "@/features/admin/hooks/useAdminCommerce";

const commissionChartConfig = {
  platformCommissionRevenueVnd: {
    label: "Hoa hồng nền tảng",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

export function PlatformRevenueTab({ data }: { data: AdminDashboardResponse }) {
  const { data: commission } = useAdminPlatformCommission();
  const { data: combo } = useAdminComboDiscount();

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard
          icon={CircleDollarSign}
          label="Hoa hồng đã ghi nhận"
          value={formatCurrency(data.metrics.platformCommissionRevenueVnd)}
          hint="COMMISSION → PLATFORM_REVENUE"
        />
        <DashboardMetricCard
          icon={Percent}
          label="Tỷ lệ hoa hồng hiện tại"
          value={`${commission?.percent ?? "—"}%`}
          hint="Áp dụng cho thanh toán mới"
        />
        <DashboardMetricCard
          icon={Percent}
          label="Ưu đãi Combo AI"
          value={`${combo?.percent ?? "—"}%`}
          hint="Giảm giá khi mua trọn bộ"
        />
      </section>

      <DashboardSectionCard
        title="Cấu trúc tiền hàng"
        description="Từ giá trị trước giảm tới số thực thu"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Figure
            label="Giá trị trước giảm"
            value={data.metrics.grossProductSalesVnd}
          />
          <Figure label="Giảm giá" value={data.metrics.discountsVnd} />
          <Figure
            label="Phí vận chuyển"
            value={data.metrics.shippingCollectedVnd}
          />
          <Figure
            label="Thực thu"
            value={data.metrics.productPaymentsCollectedVnd}
          />
        </div>
      </DashboardSectionCard>

      <MoneyChart
        title="Hoa hồng theo ngày"
        description="Phần doanh thu thuộc về GlowScan"
        config={commissionChartConfig}
        data={data.trend}
        keys={["platformCommissionRevenueVnd"]}
        action={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/commerce" />}
            nativeButton={false}
          >
            Đổi tỷ lệ
          </Button>
        }
      />
    </div>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}
