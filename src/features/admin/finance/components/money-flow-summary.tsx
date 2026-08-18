"use client";

import { ArrowDownRight, ArrowUpRight, Building2, Wallet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DashboardSectionCard,
  formatCurrency,
} from "@/features/dashboard/components/dashboard-shell";
import type { FinanceTab, MoneyFlow } from "../types/finance.types";

export function MoneyFlowSummary({
  flow,
  onNavigate,
}: {
  flow: MoneyFlow;
  onNavigate: (tab: FinanceTab) => void;
}) {
  return (
    <DashboardSectionCard
      title="Dòng tiền trong kỳ"
      description="Tiền vào, tiền ra và phần nền tảng giữ lại"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FlowNode
          icon={ArrowUpRight}
          label="Khách thanh toán"
          value={flow.inflowVnd}
          hint="Sản phẩm + tư vấn + phác đồ"
        />
        <FlowNode
          icon={ArrowDownRight}
          label="Hoàn tiền"
          value={flow.refundsOutVnd}
          hint="Toàn bộ hoàn tiền trong kỳ"
          onClick={() => onNavigate("refunds")}
        />
        <FlowNode
          icon={Wallet}
          label="Hoa hồng nền tảng"
          value={flow.commissionRetainedVnd}
          hint="Phần GlowScan giữ lại"
          onClick={() => onNavigate("platform")}
        />
        <FlowNode
          icon={Building2}
          label="Về phòng khám"
          value={flow.clinicAccruedVnd}
          hint="Doanh thu dịch vụ sau hoàn tiền và hoa hồng"
          onClick={() => onNavigate("clinics")}
        />
      </div>
    </DashboardSectionCard>
  );
}

function FlowNode({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon?: typeof Wallet;
  label: string;
  value: number;
  hint?: string;
  onClick?: () => void;
}) {
  const body = (
    <span className="flex h-full flex-col rounded-xl border p-4 text-left">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </span>
      <span className="mt-2 text-xl font-semibold tracking-tight">
        {formatCurrency(value)}
      </span>
      {hint ? (
        <span className="text-muted-foreground mt-1 text-xs">{hint}</span>
      ) : null}
    </span>
  );

  if (!onClick) return body;

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full p-0 hover:bg-transparent"
    >
      <span className="hover:border-primary/40 block w-full rounded-xl transition-colors">
        {body}
      </span>
    </Button>
  );
}
