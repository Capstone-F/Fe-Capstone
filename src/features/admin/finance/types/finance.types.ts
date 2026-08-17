/**
 * WHAT: Shared shapes for the admin finance page.
 * WHY: `clinicAccruedVnd` is derivable as of phase 2 — the dashboard now reports
 *      treatment revenue, so commission (charged on consultation AND treatment)
 *      can be subtracted from a base that contains both. See
 *      docs/superpowers/specs/2026-08-17-admin-finance-phase2-design.md §4.
 */

export type FinanceTab = "clinics" | "refunds" | "platform";

export interface MoneyFlow {
  inflowVnd: number;
  productPaymentsVnd: number;
  consultationFeesVnd: number;
  treatmentPaymentsVnd: number;

  refundsOutVnd: number;
  productRefundsVnd: number;
  consultationRefundsVnd: number;
  treatmentRefundsVnd: number;

  commissionRetainedVnd: number;

  /** Owed to clinics for the period. Derivable as of phase 2 — see §4. */
  clinicAccruedVnd: number;
}
