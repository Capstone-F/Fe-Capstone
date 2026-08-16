import { describe, expect, it } from "vitest";
import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import type { ClinicWithdrawalItem } from "@/features/admin/api/admin-clinic-withdrawals.api";
import type { OrderCancellation } from "@/features/admin/cancellations/types/cancellation.types";
import { buildMoneyFlow, buildRefundTotals, reconcileRefunds } from "./flow";

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
  platformCommissionRevenueVnd: 90_000,
};

function withdrawal(
  overrides: Partial<ClinicWithdrawalItem> &
    Pick<ClinicWithdrawalItem, "id" | "status" | "amountVnd">,
): ClinicWithdrawalItem {
  return {
    clinicId: "clinic-1",
    clinicName: "Phòng khám 1",
    requestedByUserId: "user-1",
    bankName: "VCB",
    bankAccountNumber: "001",
    bankAccountHolder: "PK 1",
    processedByUserId: null,
    processedAt: null,
    transferRef: null,
    staffNote: null,
    debitTransactionId: null,
    refundTransactionId: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function cancellation(
  status: OrderCancellation["status"],
  refundAmountVnd: number,
): OrderCancellation {
  return {
    id: `c-${status}-${refundAmountVnd}`,
    orderId: "order-1",
    status,
    refundAmountVnd,
    requiresStockReturn: false,
    items: [],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };
}

describe("buildMoneyFlow", () => {
  const withdrawals = [
    withdrawal({ id: "w1", status: "PAID", amountVnd: "300000" }),
    withdrawal({ id: "w2", status: "PAID", amountVnd: "100000" }),
    withdrawal({ id: "w3", status: "REQUESTED", amountVnd: "70000" }),
    withdrawal({ id: "w4", status: "REJECTED", amountVnd: "20000" }),
  ];

  it("sums inflow from product and consultation collections", () => {
    expect(buildMoneyFlow(metrics, withdrawals).inflowVnd).toBe(1_550_000);
  });

  it("sums refunds out from both product and consultation refunds", () => {
    expect(buildMoneyFlow(metrics, withdrawals).refundsOutVnd).toBe(170_000);
  });

  it("passes platform commission through as retained revenue", () => {
    expect(buildMoneyFlow(metrics, withdrawals).commissionRetainedVnd).toBe(
      90_000,
    );
  });

  it("totals withdrawals by status", () => {
    const flow = buildMoneyFlow(metrics, withdrawals);
    expect(flow.paidOutVnd).toBe(400_000);
    expect(flow.pendingPayoutVnd).toBe(70_000);
    expect(flow.rejectedVnd).toBe(20_000);
  });

  // REGRESSION GUARD — see spec §5.4. Platform commission is charged on treatment
  // plan payments, but no admin metric exposes treatment revenue, so any
  // "owed to clinics" figure derived from these metrics is arithmetically wrong.
  it("exposes no clinic-payable figure", () => {
    const flow = buildMoneyFlow(metrics, withdrawals);
    const forbidden = Object.keys(flow).filter((key) =>
      /accrued|payable|owed|unwithdrawn/i.test(key),
    );
    expect(forbidden).toEqual([]);
  });
});

describe("buildRefundTotals", () => {
  const cancellations = [
    cancellation("REQUESTED", 10_000),
    cancellation("REFUNDING", 20_000),
    cancellation("REFUNDED", 30_000),
    cancellation("AWAITING_RETURN", 40_000),
    cancellation("RESTOCKED", 50_000),
    cancellation("COMPLETED", 60_000),
    cancellation("FAILED", 70_000),
  ];

  it("counts REFUNDED and every later state as money that has left", () => {
    expect(buildRefundTotals(cancellations).refundedOutVnd).toBe(180_000);
  });

  it("counts REQUESTED and REFUNDING as in flight", () => {
    expect(buildRefundTotals(cancellations).inFlightVnd).toBe(30_000);
  });

  it("counts FAILED separately as stuck", () => {
    expect(buildRefundTotals(cancellations).stuckVnd).toBe(70_000);
  });
});

describe("reconcileRefunds", () => {
  it("agrees when the two sources match", () => {
    const result = reconcileRefunds(30_000, [cancellation("REFUNDED", 30_000)]);
    expect(result.agrees).toBe(true);
    expect(result.differenceVnd).toBe(0);
  });

  it("flags divergence and reports the signed difference", () => {
    const result = reconcileRefunds(50_000, [cancellation("REFUNDED", 30_000)]);
    expect(result.agrees).toBe(false);
    expect(result.differenceVnd).toBe(20_000);
  });
});
