import { describe, expect, it } from "vitest";
import type { TransactionStatus, TransactionType } from "../types/ledger.types";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
  transactionTypeBadgeVariant,
  transactionTypeLabel,
} from "./transaction-meta";

const ALL_TYPES: TransactionType[] = [
  "PRODUCT_PURCHASE",
  "CONSULTATION_PAYMENT",
  "TREATMENT_PLAN_PAYMENT",
  "WALLET_TOPUP",
  "REFUND",
  "WITHDRAWAL",
  "WITHDRAWAL_REVERSAL",
  "ESCROW_RELEASE",
  "COMMISSION",
];

const ALL_STATUSES: TransactionStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
];

describe("transaction-meta", () => {
  it("labels every one of the nine transaction types", () => {
    for (const type of ALL_TYPES) {
      expect(TRANSACTION_TYPE_LABELS[type]).toBeTruthy();
    }
    expect(Object.keys(TRANSACTION_TYPE_LABELS)).toHaveLength(ALL_TYPES.length);
  });

  it("labels every transaction status", () => {
    for (const status of ALL_STATUSES) {
      expect(TRANSACTION_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("falls back to the raw value for an unknown type", () => {
    expect(transactionTypeLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });

  it("gives a known type its Vietnamese label", () => {
    expect(transactionTypeLabel("COMMISSION")).toBe("Hoa hồng sàn");
  });

  it("uses the destructive variant for money leaving the platform", () => {
    expect(transactionTypeBadgeVariant("REFUND")).toBe("destructive");
    expect(transactionTypeBadgeVariant("WITHDRAWAL")).toBe("destructive");
  });

  it("falls back to outline for an unknown type", () => {
    expect(transactionTypeBadgeVariant("SOMETHING_NEW")).toBe("outline");
  });
});
