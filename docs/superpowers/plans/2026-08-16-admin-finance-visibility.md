# Admin Finance Visibility & Activity Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the platform admin a money-flow page with per-counterparty drill-down, and move the dashboard's 10-row activity panel to its own filterable page.

**Architecture:** Frontend-only, composing three existing admin endpoints (`/admin/dashboard`, `/admin/clinic-withdrawals`, `/admin/order-cancellations`). All money math lives in pure, unit-tested functions under `src/features/admin/finance/lib/`; TanStack Query hooks orchestrate the bounded multi-page fetches; components stay presentational. Follows the existing `src/features/admin/cancellations/` sub-feature precedent.

**Tech Stack:** Next.js App Router, TypeScript, TanStack Query, shadcn/ui + Base UI primitives, Tailwind v4, recharts, vitest (new).

**Spec:** `docs/superpowers/specs/2026-08-16-admin-finance-visibility-design.md`

**BE handoff (phase 2, not implemented here):** `docs/admin-finance-be-handoff.md`

## Global Constraints

- Package manager is **pnpm**. Never `npm`/`yarn`.
- Dev server port is **3000** (`package.json`), not 5173 as the README claims.
- **No `any`.** Use `unknown` + narrowing or a concrete type (`docs/project-standards.md` §3.2).
- **Three-layer rule:** UI components never call `apiClient` directly. UI → hooks → `*.api.ts`. `*.api.ts` files are dumb wrappers returning `AxiosResponse` (`docs/project-standards.md` §2).
- **Naming:** component files `kebab-case.tsx`; hook files `useCamelCase.ts`; constants `UPPER_SNAKE_CASE`.
- All TanStack Query keys are centralized in `src/lib/query/keys.ts`.
- All user-facing copy is **Vietnamese**.
- Currency formatting uses the existing helpers — `formatCurrency` from `dashboard-shell.tsx` inside admin dashboard-styled surfaces. Do not create new formatters.
- Admin portal surfaces use **semantic theme tokens** (`text-muted-foreground`, `bg-card`, `border`) via shadcn `Card`. Do **not** copy the hardcoded `slate-*`/`emerald-*` palette from the clinic-manager views.
- Conventional Commits with scope: `feat(admin-finance): ...` (`docs/project-standards.md` §5).
- `Select` is Base UI (`SelectPrimitive.Root`). It needs an `items` record (`Record<string, string>`) to render a label on the trigger, **in addition to** `SelectItem` children. Follow `src/features/clinic-manager/components/clinic-statement-view.tsx`.
- **Never introduce a clinic-payable / amount-owed figure.** It is not derivable — see spec §5.4. Task 3 has a regression test enforcing this.

---

## File Structure

**New — pure logic (unit tested):**

| File                                                | Responsibility                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/features/admin/finance/types/finance.types.ts` | Shared shapes for flow, rollup, bounded fetches                          |
| `src/features/admin/finance/lib/money.ts`           | `parseVnd`, `sumVnd` — the only place VND string/number coercion happens |
| `src/features/admin/finance/lib/flow.ts`            | `buildMoneyFlow`, `buildRefundTotals`, `reconcileRefunds`                |
| `src/features/admin/finance/lib/clinic-rollup.ts`   | `withdrawalDateFor`, `filterWithdrawalsByRange`, `rollupByClinic`        |
| `src/features/admin/finance/lib/csv.ts`             | `toCsv` (pure), `downloadCsv` (browser side-effect)                      |

**New — data access:**

| File                                                  | Responsibility                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/features/admin/finance/hooks/useAdminFinance.ts` | `useAllClinicWithdrawals`, `useAllCancellations` — bounded paged loops |

**New — UI:**

| File                                                             | Responsibility                             |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `src/app/(admin)/dashboard/finance/page.tsx`                     | Route join point                           |
| `src/app/(admin)/dashboard/activity/page.tsx`                    | Route join point                           |
| `src/features/admin/finance/components/finance-view.tsx`         | Range state, tab state, data orchestration |
| `src/features/admin/finance/components/money-flow-summary.tsx`   | Two-block flow header                      |
| `src/features/admin/finance/components/clinic-payouts-tab.tsx`   | Per-clinic rollup + expandable line items  |
| `src/features/admin/finance/components/refund-outflow-tab.tsx`   | Refund totals + server-paginated table     |
| `src/features/admin/finance/components/platform-revenue-tab.tsx` | Commission, trend, rate context            |
| `src/features/admin/activity/lib/activity-meta.ts`               | `type` → icon / label / href mapping       |
| `src/features/admin/activity/components/activity-log-view.tsx`   | Activity page                              |

**Modified:**

| File                                                         | Change                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `src/config/site.ts`                                         | +2 nav entries                                                      |
| `src/lib/query/keys.ts`                                      | +3 keys                                                             |
| `src/features/dashboard/components/admin-dashboard-view.tsx` | Remove `RecentActivity`, full-width `TopProducts`, money-card hrefs |
| `package.json`                                               | +vitest, +`test:unit`, `ci:verify` chain                            |
| `vitest.config.ts`                                           | New                                                                 |

---

## A note on TDD scope

Tasks 1–4 are pure functions and follow strict TDD (failing test → implement → pass).

Tasks 5–11 are hooks and React components. This repo has **no component-test infrastructure** (Playwright only, and the spec deliberately excludes adding jsdom/RTL). For those tasks the verification gate is `pnpm typecheck` + `pnpm lint` + a scripted manual check in the browser. Each such task lists the exact manual steps and expected result. Do not claim a UI task passes without actually running the dev server and observing the stated result.

---

### Task 1: Test infrastructure + VND parsing

**Files:**

- Create: `vitest.config.ts`
- Create: `src/features/admin/finance/lib/money.ts`
- Create: `src/features/admin/finance/lib/money.test.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: nothing.
- Produces: `parseVnd(value: string | number | null | undefined): number`, `sumVnd<T>(items: T[], pick: (item: T) => string | number | null | undefined): number`

- [ ] **Step 1: Create a feature branch**

We are on `main`; do not commit feature work there.

```bash
git checkout -b feat/admin-finance-visibility
```

- [ ] **Step 2: Install vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 3: Create `vitest.config.ts`**

`include` is scoped to `src/` so it can never pick up the Playwright specs under `e2e/`.

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 4: Add scripts to `package.json`**

Add `test:unit`, and chain it into `ci:verify` after `typecheck`:

```json
"test:unit": "vitest run",
"ci:verify": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build",
```

- [ ] **Step 5: Write the failing test**

Create `src/features/admin/finance/lib/money.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseVnd, sumVnd } from "./money";

describe("parseVnd", () => {
  it("parses a bigint string as returned by /admin/clinic-withdrawals", () => {
    expect(parseVnd("45000")).toBe(45000);
  });

  it("passes a number through unchanged", () => {
    expect(parseVnd(45000)).toBe(45000);
  });

  it("treats null and undefined as zero", () => {
    expect(parseVnd(null)).toBe(0);
    expect(parseVnd(undefined)).toBe(0);
  });

  it("treats unparseable input as zero rather than NaN", () => {
    expect(parseVnd("abc")).toBe(0);
  });

  it("treats an empty string as zero", () => {
    expect(parseVnd("")).toBe(0);
  });
});

describe("sumVnd", () => {
  it("sums a mixed list of string and number amounts", () => {
    const rows = [
      { amountVnd: "1000" },
      { amountVnd: 2000 },
      { amountVnd: null },
    ];
    expect(sumVnd(rows, (row) => row.amountVnd)).toBe(3000);
  });

  it("returns zero for an empty list", () => {
    expect(sumVnd([], (row: { amountVnd: string }) => row.amountVnd)).toBe(0);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "./money"`.

- [ ] **Step 7: Write the implementation**

Create `src/features/admin/finance/lib/money.ts`:

```ts
/**
 * WHAT: The single place VND amounts are coerced to a number.
 * WHY: `/admin/clinic-withdrawals` returns `amountVnd` as a string (Postgres bigint)
 *      while `/admin/order-cancellations` returns `refundAmountVnd` as a number.
 *      VND magnitudes are far below 2^53, so `number` is safe for both.
 */
export function parseVnd(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sumVnd<T>(
  items: T[],
  pick: (item: T) => string | number | null | undefined,
): number {
  return items.reduce((total, item) => total + parseVnd(pick(item)), 0);
}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS — 7 tests.

- [ ] **Step 9: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml src/features/admin/finance/lib/money.ts src/features/admin/finance/lib/money.test.ts
git commit -m "test(admin-finance): add vitest and VND parsing helpers"
```

---

### Task 2: Finance types

**Files:**

- Create: `src/features/admin/finance/types/finance.types.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `MoneyFlow`, `RefundTotals`, `RefundReconciliation`, `ClinicPayoutRollup`, `BoundedFetchResult<T>`, `FinanceTab`.

- [ ] **Step 1: Create the types file**

```ts
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
```

- [ ] **Step 2: Verify it typechecks**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/finance/types/finance.types.ts
git commit -m "feat(admin-finance): add finance domain types"
```

---

### Task 3: Money flow math

**Files:**

- Create: `src/features/admin/finance/lib/flow.ts`
- Create: `src/features/admin/finance/lib/flow.test.ts`

**Interfaces:**

- Consumes: `parseVnd`/`sumVnd` (Task 1), types (Task 2).
- Produces: `buildMoneyFlow(metrics, withdrawalsInRange): MoneyFlow`, `buildRefundTotals(cancellations): RefundTotals`, `reconcileRefunds(dashboardRefundsVnd, cancellations): RefundReconciliation`, plus exported status constants `REFUND_SETTLED_STATUSES`, `REFUND_IN_FLIGHT_STATUSES`.

- [ ] **Step 1: Write the failing test**

Create `src/features/admin/finance/lib/flow.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "./flow"`.

- [ ] **Step 3: Write the implementation**

Create `src/features/admin/finance/lib/flow.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS — all flow tests green, including the clinic-payable guard.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/finance/lib/flow.ts src/features/admin/finance/lib/flow.test.ts
git commit -m "feat(admin-finance): add money flow and refund reconciliation math"
```

---

### Task 4: Clinic rollup + CSV

**Files:**

- Create: `src/features/admin/finance/lib/clinic-rollup.ts`
- Create: `src/features/admin/finance/lib/clinic-rollup.test.ts`
- Create: `src/features/admin/finance/lib/csv.ts`
- Create: `src/features/admin/finance/lib/csv.test.ts`

**Interfaces:**

- Consumes: Task 1 + Task 2.
- Produces: `withdrawalDateFor(item): string`, `filterWithdrawalsByRange(items, from, to): ClinicWithdrawalItem[]`, `rollupByClinic(items, clinicNames: Map<string, string>): ClinicPayoutRollup[]`, `toCsv(headers: string[], rows: (string | number)[][]): string`, `downloadCsv(filename: string, csv: string): void`.

- [ ] **Step 1: Write the failing rollup test**

Create `src/features/admin/finance/lib/clinic-rollup.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "./clinic-rollup"`.

- [ ] **Step 3: Write the rollup implementation**

Create `src/features/admin/finance/lib/clinic-rollup.ts`:

```ts
import type { ClinicWithdrawalItem } from "@/features/admin/api/admin-clinic-withdrawals.api";
import type { ClinicPayoutRollup } from "../types/finance.types";
import { parseVnd } from "./money";

/**
 * WHY: settled rows are attributed to the date the money actually moved
 * (processedAt); open rows have no processedAt, so they fall back to createdAt.
 */
export function withdrawalDateFor(item: ClinicWithdrawalItem): string {
  if (item.status === "REQUESTED") return item.createdAt;
  return item.processedAt ?? item.createdAt;
}

/**
 * `from` and `to` are the server-computed `period.from` / `period.to` (YYYY-MM-DD)
 * returned by /admin/dashboard. Boundaries are anchored to +07:00 so client-side
 * filtering matches the server's Asia/Ho_Chi_Minh range.
 */
export function filterWithdrawalsByRange(
  items: ClinicWithdrawalItem[],
  from: string,
  to: string,
): ClinicWithdrawalItem[] {
  const start = new Date(`${from}T00:00:00.000+07:00`).getTime();
  const end = new Date(`${to}T23:59:59.999+07:00`).getTime();

  return items.filter((item) => {
    const at = new Date(withdrawalDateFor(item)).getTime();
    return at >= start && at <= end;
  });
}

export function rollupByClinic(
  items: ClinicWithdrawalItem[],
  clinicNames: Map<string, string>,
): ClinicPayoutRollup[] {
  const rollups = new Map<string, ClinicPayoutRollup>();

  for (const item of items) {
    let row = rollups.get(item.clinicId);
    if (!row) {
      row = {
        clinicId: item.clinicId,
        clinicName:
          clinicNames.get(item.clinicId) ??
          item.clinicName ??
          `#${item.clinicId.slice(0, 8)}`,
        requestCount: 0,
        paidVnd: 0,
        pendingVnd: 0,
        rejectedVnd: 0,
        lastPaidAt: null,
      };
      rollups.set(item.clinicId, row);
    }

    row.requestCount += 1;
    const amount = parseVnd(item.amountVnd);

    if (item.status === "PAID") {
      row.paidVnd += amount;
      const paidAt = item.processedAt ?? item.createdAt;
      if (!row.lastPaidAt || paidAt > row.lastPaidAt) {
        row.lastPaidAt = paidAt;
      }
    } else if (item.status === "REQUESTED") {
      row.pendingVnd += amount;
    } else {
      row.rejectedVnd += amount;
    }
  }

  return [...rollups.values()].sort((a, b) => b.paidVnd - a.paidVnd);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS.

- [ ] **Step 5: Write the failing CSV test**

Create `src/features/admin/finance/lib/csv.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins headers and rows with newlines", () => {
    expect(toCsv(["a", "b"], [[1, 2]])).toBe("a,b\n1,2");
  });

  it("quotes and escapes values containing commas or quotes", () => {
    expect(toCsv(["note"], [['say "hi", please']])).toBe(
      'note\n"say ""hi"", please"',
    );
  });

  it("renders an empty row set as headers only", () => {
    expect(toCsv(["a", "b"], [])).toBe("a,b");
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "./csv"`.

- [ ] **Step 7: Write the CSV implementation**

Create `src/features/admin/finance/lib/csv.ts`:

```ts
function escapeCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n");
}

/** Browser-only side effect. Prefixed with a BOM so Excel reads UTF-8 correctly. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/features/admin/finance/lib/clinic-rollup.ts src/features/admin/finance/lib/clinic-rollup.test.ts src/features/admin/finance/lib/csv.ts src/features/admin/finance/lib/csv.test.ts
git commit -m "feat(admin-finance): add clinic payout rollup and CSV export helpers"
```

---

### Task 5: Bounded fetch hooks

**Files:**

- Modify: `src/lib/query/keys.ts`
- Create: `src/features/admin/finance/hooks/useAdminFinance.ts`

**Interfaces:**

- Consumes: `BoundedFetchResult` (Task 2), `adminClinicWithdrawalsApi.listWithdrawals`, `cancellationsApi.getCancellations`.
- Produces: `useAllClinicWithdrawals(): UseQueryResult<BoundedFetchResult<ClinicWithdrawalItem>>`, `useAllCancellations(): UseQueryResult<BoundedFetchResult<OrderCancellation>>`, constants `FINANCE_ROW_CAP`, `FINANCE_PAGE_SIZE`.

- [ ] **Step 1: Add query keys**

In `src/lib/query/keys.ts`, add these three entries at the end of the object, after `adminClinicWithdrawals`:

```ts
  adminClinicWithdrawalsAll: ["admin", "clinic-withdrawals", "all"] as const,
  adminCancellations: (query?: unknown) =>
    ["admin", "cancellations", query ?? {}] as const,
  adminCancellationsAll: ["admin", "cancellations", "all"] as const,
```

- [ ] **Step 2: Write the hooks**

Create `src/features/admin/finance/hooks/useAdminFinance.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  adminClinicWithdrawalsApi,
  type ClinicWithdrawalItem,
} from "@/features/admin/api/admin-clinic-withdrawals.api";
import { cancellationsApi } from "@/features/admin/cancellations/api/cancellations.api";
import type { OrderCancellation } from "@/features/admin/cancellations/types/cancellation.types";
import type { BoundedFetchResult } from "../types/finance.types";

/**
 * WHY bounded: neither endpoint supports date filtering, so period totals require
 * the whole set. Withdrawals are a hand-approved queue (low volume); cancellations
 * scale with orders, so truncation is surfaced in the UI rather than hidden.
 * Replaced by GET /admin/transactions — see docs/admin-finance-be-handoff.md.
 */
export const FINANCE_PAGE_SIZE = 100;
export const FINANCE_ROW_CAP = 500;

const MAX_PAGES = Math.ceil(FINANCE_ROW_CAP / FINANCE_PAGE_SIZE);

export function useAllClinicWithdrawals() {
  return useQuery({
    queryKey: queryKeys.adminClinicWithdrawalsAll,
    queryFn: async (): Promise<BoundedFetchResult<ClinicWithdrawalItem>> => {
      const items: ClinicWithdrawalItem[] = [];
      let total = 0;

      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await adminClinicWithdrawalsApi.listWithdrawals({
          status: "ALL",
          page,
          limit: FINANCE_PAGE_SIZE,
        });
        total = response.data.total;
        // Guard against a server that reports a total it cannot page through.
        if (response.data.items.length === 0) break;
        items.push(...response.data.items);
        if (items.length >= total) break;
      }

      return {
        items: items.slice(0, FINANCE_ROW_CAP),
        truncated: total > FINANCE_ROW_CAP,
        cap: FINANCE_ROW_CAP,
      };
    },
  });
}

export function useAllCancellations() {
  return useQuery({
    queryKey: queryKeys.adminCancellationsAll,
    queryFn: async (): Promise<BoundedFetchResult<OrderCancellation>> => {
      const items: OrderCancellation[] = [];
      let total = 0;

      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await cancellationsApi.getCancellations({
          status: "ALL",
          page,
          limit: FINANCE_PAGE_SIZE,
        });
        total = response.data.total;
        if (response.data.items.length === 0) break;
        items.push(...response.data.items);
        if (items.length >= total) break;
      }

      return {
        items: items.slice(0, FINANCE_ROW_CAP),
        truncated: total > FINANCE_ROW_CAP,
        cap: FINANCE_ROW_CAP,
      };
    },
  });
}
```

- [ ] **Step 3: Verify types and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/query/keys.ts src/features/admin/finance/hooks/useAdminFinance.ts
git commit -m "feat(admin-finance): add bounded withdrawal and cancellation fetch hooks"
```

---

### Task 6: Finance route, nav entry, and flow header

**Files:**

- Create: `src/app/(admin)/dashboard/finance/page.tsx`
- Create: `src/features/admin/finance/components/money-flow-summary.tsx`
- Create: `src/features/admin/finance/components/finance-view.tsx`
- Modify: `src/config/site.ts`

**Interfaces:**

- Consumes: Tasks 2–5, `DashboardPageHeader`/`DashboardSectionCard`/`DashboardLoading`/`DashboardError`/`formatCurrency` from `@/features/dashboard/components/dashboard-shell`, `useAdminDashboard`.
- Produces: `FinanceView` (default export of the feature), `MoneyFlowSummary`.

- [ ] **Step 1: Add the nav entries**

In `src/config/site.ts`, inside `siteConfig.dashboard.navMain`, insert after the `Thương mại & Ví` entry:

```ts
      {
        title: "Dòng tiền & Đối soát",
        url: "/dashboard/finance",
        icon: "ReceiptText",
      },
```

and after the `Duyệt rút tiền phòng khám` entry:

```ts
      {
        title: "Nhật ký hoạt động",
        url: "/dashboard/activity",
        icon: "List",
      },
```

Both icons are already registered in `IconMap` in `src/shared/components/app-sidebar.tsx` — do not modify that file.

- [ ] **Step 2: Write the flow summary component**

Create `src/features/admin/finance/components/money-flow-summary.tsx`:

```tsx
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
    <div className="flex h-full flex-col rounded-xl border p-4 text-left">
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
    </div>
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
```

- [ ] **Step 3: Write the finance view shell**

Create `src/features/admin/finance/components/finance-view.tsx`. The three tab bodies are added in Tasks 7–9; for now they render placeholders that are replaced, not left behind.

```tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from "@/features/dashboard/components/dashboard-shell";
import { useAdminDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { DashboardRange } from "@/features/dashboard/types/dashboard.types";
import { buildMoneyFlow, reconcileRefunds } from "../lib/flow";
import { filterWithdrawalsByRange } from "../lib/clinic-rollup";
import {
  useAllCancellations,
  useAllClinicWithdrawals,
} from "../hooks/useAdminFinance";
import type { FinanceTab } from "../types/finance.types";
import { MoneyFlowSummary } from "./money-flow-summary";

const TAB_VALUES: FinanceTab[] = ["clinics", "refunds", "platform"];

function parseTab(value: string | null): FinanceTab {
  return TAB_VALUES.includes(value as FinanceTab)
    ? (value as FinanceTab)
    : "clinics";
}

export function FinanceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const [range, setRange] = React.useState<DashboardRange>("30d");
  const dashboard = useAdminDashboard(range);
  const withdrawals = useAllClinicWithdrawals();
  const cancellations = useAllCancellations();

  const setTab = (next: string) => {
    router.replace(`/dashboard/finance?tab=${next}`, { scroll: false });
  };

  const isPending =
    dashboard.isPending || withdrawals.isPending || cancellations.isPending;
  const isError =
    dashboard.isError || withdrawals.isError || cancellations.isError;

  const data = dashboard.data;
  const withdrawalRows = withdrawals.data?.items ?? [];
  const cancellationRows = cancellations.data?.items ?? [];

  const withdrawalsInRange = React.useMemo(() => {
    if (!data) return [];
    return filterWithdrawalsByRange(
      withdrawalRows,
      data.period.from,
      data.period.to,
    );
  }, [withdrawalRows, data]);

  const flow = React.useMemo(() => {
    if (!data) return null;
    return buildMoneyFlow(data.metrics, withdrawalsInRange);
  }, [data, withdrawalsInRange]);

  const reconciliation = React.useMemo(() => {
    if (!data) return null;
    return reconcileRefunds(data.metrics.productRefundsVnd, cancellationRows);
  }, [data, cancellationRows]);

  const truncated =
    (withdrawals.data?.truncated ?? false) ||
    (cancellations.data?.truncated ?? false);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Dòng tiền & Đối soát"
        description="Theo dõi tiền vào, tiền ra và số đã chi trả cho từng phòng khám."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {isPending ? (
        <DashboardLoading cards={4} />
      ) : isError || !data || !flow || !reconciliation ? (
        <DashboardError
          retry={() => {
            void dashboard.refetch();
            void withdrawals.refetch();
            void cancellations.refetch();
          }}
        />
      ) : (
        <>
          {truncated ? (
            <Alert>
              <AlertTriangle />
              <AlertTitle>Dữ liệu bị giới hạn</AlertTitle>
              <AlertDescription>
                Chỉ tải được {withdrawals.data?.cap ?? 500} bản ghi gần nhất cho
                mỗi nguồn. Các số tổng bên dưới phản ánh phần đã tải, không phải
                toàn bộ kỳ.
              </AlertDescription>
            </Alert>
          ) : null}

          <MoneyFlowSummary
            flow={flow}
            reconciliation={reconciliation}
            onNavigate={setTab}
          />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="clinics">Phòng khám</TabsTrigger>
              <TabsTrigger value="refunds">Hoàn tiền khách</TabsTrigger>
              <TabsTrigger value="platform">Nền tảng</TabsTrigger>
            </TabsList>

            <TabsContent value="clinics" className="mt-4">
              <p className="text-muted-foreground text-sm">
                Sẽ bổ sung ở Task 7.
              </p>
            </TabsContent>
            <TabsContent value="refunds" className="mt-4">
              <p className="text-muted-foreground text-sm">
                Sẽ bổ sung ở Task 8.
              </p>
            </TabsContent>
            <TabsContent value="platform" className="mt-4">
              <p className="text-muted-foreground text-sm">
                Sẽ bổ sung ở Task 9.
              </p>
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Write the route**

Create `src/app/(admin)/dashboard/finance/page.tsx`. `useSearchParams` requires a Suspense boundary in the App Router.

```tsx
import { Suspense } from "react";
import { FinanceView } from "@/features/admin/finance/components/finance-view";
import { DashboardLoading } from "@/features/dashboard/components/dashboard-shell";

export const metadata = {
  title: "Dòng tiền & Đối soát",
};

export default function FinancePage() {
  return (
    <Suspense fallback={<DashboardLoading cards={4} />}>
      <FinanceView />
    </Suspense>
  );
}
```

- [ ] **Step 5: Verify**

```bash
pnpm typecheck && pnpm lint
```

Then run the dev server and check manually:

```bash
pnpm dev
```

Open `http://localhost:3000/dashboard/finance`. Expected:

1. `Dòng tiền & Đối soát` appears in the sidebar and is active.
2. The flow header shows four cards; the fourth is the dashed `Về phòng khám — Chưa tính được` node.
3. `Khách thanh toán` carries the italic note `Chưa gồm doanh thu phác đồ điều trị`.
4. Clicking `Hoàn tiền` switches to the `Hoàn tiền khách` tab and the URL becomes `?tab=refunds`.
5. Changing the range dropdown re-renders the numbers.

- [ ] **Step 6: Commit**

```bash
git add src/config/site.ts src/app/\(admin\)/dashboard/finance/page.tsx src/features/admin/finance/components/
git commit -m "feat(admin-finance): add finance route, nav entry, and money flow header"
```

---

### Task 7: Clinic payouts tab

**Files:**

- Create: `src/features/admin/finance/components/clinic-payouts-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `rollupByClinic` (Task 4), `useAdminClinics` from `@/features/admin/hooks/useAdminClinics`, `toCsv`/`downloadCsv` (Task 4).
- Produces: `ClinicPayoutsTab({ withdrawals }: { withdrawals: ClinicWithdrawalItem[] })`.

**Deliberate deviation from spec §5.5.** The spec listed four filters: clinic select,
status, date range, free-text. This task implements only status and free-text, because:

- **Date range** is already applied one level up — `finance-view.tsx` passes
  `withdrawalsInRange`, filtered by the page's range selector against the server's
  `period.from`/`period.to`. A second date control would be a competing source of truth.
- **Clinic select** is redundant with the table itself, which is grouped by clinic —
  the top-level rows _are_ the clinic list. Free-text search covers finding one.

If a reviewer wants either restored, add it here rather than changing the range plumbing.

- [ ] **Step 1: Write the component**

Create `src/features/admin/finance/components/clinic-payouts-tab.tsx`:

```tsx
"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DashboardEmptyPanel,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import type { ClinicWithdrawalItem } from "@/features/admin/api/admin-clinic-withdrawals.api";
import { useAdminClinics } from "@/features/admin/hooks/useAdminClinics";
import { rollupByClinic, withdrawalDateFor } from "../lib/clinic-rollup";
import { downloadCsv, toCsv } from "../lib/csv";
import { parseVnd } from "../lib/money";

const STATUS_ITEMS: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  PAID: "Đã thanh toán",
  REQUESTED: "Chờ duyệt",
  REJECTED: "Đã từ chối",
};

const STATUS_LABELS: Record<ClinicWithdrawalItem["status"], string> = {
  PAID: "Đã thanh toán",
  REQUESTED: "Chờ duyệt",
  REJECTED: "Đã từ chối",
};

export function ClinicPayoutsTab({
  withdrawals,
}: {
  withdrawals: ClinicWithdrawalItem[];
}) {
  const [status, setStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const { data: clinicsRes } = useAdminClinics();

  const clinicNames = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const clinic of clinicsRes?.items ?? []) {
      if (clinic.id && clinic.name) map.set(clinic.id, clinic.name);
    }
    return map;
  }, [clinicsRes?.items]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return withdrawals.filter((item) => {
      if (status !== "ALL" && item.status !== status) return false;
      if (!term) return true;
      return [item.transferRef, item.bankName, item.bankAccountHolder]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [withdrawals, status, search]);

  const rollups = React.useMemo(
    () => rollupByClinic(filtered, clinicNames),
    [filtered, clinicNames],
  );

  const handleExport = () => {
    const csv = toCsv(
      [
        "Phòng khám",
        "Số lệnh",
        "Đã chi trả",
        "Chờ duyệt",
        "Đã từ chối",
        "Lần chi gần nhất",
      ],
      rollups.map((row) => [
        row.clinicName,
        row.requestCount,
        row.paidVnd,
        row.pendingVnd,
        row.rejectedVnd,
        row.lastPaidAt ?? "",
      ]),
    );
    downloadCsv("dong-tien-phong-kham.csv", csv);
  };

  return (
    <DashboardSectionCard
      title="Chi trả theo phòng khám"
      description="Bấm vào một phòng khám để xem từng lệnh rút tiền"
      action={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download /> Xuất CSV
        </Button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Select
          value={status}
          items={STATUS_ITEMS}
          onValueChange={(value) => setStatus(value || "ALL")}
        >
          <SelectTrigger aria-label="Lọc theo trạng thái">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Tìm theo mã chuyển khoản, ngân hàng..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {rollups.length === 0 ? (
        <DashboardEmptyPanel
          title="Không có lệnh rút tiền"
          description="Không có phòng khám nào khớp bộ lọc trong kỳ này."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phòng khám</TableHead>
              <TableHead className="text-right">Đã chi trả</TableHead>
              <TableHead className="text-right">Chờ duyệt</TableHead>
              <TableHead className="text-right">Lần chi gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rollups.map((row) => {
              const isOpen = expanded === row.clinicId;
              const lineItems = filtered.filter(
                (item) => item.clinicId === row.clinicId,
              );

              return (
                <React.Fragment key={row.clinicId}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : row.clinicId)}
                  >
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                        {row.clinicName}
                        <span className="text-muted-foreground text-xs">
                          ({row.requestCount} lệnh)
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.paidVnd)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.pendingVnd)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs">
                      {row.lastPaidAt ? formatDateTime(row.lastPaidAt) : "—"}
                    </TableCell>
                  </TableRow>

                  {isOpen ? (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/20 p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Thời gian</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">
                                Số tiền
                              </TableHead>
                              <TableHead>Ngân hàng</TableHead>
                              <TableHead>Mã giao dịch</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lineItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground text-xs">
                                  {formatDateTime(withdrawalDateFor(item))}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      item.status === "REJECTED"
                                        ? "destructive"
                                        : item.status === "PAID"
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {STATUS_LABELS[item.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(parseVnd(item.amountVnd))}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {item.bankName} · {item.bankAccountNumber}
                                  <p className="text-muted-foreground">
                                    {item.bankAccountHolder}
                                  </p>
                                </TableCell>
                                <TableCell className="font-mono text-[11px]">
                                  {item.transferRef ?? "—"}
                                  {item.debitTransactionId ? (
                                    <p className="text-muted-foreground">
                                      Ghi nợ: #
                                      {item.debitTransactionId.slice(0, 8)}
                                    </p>
                                  ) : null}
                                  {item.refundTransactionId ? (
                                    <p className="text-muted-foreground">
                                      Hoàn ví: #
                                      {item.refundTransactionId.slice(0, 8)}
                                    </p>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DashboardSectionCard>
  );
}
```

- [ ] **Step 2: Wire it into the view**

In `finance-view.tsx`, add the import:

```tsx
import { ClinicPayoutsTab } from "./clinic-payouts-tab";
```

and replace the `clinics` tab body:

```tsx
<TabsContent value="clinics" className="mt-4">
  <ClinicPayoutsTab withdrawals={withdrawalsInRange} />
</TabsContent>
```

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm lint
```

Then with `pnpm dev` running, open `http://localhost:3000/dashboard/finance?tab=clinics`. Expected:

1. One row per clinic, sorted with the largest paid total first.
2. Clicking a row expands it to show that clinic's individual withdrawals.
3. Setting status to `Chờ duyệt` leaves only clinics with pending requests.
4. `Xuất CSV` downloads `dong-tien-phong-kham.csv` and it opens in Excel with Vietnamese characters intact.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/finance/components/clinic-payouts-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "feat(admin-finance): add per-clinic payout tab with line-item drilldown"
```

---

### Task 8: Refund outflow tab

**Files:**

- Create: `src/features/admin/finance/components/refund-outflow-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `buildRefundTotals` (Task 3); `useOrderCancellations` from `@/features/admin/cancellations/hooks/useCancellations` — note the name is `useOrderCancellations`, it returns the unwrapped `{ items, total, page, limit }`, and it carries `refetchInterval: 10_000`; `CancellationDetailModal` with props `{ cancellation: OrderCancellation | null, isOpen: boolean, onClose: () => void, isAdmin?: boolean }`; `DataTablePagination`.
- Produces: `RefundOutflowTab({ allCancellations }: { allCancellations: OrderCancellation[] })`.

- [ ] **Step 1: Write the component**

Create `src/features/admin/finance/components/refund-outflow-tab.tsx`:

```tsx
"use client";

import * as React from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import {
  DashboardEmptyPanel,
  DashboardMetricCard,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { useOrderCancellations } from "@/features/admin/cancellations/hooks/useCancellations";
import { CancellationDetailModal } from "@/features/admin/cancellations/components/cancellation-detail-modal";
import type {
  OrderCancellation,
  OrderCancellationStatus,
} from "@/features/admin/cancellations/types/cancellation.types";
import { buildRefundTotals } from "../lib/flow";

const PAGE_SIZE = 20;

const STATUS_ITEMS: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  REQUESTED: "Mới yêu cầu",
  REFUNDING: "Đang hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  AWAITING_RETURN: "Chờ nhận hàng trả",
  RESTOCKED: "Đã nhập lại kho",
  COMPLETED: "Hoàn tất",
  FAILED: "Lỗi",
};

export function RefundOutflowTab({
  allCancellations,
}: {
  allCancellations: OrderCancellation[];
}) {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<OrderCancellation | null>(
    null,
  );

  // Totals come from the bounded whole-set fetch, NOT from `items` — so they
  // describe the period rather than the visible page. See spec §5.2.
  const totals = React.useMemo(
    () => buildRefundTotals(allCancellations),
    [allCancellations],
  );

  // Returns unwrapped `{ items, total, page, limit }` and polls every 10s.
  const query = useOrderCancellations({
    status: status as OrderCancellationStatus | "ALL",
    page,
    limit: PAGE_SIZE,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard
          icon={RefreshCw}
          label="Đã hoàn cho khách"
          value={formatCurrency(totals.refundedOutVnd)}
          hint="Tiền đã rời khỏi nền tảng"
        />
        <DashboardMetricCard
          icon={Clock}
          label="Đang xử lý"
          value={formatCurrency(totals.inFlightVnd)}
          hint="Chưa hoàn xong"
        />
        <DashboardMetricCard
          icon={AlertTriangle}
          label="Đang kẹt (lỗi)"
          value={formatCurrency(totals.stuckVnd)}
          hint="Cần can thiệp thủ công"
        />
      </section>

      <DashboardSectionCard
        title="Danh sách hoàn tiền"
        description="Lọc theo trạng thái; phân trang lấy từ máy chủ"
      >
        <div className="mb-4 max-w-xs">
          <Select
            value={status}
            items={STATUS_ITEMS}
            onValueChange={(value) => {
              setStatus(value || "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái hoàn tiền">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {items.length === 0 ? (
          <DashboardEmptyPanel
            title="Không có yêu cầu hoàn tiền"
            description="Không có bản ghi nào khớp bộ lọc hiện tại."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền hoàn</TableHead>
                  <TableHead>Ghi chú lỗi</TableHead>
                  <TableHead className="text-right">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell className="font-mono text-xs">
                      #{item.orderId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "FAILED" ? "destructive" : "outline"
                        }
                      >
                        {STATUS_ITEMS[item.status] ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.refundAmountVnd)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-56 truncate text-xs">
                      {item.lastError ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </DashboardSectionCard>

      {/* Reused from the cancellations feature — do not rebuild. */}
      <CancellationDetailModal
        cancellation={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        isAdmin
      />
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the view**

In `finance-view.tsx`, add the import:

```tsx
import { RefundOutflowTab } from "./refund-outflow-tab";
```

and replace the `refunds` tab body:

```tsx
<TabsContent value="refunds" className="mt-4">
  <RefundOutflowTab allCancellations={cancellationRows} />
</TabsContent>
```

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm lint
```

With `pnpm dev` running, open `http://localhost:3000/dashboard/finance?tab=refunds`. Expected:

1. Three summary cards render, with `Đang kẹt (lỗi)` showing a value (0 ₫ is acceptable).
2. The table paginates and the page control moves between pages.
3. Selecting `Lỗi` in the filter shows only `FAILED` rows and resets to page 1.
4. The summary card values do **not** change when you page the table — they describe the period, not the page.
5. Clicking a row opens the existing cancellation detail modal; closing it returns to the table.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/finance/components/refund-outflow-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "feat(admin-finance): add refund outflow tab with stuck-refund total"
```

---

### Task 9: Platform revenue tab

**Files:**

- Create: `src/features/admin/finance/components/platform-revenue-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `AdminDashboardResponse` (`metrics` + `trend`), `useAdminPlatformCommission` / `useAdminComboDiscount` from `@/features/admin/hooks/useAdminCommerce`.
- Produces: `PlatformRevenueTab({ data }: { data: AdminDashboardResponse })`.

- [ ] **Step 1: Write the component**

Create `src/features/admin/finance/components/platform-revenue-tab.tsx`:

```tsx
"use client";

import Link from "next/link";
import { CircleDollarSign, Percent } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  DashboardMetricCard,
  DashboardSectionCard,
  formatChartDate,
  formatCompactCurrency,
  formatCurrency,
} from "@/features/dashboard/components/dashboard-shell";
import type { AdminDashboardResponse } from "@/features/dashboard/types/dashboard.types";
import {
  useAdminComboDiscount,
  useAdminPlatformCommission,
} from "@/features/admin/hooks/useAdminCommerce";

const commissionChartConfig = {
  platformCommissionRevenueVnd: {
    label: "Hoa hồng nền tảng",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

export function PlatformRevenueTab({ data }: { data: AdminDashboardResponse }) {
  const { data: commission } = useAdminPlatformCommission();
  const { data: combo } = useAdminComboDiscount();

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard
          icon={CircleDollarSign}
          label="Hoa hồng đã ghi nhận"
          value={formatCurrency(data.metrics.platformCommissionRevenueVnd)}
          hint="COMMISSION → PLATFORM_REVENUE"
        />
        <DashboardMetricCard
          icon={Percent}
          label="Tỷ lệ hoa hồng hiện tại"
          value={`${commission?.percent ?? "—"}%`}
          hint="Áp dụng cho thanh toán mới"
        />
        <DashboardMetricCard
          icon={Percent}
          label="Ưu đãi Combo AI"
          value={`${combo?.percent ?? "—"}%`}
          hint="Giảm giá khi mua trọn bộ"
        />
      </section>

      <DashboardSectionCard
        title="Cấu trúc tiền hàng"
        description="Từ giá trị trước giảm tới số thực thu"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Figure
            label="Giá trị trước giảm"
            value={data.metrics.grossProductSalesVnd}
          />
          <Figure label="Giảm giá" value={data.metrics.discountsVnd} />
          <Figure
            label="Phí vận chuyển"
            value={data.metrics.shippingCollectedVnd}
          />
          <Figure
            label="Thực thu"
            value={data.metrics.productPaymentsCollectedVnd}
          />
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Hoa hồng theo ngày"
        description="Phần doanh thu thuộc về GlowScan"
        action={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/commerce" />}
            nativeButton={false}
          >
            Đổi tỷ lệ
          </Button>
        }
      >
        <ChartContainer
          config={commissionChartConfig}
          className="h-[290px] w-full"
        >
          <AreaChart
            data={data.trend.map((point) => ({
              ...point,
              label: formatChartDate(point.date),
            }))}
            margin={{ left: 4, right: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompactCurrency}
              width={56}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span>{formatCurrency(Number(value))}</span>
                  )}
                />
              }
            />
            <Legend content={<ChartLegendContent />} />
            <Area
              dataKey="platformCommissionRevenueVnd"
              type="monotone"
              stroke="var(--color-platformCommissionRevenueVnd)"
              fill="var(--color-platformCommissionRevenueVnd)"
              fillOpacity={0.08}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </DashboardSectionCard>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the view**

In `finance-view.tsx`, add the import:

```tsx
import { PlatformRevenueTab } from "./platform-revenue-tab";
```

and replace the `platform` tab body:

```tsx
<TabsContent value="platform" className="mt-4">
  <PlatformRevenueTab data={data} />
</TabsContent>
```

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm lint
```

With `pnpm dev` running, open `http://localhost:3000/dashboard/finance?tab=platform`. Expected:

1. Commission rate and combo discount show real percentages, not `—`.
2. The commission area chart renders with one series.
3. `Đổi tỷ lệ` navigates to `/dashboard/commerce`.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/finance/components/platform-revenue-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "feat(admin-finance): add platform revenue tab with commission trend"
```

---

### Task 10: Activity log page

**Files:**

- Create: `src/features/admin/activity/lib/activity-meta.ts`
- Create: `src/features/admin/activity/components/activity-log-view.tsx`
- Create: `src/app/(admin)/dashboard/activity/page.tsx`

**Interfaces:**

- Consumes: `useAdminDashboard` (same query key the dashboard caches — no extra request).
- Produces: `activityMetaFor(type: string): ActivityMeta`, `ActivityLogView`.

- [ ] **Step 1: Write the metadata map**

Create `src/features/admin/activity/lib/activity-meta.ts`:

```ts
import {
  Banknote,
  Boxes,
  CircleDot,
  PackagePlus,
  ShoppingBag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface ActivityMeta {
  icon: LucideIcon;
  /** Link to a filtered LIST page — the payload's id is not guaranteed routable. */
  href: string | null;
}

/**
 * Matching is substring-based and case-insensitive because the backend's activity
 * `type` vocabulary is not published. Unknown types degrade to a neutral row
 * rather than breaking the list.
 */
const RULES: Array<{ match: RegExp; meta: ActivityMeta }> = [
  {
    match: /withdraw/i,
    meta: { icon: Banknote, href: "/dashboard/finance?tab=clinics" },
  },
  {
    match: /cancel|refund/i,
    meta: { icon: Boxes, href: "/dashboard/finance?tab=refunds" },
  },
  { match: /order/i, meta: { icon: ShoppingBag, href: "/dashboard/commerce" } },
  {
    match: /stock|import/i,
    meta: { icon: PackagePlus, href: "/dashboard/stock-imports" },
  },
  {
    match: /user|customer|signup/i,
    meta: { icon: UserPlus, href: "/dashboard/users" },
  },
];

const FALLBACK: ActivityMeta = { icon: CircleDot, href: null };

export function activityMetaFor(type: string): ActivityMeta {
  return RULES.find((rule) => rule.match.test(type))?.meta ?? FALLBACK;
}
```

- [ ] **Step 2: Write the view**

Create `src/features/admin/activity/components/activity-log-view.tsx`:

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DashboardEmptyPanel,
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { useAdminDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { DashboardRange } from "@/features/dashboard/types/dashboard.types";
import { activityMetaFor } from "../lib/activity-meta";

export function ActivityLogView() {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const [type, setType] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");

  const query = useAdminDashboard(range);
  const data = query.data;
  const activities = React.useMemo(() => data?.recentActivity ?? [], [data]);

  // Options come from the data actually present, so the filter never offers
  // a choice that yields nothing.
  const typeItems = React.useMemo(() => {
    const items: Record<string, string> = { ALL: "Tất cả loại" };
    for (const activity of activities) {
      items[activity.type] = activity.title;
    }
    return items;
  }, [activities]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.filter((activity) => {
      if (type !== "ALL" && activity.type !== type) return false;
      if (!term) return true;
      return `${activity.title} ${activity.description ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [activities, type, search]);

  const grouped = React.useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const activity of filtered) {
      const day = activity.occurredAt.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), activity]);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Nhật ký hoạt động"
        description="Các thay đổi gần nhất trên toàn hệ thống."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      <Alert>
        <Info />
        <AlertDescription>
          Hiển thị 10 hoạt động gần nhất trong kỳ. Nhật ký đầy đủ cần endpoint
          phân trang (chưa có).
        </AlertDescription>
      </Alert>

      {query.isPending ? (
        <DashboardLoading cards={3} />
      ) : query.isError || !data ? (
        <DashboardError retry={() => void query.refetch()} />
      ) : (
        <DashboardSectionCard title="Sự kiện" description="Nhóm theo ngày">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Select
              value={type}
              items={typeItems}
              onValueChange={(value) => setType(value || "ALL")}
            >
              <SelectTrigger aria-label="Lọc theo loại hoạt động">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tìm trong tiêu đề, mô tả..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {grouped.length === 0 ? (
            <DashboardEmptyPanel
              title="Không có hoạt động"
              description="Không có sự kiện nào khớp bộ lọc trong kỳ này."
            />
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map(([day, rows]) => (
                <div key={day}>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {day}
                  </p>
                  <div className="flex flex-col gap-2">
                    {rows.map((activity) => {
                      const meta = activityMetaFor(activity.type);
                      const Icon = meta.icon;

                      const row = (
                        <div className="hover:border-primary/30 flex items-start gap-3 rounded-xl border p-3 transition-colors">
                          <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{activity.title}</Badge>
                              {activity.amountVnd == null ? null : (
                                <span className="text-sm font-semibold">
                                  {formatCurrency(activity.amountVnd)}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {activity.description || "—"}
                            </p>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {formatDateTime(activity.occurredAt)}
                          </span>
                        </div>
                      );

                      return meta.href ? (
                        <Link
                          key={`${activity.type}-${activity.id}`}
                          href={meta.href}
                          className="block"
                        >
                          {row}
                        </Link>
                      ) : (
                        <div key={`${activity.type}-${activity.id}`}>{row}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSectionCard>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Write the route**

Create `src/app/(admin)/dashboard/activity/page.tsx`:

```tsx
import { ActivityLogView } from "@/features/admin/activity/components/activity-log-view";

export const metadata = {
  title: "Nhật ký hoạt động",
};

export default function ActivityPage() {
  return <ActivityLogView />;
}
```

- [ ] **Step 4: Verify**

```bash
pnpm typecheck && pnpm lint
```

With `pnpm dev` running, open `http://localhost:3000/dashboard/activity`. Expected:

1. `Nhật ký hoạt động` appears in the sidebar and is active.
2. The blue info alert about the 10-row limit is visible and cannot be dismissed.
3. Rows are grouped under date headings, newest day first.
4. Typing in the search box narrows the list.
5. Visiting `/dashboard` first and then `/dashboard/activity` fires **no new network request** for the same range — confirm in the Network tab; the shared query key means it is served from cache.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/activity src/app/\(admin\)/dashboard/activity
git commit -m "feat(admin-activity): add activity log page with client-side filters"
```

---

### Task 11: Dashboard cleanup

**Files:**

- Modify: `src/features/dashboard/components/admin-dashboard-view.tsx`

**Interfaces:**

- Consumes: everything above.
- Produces: nothing new.

- [ ] **Step 1: Remove the RecentActivity section**

In `admin-dashboard-view.tsx`, replace this block:

```tsx
<section className="grid gap-6 xl:grid-cols-2">
  <TopProducts products={data.topProducts} />
  <RecentActivity activities={data.recentActivity} />
</section>
```

with:

```tsx
          <TopProducts products={data.topProducts} />

          <DashboardSectionCard
            title="Nhật ký hoạt động"
            description="Các thay đổi gần nhất trên toàn hệ thống"
          >
            <DashboardEmptyPanel
              title="Xem nhật ký đầy đủ"
              description="Hoạt động gần đây đã chuyển sang trang riêng, có bộ lọc theo loại và tìm kiếm."
              href="/dashboard/activity"
              action="Mở nhật ký hoạt động"
            />
          </DashboardSectionCard>
```

- [ ] **Step 2: Delete the now-orphaned RecentActivity component**

Delete the entire `function RecentActivity({ activities }: {...}) { ... }` declaration from the bottom of the file. It has no other callers.

- [ ] **Step 3: Remove orphaned imports**

`formatDateTime` and `Badge` may now be unused in this file. Run lint to find out and remove only what your change orphaned — do not remove pre-existing unused code.

```bash
pnpm lint
```

- [ ] **Step 4: Point money cards at the finance page**

Update these `href` values in the existing metric cards:

- `Tổng tiền order đã thu` → `/dashboard/finance?tab=platform`
- `Hoàn tiền sản phẩm` → `/dashboard/finance?tab=refunds`

Add `href="/dashboard/finance?tab=platform"` to the `Hoa hồng nền tảng đã ghi nhận` card, which currently has none.

- [ ] **Step 5: Verify**

```bash
pnpm ci:verify
```

Expected: format, lint, typecheck, unit tests and build all pass.

With `pnpm dev` running, open `http://localhost:3000/dashboard`. Expected:

1. `Hoạt động gần đây` table is gone.
2. `Sản phẩm nổi bật` spans the full width.
3. A card links to the activity page and the link works.
4. Clicking `Hoàn tiền sản phẩm` lands on the finance page with the refunds tab active.

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/components/admin-dashboard-view.tsx
git commit -m "refactor(dashboard): move recent activity to its own page and link money cards to finance"
```

---

## Final verification

- [ ] **Run the full gate**

```bash
pnpm ci:verify
```

- [ ] **Confirm the spec's non-negotiables hold**

1. No clinic-payable / "owed to clinics" figure exists anywhere in the UI — the guard test in Task 3 passes.
2. The `Khách thanh toán` node states that treatment revenue is excluded.
3. The truncation banner appears when either bounded fetch hits its 500-row cap. To test, temporarily set `FINANCE_ROW_CAP = 2` in `useAdminFinance.ts`, reload the finance page, confirm the banner, then restore it to `500`.
4. The activity page's 10-row notice is present and non-dismissible.

- [ ] **Push the branch**

```bash
git push -u origin feat/admin-finance-visibility
```
