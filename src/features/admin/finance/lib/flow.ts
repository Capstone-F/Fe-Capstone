import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import type { ClinicWithdrawalItem } from "@/features/admin/api/admin-clinic-withdrawals.api";
import type {
  OrderCancellation,
  OrderCancellationStatus,
} from "@/features/admin/cancellations/types/cancellation.types";
import type {
  MoneyFlow,
  RefundReconciliation,
  RefundTotals,
} from "../types/finance.types";
import { sumVnd } from "./money";

/**
 * The wallet credit lands by AWAITING_RETURN (verified in e2e/admin-api/REPORT.md,
 * TC-ADM-13), so REFUNDED and every later state count as money already out.
 */
export const REFUND_SETTLED_STATUSES: OrderCancellationStatus[] = [
  "REFUNDED",
  "AWAITING_RETURN",
  "RESTOCKED",
  "COMPLETED",
];

export const REFUND_IN_FLIGHT_STATUSES: OrderCancellationStatus[] = [
  "REQUESTED",
  "REFUNDING",
];

/**
 * NOTE: There is deliberately no clinic-payable output. See spec §5.4 —
 * commission is charged on treatment plan payments, which no admin metric reports.
 */
export function buildMoneyFlow(
  metrics: AdminDashboardResponse["metrics"],
  withdrawalsInRange: ClinicWithdrawalItem[],
): MoneyFlow {
  const byStatus = (status: ClinicWithdrawalItem["status"]) =>
    sumVnd(
      withdrawalsInRange.filter((item) => item.status === status),
      (item) => item.amountVnd,
    );

  return {
    productPaymentsVnd: metrics.productPaymentsCollectedVnd,
    consultationFeesVnd: metrics.consultationFeesCollectedVnd,
    inflowVnd:
      metrics.productPaymentsCollectedVnd +
      metrics.consultationFeesCollectedVnd,

    productRefundsVnd: metrics.productRefundsVnd,
    consultationRefundsVnd: metrics.consultationRefundsVnd,
    refundsOutVnd: metrics.productRefundsVnd + metrics.consultationRefundsVnd,

    commissionRetainedVnd: metrics.platformCommissionRevenueVnd,

    paidOutVnd: byStatus("PAID"),
    pendingPayoutVnd: byStatus("REQUESTED"),
    rejectedVnd: byStatus("REJECTED"),
  };
}

export function buildRefundTotals(
  cancellations: OrderCancellation[],
): RefundTotals {
  const sumWhere = (statuses: OrderCancellationStatus[]) =>
    sumVnd(
      cancellations.filter((item) => statuses.includes(item.status)),
      (item) => item.refundAmountVnd,
    );

  return {
    refundedOutVnd: sumWhere(REFUND_SETTLED_STATUSES),
    inFlightVnd: sumWhere(REFUND_IN_FLIGHT_STATUSES),
    stuckVnd: sumWhere(["FAILED"]),
  };
}

export function reconcileRefunds(
  dashboardRefundsVnd: number,
  cancellations: OrderCancellation[],
): RefundReconciliation {
  const cancellationRefundsVnd =
    buildRefundTotals(cancellations).refundedOutVnd;
  const differenceVnd = dashboardRefundsVnd - cancellationRefundsVnd;

  return {
    dashboardRefundsVnd,
    cancellationRefundsVnd,
    differenceVnd,
    agrees: Math.abs(differenceVnd) < 1,
  };
}
