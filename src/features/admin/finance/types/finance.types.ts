/**
 * WHAT: Shared shapes for the admin finance page.
 * WHY: `MoneyFlow` deliberately has NO clinic-payable field — see
 *      docs/superpowers/specs/2026-08-16-admin-finance-visibility-design.md §5.4.
 *      Platform commission is charged on treatment plan payments, but no admin
 *      metric exposes treatment revenue, so "owed to clinics" is not derivable.
 */

export type FinanceTab = "clinics" | "refunds" | "platform";

export interface MoneyFlow {
  /** Products + consultations only. Excludes treatment plan revenue (§5.4). */
  inflowVnd: number;
  productPaymentsVnd: number;
  consultationFeesVnd: number;

  refundsOutVnd: number;
  productRefundsVnd: number;
  consultationRefundsVnd: number;

  commissionRetainedVnd: number;

  /** Measured independently — NOT a split of inflow. */
  paidOutVnd: number;
  pendingPayoutVnd: number;
  rejectedVnd: number;
}

export interface RefundTotals {
  refundedOutVnd: number;
  inFlightVnd: number;
  stuckVnd: number;
}

export interface RefundReconciliation {
  dashboardRefundsVnd: number;
  cancellationRefundsVnd: number;
  differenceVnd: number;
  agrees: boolean;
}

export interface ClinicPayoutRollup {
  clinicId: string;
  clinicName: string;
  requestCount: number;
  paidVnd: number;
  pendingVnd: number;
  rejectedVnd: number;
  lastPaidAt: string | null;
}

export interface BoundedFetchResult<T> {
  items: T[];
  /** True when the server reported more rows than the cap allowed us to fetch. */
  truncated: boolean;
  cap: number;
}
