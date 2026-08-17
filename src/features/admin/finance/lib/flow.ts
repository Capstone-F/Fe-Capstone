import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import type { MoneyFlow } from "../types/finance.types";

/**
 * Every term is period-scoped and server-computed. Commission is charged on
 * consultation AND treatment revenue, so subtracting it from a base containing
 * both balances; product revenue is correctly absent from both sides.
 * See spec §4 — this derivation was impossible in phase 1.
 */
export function buildMoneyFlow(
  metrics: AdminDashboardResponse["metrics"],
): MoneyFlow {
  const serviceRevenue =
    metrics.consultationFeesCollectedVnd +
    metrics.treatmentPaymentsCollectedVnd;
  const serviceRefunds =
    metrics.consultationRefundsVnd + metrics.treatmentRefundsVnd;

  return {
    productPaymentsVnd: metrics.productPaymentsCollectedVnd,
    consultationFeesVnd: metrics.consultationFeesCollectedVnd,
    treatmentPaymentsVnd: metrics.treatmentPaymentsCollectedVnd,
    inflowVnd: metrics.productPaymentsCollectedVnd + serviceRevenue,

    productRefundsVnd: metrics.productRefundsVnd,
    consultationRefundsVnd: metrics.consultationRefundsVnd,
    treatmentRefundsVnd: metrics.treatmentRefundsVnd,
    refundsOutVnd: metrics.productRefundsVnd + serviceRefunds,

    commissionRetainedVnd: metrics.platformCommissionRevenueVnd,

    clinicAccruedVnd:
      serviceRevenue - serviceRefunds - metrics.platformCommissionRevenueVnd,
  };
}
