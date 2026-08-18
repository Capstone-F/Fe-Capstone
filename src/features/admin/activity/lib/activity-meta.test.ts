import { describe, expect, it } from "vitest";
import type { AdminActivityType } from "../types/activity.types";
import {
  ACTIVITY_TYPE_LABELS,
  activityMetaFor,
  activityTypeLabel,
} from "./activity-meta";

const ALL_TYPES: AdminActivityType[] = [
  "USER_CREATED",
  "PRODUCT_PAYMENT",
  "CONSULTATION_PAYMENT",
  "TREATMENT_PLAN_PAYMENT",
  "REFUND",
  "ORDER_CANCELLATION",
  "STOCK_IMPORT",
  "WITHDRAWAL_REQUESTED",
  "WITHDRAWAL_PAID",
  "WITHDRAWAL_REJECTED",
];

describe("activity-meta", () => {
  it("labels every one of the ten published activity types", () => {
    for (const type of ALL_TYPES) {
      expect(ACTIVITY_TYPE_LABELS[type]).toBeTruthy();
    }
    expect(Object.keys(ACTIVITY_TYPE_LABELS)).toHaveLength(ALL_TYPES.length);
  });

  it("gives every published type an icon and a link", () => {
    for (const type of ALL_TYPES) {
      const meta = activityMetaFor(type);
      expect(meta.icon).toBeTruthy();
      expect(meta.href).toBeTruthy();
    }
  });

  it("degrades gracefully for a type the backend adds later", () => {
    const meta = activityMetaFor("SOMETHING_NEW");
    expect(meta.icon).toBeTruthy();
    expect(meta.href).toBeNull();
    expect(activityTypeLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });
});
