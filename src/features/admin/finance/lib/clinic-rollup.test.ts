import { describe, expect, it } from "vitest";
import type { ClinicWithdrawalItem } from "@/features/admin/api/admin-clinic-withdrawals.api";
import {
  filterWithdrawalsByRange,
  rollupByClinic,
  withdrawalDateFor,
} from "./clinic-rollup";

function withdrawal(
  overrides: Partial<ClinicWithdrawalItem> &
    Pick<ClinicWithdrawalItem, "id" | "status" | "amountVnd">,
): ClinicWithdrawalItem {
  return {
    clinicId: "clinic-1",
    clinicName: null,
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
    createdAt: "2026-08-01T03:00:00.000Z",
    updatedAt: "2026-08-01T03:00:00.000Z",
    ...overrides,
  };
}

describe("withdrawalDateFor", () => {
  it("dates a settled row by processedAt — when the money actually moved", () => {
    const item = withdrawal({
      id: "w1",
      status: "PAID",
      amountVnd: "1000",
      createdAt: "2026-08-01T03:00:00.000Z",
      processedAt: "2026-08-05T03:00:00.000Z",
    });
    expect(withdrawalDateFor(item)).toBe("2026-08-05T03:00:00.000Z");
  });

  it("dates an open row by createdAt, since it has no processedAt", () => {
    const item = withdrawal({
      id: "w2",
      status: "REQUESTED",
      amountVnd: "1000",
    });
    expect(withdrawalDateFor(item)).toBe("2026-08-01T03:00:00.000Z");
  });

  it("falls back to createdAt when a settled row is missing processedAt", () => {
    const item = withdrawal({ id: "w3", status: "PAID", amountVnd: "1000" });
    expect(withdrawalDateFor(item)).toBe("2026-08-01T03:00:00.000Z");
  });
});

describe("filterWithdrawalsByRange", () => {
  // Boundaries are interpreted in Asia/Ho_Chi_Minh (+07:00) to match the
  // server-computed period the dashboard returns.
  const items = [
    withdrawal({
      id: "before",
      status: "PAID",
      amountVnd: "1000",
      processedAt: "2026-07-31T16:00:00.000Z", // 2026-08-01T00:00 +07 — inside
    }),
    withdrawal({
      id: "outside",
      status: "PAID",
      amountVnd: "1000",
      processedAt: "2026-07-31T15:59:00.000Z", // 2026-07-31T23:59 +07 — outside
    }),
    withdrawal({
      id: "inside",
      status: "PAID",
      amountVnd: "1000",
      processedAt: "2026-08-03T03:00:00.000Z",
    }),
  ];

  it("includes rows on the from-boundary in Vietnam time", () => {
    const result = filterWithdrawalsByRange(items, "2026-08-01", "2026-08-05");
    expect(result.map((item) => item.id).sort()).toEqual(["before", "inside"]);
  });

  it("excludes rows falling before the from-boundary", () => {
    const result = filterWithdrawalsByRange(items, "2026-08-01", "2026-08-05");
    expect(result.map((item) => item.id)).not.toContain("outside");
  });
});

describe("rollupByClinic", () => {
  const items = [
    withdrawal({
      id: "w1",
      clinicId: "c1",
      status: "PAID",
      amountVnd: "300000",
      processedAt: "2026-08-02T03:00:00.000Z",
    }),
    withdrawal({
      id: "w2",
      clinicId: "c1",
      status: "PAID",
      amountVnd: "100000",
      processedAt: "2026-08-09T03:00:00.000Z",
    }),
    withdrawal({
      id: "w3",
      clinicId: "c1",
      status: "REQUESTED",
      amountVnd: "70000",
    }),
    withdrawal({
      id: "w4",
      clinicId: "c2",
      status: "REJECTED",
      amountVnd: "20000",
    }),
  ];
  const names = new Map([["c1", "Phòng khám Quận 1"]]);

  it("groups rows by clinic and totals each status", () => {
    const rows = rollupByClinic(items, names);
    const c1 = rows.find((row) => row.clinicId === "c1");
    expect(c1).toMatchObject({
      requestCount: 3,
      paidVnd: 400_000,
      pendingVnd: 70_000,
      rejectedVnd: 0,
    });
  });

  it("reports the most recent payout date per clinic", () => {
    const rows = rollupByClinic(items, names);
    expect(rows.find((row) => row.clinicId === "c1")?.lastPaidAt).toBe(
      "2026-08-09T03:00:00.000Z",
    );
  });

  it("keeps a clinic that has only rejected rows, with a null last payout", () => {
    const rows = rollupByClinic(items, names);
    const c2 = rows.find((row) => row.clinicId === "c2");
    expect(c2).toMatchObject({
      rejectedVnd: 20_000,
      paidVnd: 0,
      lastPaidAt: null,
    });
  });

  it("falls back to a shortened id when no name is known", () => {
    const rows = rollupByClinic(items, names);
    expect(rows.find((row) => row.clinicId === "c2")?.clinicName).toBe("#c2");
  });

  it("sorts clinics by paid amount, largest first", () => {
    const rows = rollupByClinic(items, names);
    expect(rows[0].clinicId).toBe("c1");
  });
});
