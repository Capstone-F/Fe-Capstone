import { describe, expect, it } from "vitest";
import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import { buildMoneyFlow } from "./flow";

const metrics: AdminDashboardResponse["metrics"] = {
  activeCustomers: 10,
  activeExperts: 4,
  activeClinics: 2,
  paidOrders: 8,
  grossProductSalesVnd: 1_000_000,
  discountsVnd: 100_000,
  shippingCollectedVnd: 50_000,
  productPaymentsCollectedVnd: 950_000,
  productRefundsVnd: 120_000,
  averageOrderValueVnd: 118_750,
  consultationFeesCollectedVnd: 600_000,
  consultationRefundsVnd: 50_000,
  treatmentPaymentsCollectedVnd: 400_000,
  treatmentRefundsVnd: 30_000,
  platformCommissionRevenueVnd: 90_000,
};

describe("buildMoneyFlow", () => {
  it("includes treatment payments in inflow", () => {
    // 950,000 + 600,000 + 400,000
    expect(buildMoneyFlow(metrics).inflowVnd).toBe(1_950_000);
  });

  it("includes treatment refunds in refunds out", () => {
    // 120,000 + 50,000 + 30,000
    expect(buildMoneyFlow(metrics).refundsOutVnd).toBe(200_000);
  });

  it("passes platform commission through as retained revenue", () => {
    expect(buildMoneyFlow(metrics).commissionRetainedVnd).toBe(90_000);
  });

  it("derives what is owed to clinics from both service revenue streams", () => {
    // (600,000 + 400,000) - (50,000 + 30,000) - 90,000
    expect(buildMoneyFlow(metrics).clinicAccruedVnd).toBe(830_000);
  });

  it("keeps the clinic payable non-negative on realistic inputs", () => {
    expect(buildMoneyFlow(metrics).clinicAccruedVnd).toBeGreaterThanOrEqual(0);
  });

  // What remains after paying clinics and taking commission is exactly the
  // platform's own product margin. If a later edit changes one term without the
  // others, this fails rather than the waterfall quietly ceasing to add up.
  it("satisfies the waterfall identity", () => {
    const flow = buildMoneyFlow(metrics);
    expect(
      flow.inflowVnd -
        flow.refundsOutVnd -
        flow.commissionRetainedVnd -
        flow.clinicAccruedVnd,
    ).toBe(metrics.productPaymentsCollectedVnd - metrics.productRefundsVnd);
  });
});
