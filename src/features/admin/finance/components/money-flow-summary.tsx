"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DashboardSectionCard,
  formatCurrency,
} from "@/features/dashboard/components/dashboard-shell";
import type {
  FinanceTab,
  MoneyFlow,
  RefundReconciliation,
} from "../types/finance.types";

export function MoneyFlowSummary({
  flow,
  reconciliation,
  onNavigate,
}: {
  flow: MoneyFlow;
  reconciliation: RefundReconciliation;
  onNavigate: (tab: FinanceTab) => void;
}) {
  return (
    <DashboardSectionCard
      title="Dòng tiền trong kỳ"
      description="Tiền vào, tiền ra và phần nền tảng giữ lại"
    >
      {/* Block 1 — money in and where it went */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FlowNode
          icon={ArrowUpRight}
          label="Khách thanh toán"
          value={flow.inflowVnd}
          hint="Sản phẩm + tư vấn"
          partial
        />
        <FlowNode
          icon={ArrowDownRight}
          label="Hoàn tiền"
          value={flow.refundsOutVnd}
          hint="Sản phẩm + tư vấn"
          onClick={() => onNavigate("refunds")}
        />
        <FlowNode
          icon={Wallet}
          label="Hoa hồng nền tảng"
          value={flow.commissionRetainedVnd}
          hint="Phần GlowScan giữ lại"
          onClick={() => onNavigate("platform")}
        />
        <UnavailableNode />
      </div>

      {/* Block 2 — payouts, measured independently */}
      <div className="mt-4 rounded-xl border p-4">
        <p className="text-sm font-medium">Đã chuyển cho phòng khám</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Số đo độc lập, không phải phần chia của tiền vào ở trên.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <FlowNode
            label="Đã chi trả"
            value={flow.paidOutVnd}
            onClick={() => onNavigate("clinics")}
          />
          <FlowNode
            label="Chờ duyệt"
            value={flow.pendingPayoutVnd}
            onClick={() => onNavigate("clinics")}
          />
          <FlowNode
            label="Đã từ chối"
            value={flow.rejectedVnd}
            onClick={() => onNavigate("clinics")}
          />
        </div>
      </div>

      {/* Reconciliation */}
      <div className="bg-muted/20 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4">
        <div>
          <p className="text-sm font-medium">Đối soát hoàn tiền sản phẩm</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Dashboard: {formatCurrency(reconciliation.dashboardRefundsVnd)} · Từ
            luồng hủy đơn:{" "}
            {formatCurrency(reconciliation.cancellationRefundsVnd)}
          </p>
        </div>
        {reconciliation.agrees ? (
          <Badge variant="secondary">Khớp</Badge>
        ) : (
          <Badge variant="destructive">
            Lệch {formatCurrency(Math.abs(reconciliation.differenceVnd))}
          </Badge>
        )}
      </div>
    </DashboardSectionCard>
  );
}

function FlowNode({
  icon: Icon,
  label,
  value,
  hint,
  partial = false,
  onClick,
}: {
  icon?: typeof Wallet;
  label: string;
  value: number;
  hint?: string;
  partial?: boolean;
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
      {partial ? (
        <span className="text-muted-foreground mt-2 text-[11px] italic">
          Chưa gồm doanh thu phác đồ điều trị
        </span>
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

/**
 * Renders the hole where "owed to clinics" would go. See spec §5.4 — the figure is
 * not derivable, and an explicit unavailable state beats a wrong estimate.
 */
function UnavailableNode() {
  return (
    <div className="border-muted-foreground/30 flex h-full flex-col rounded-xl border border-dashed p-4">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <AlertTriangle className="size-3.5" />
        Về phòng khám
      </span>
      <span className="text-muted-foreground mt-2 text-sm">Chưa tính được</span>
      <span className="text-muted-foreground mt-1 text-[11px]">
        Hoa hồng tính cả trên phác đồ, nhưng doanh thu phác đồ không có trong
        metric nào. Cần API <code>/admin/clinics/balances</code>.
      </span>
    </div>
  );
}
