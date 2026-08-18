# Admin Finance Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real transaction ledger at `/dashboard/ledger`, make the clinic-payable figure measured, and delete every phase-1 workaround now that the backend endpoints exist.

**Architecture:** Server-driven throughout. Four new backend endpoints replace the bounded client-side fetching, client CSV building, and client aggregation phase 1 was forced into. New `admin/ledger/` sub-feature follows the existing `api → hooks → components` layering; the finance and activity surfaces are re-based onto the real endpoints rather than rebuilt.

**Tech Stack:** Next.js 15 App Router, TypeScript, TanStack Query, shadcn/ui + Base UI primitives, Tailwind v4, recharts, vitest.

**Spec:** `docs/superpowers/specs/2026-08-17-admin-finance-phase2-design.md`

**Backend contract:** `../Be-Capstone/docs/admin-finance-flow.md` (endpoints already merged)

## Global Constraints

- Package manager is **pnpm**. Never npm or yarn. Dev server port is **3000**.
- **No `any`.** Use `unknown` plus narrowing, or a concrete type.
- **Three-layer rule:** UI never calls `apiClient` directly. UI → hooks → `*.api.ts`. `*.api.ts` files are dumb wrappers returning `AxiosResponse` (`docs/project-standards.md` §2).
- **Naming:** component files `kebab-case.tsx`; hook files `useCamelCase.ts`; constants `UPPER_SNAKE_CASE`.
- All TanStack Query keys are centralized in `src/lib/query/keys.ts`.
- All user-facing copy is **Vietnamese**.
- Admin surfaces use **semantic theme tokens** (`text-muted-foreground`, `bg-muted/20`, `border`). Do NOT use the hardcoded `slate-*`/`emerald-*` palette from `src/features/clinic-manager/components/`.
- `Select` is Base UI (`SelectPrimitive.Root`): it needs an `items` record (`Record<string,string>`) on the root **in addition to** `SelectItem` children, or the trigger shows the raw value.
- Conventional Commits with scope: `feat(admin-ledger): ...`, `refactor(admin-finance): ...`.
- **Ledger and balance amounts are strings; activity amounts are numbers.** Always coerce through the existing `parseVnd` from `src/features/admin/finance/lib/money.ts`. Never add a second coercion path.
- **THE SCOPE RULE (spec §5):** every figure in a period-scoped block comes from `/admin/dashboard` or from `/admin/transactions` with `from`/`to` applied. Every figure from `/admin/clinics/balances` renders only inside a block labelled as current position. Never place the two in one block or one row.
- **Never sum a paginated list client-side.** If a total is needed, it comes server-computed from `/admin/dashboard`, or it is a count from a response's `total`. This is the pattern the whole phase deletes.
- **`git status` shows ~529 modified files** — pure CRLF noise from `core.autocrlf=true`, zero content change, pre-existing. **Never `git add -A`**; stage only your own paths.
- If `pnpm typecheck` reports `RouteImpl` or `.next/dev/types/validator.ts` errors, that is a **stale build cache**: `rm -rf .next` and re-run. Never edit source to satisfy them.
- **The backend is running for this phase.** Verify against real data; do not claim a check you did not perform.

---

## File Structure

**New — ledger sub-feature:**

| File                                                      | Responsibility                                      |
| --------------------------------------------------------- | --------------------------------------------------- |
| `src/app/(admin)/dashboard/ledger/page.tsx`               | Route join point                                    |
| `src/features/admin/ledger/types/ledger.types.ts`         | `AdminTransaction`, enums, query + paginated shapes |
| `src/features/admin/ledger/api/admin-ledger.api.ts`       | Dumb wrapper: list + export                         |
| `src/features/admin/ledger/lib/transaction-meta.ts`       | type → Vietnamese label + badge variant             |
| `src/features/admin/ledger/lib/transaction-meta.test.ts`  | Coverage of all 9 types                             |
| `src/features/admin/ledger/hooks/useAdminLedger.ts`       | `useAdminTransactions`, `useExportLedgerCsv`        |
| `src/features/admin/ledger/components/ledger-filters.tsx` | The six-control filter bar                          |
| `src/features/admin/ledger/components/ledger-view.tsx`    | Filters + table + pagination                        |

**New — supporting API/hooks:**

| File                                                    | Responsibility                   |
| ------------------------------------------------------- | -------------------------------- |
| `src/features/admin/finance/api/admin-finance.api.ts`   | Clinic balances wrapper          |
| `src/features/admin/finance/hooks/useClinicBalances.ts` | Balances query                   |
| `src/features/admin/activity/api/admin-activity.api.ts` | Activity wrapper                 |
| `src/features/admin/activity/types/activity.types.ts`   | `AdminActivityItem`, query shape |
| `src/features/admin/activity/hooks/useAdminActivity.ts` | Activity query                   |

**Modified:** `core/api/endpoints.ts`, `config/site.ts`, `lib/query/keys.ts`, `dashboard/types/dashboard.types.ts`, `finance/types/finance.types.ts`, `finance/lib/flow.ts` + test, `finance/components/{finance-view,money-flow-summary,clinic-payouts-tab,refund-outflow-tab,platform-revenue-tab}.tsx`, `activity/lib/activity-meta.ts`, `activity/components/activity-log-view.tsx`.

**Deleted (Task 10):** `finance/lib/paged-fetch.ts` + test, `finance/lib/csv.ts` + test, `finance/lib/clinic-rollup.ts` + test, `finance/hooks/useAdminFinance.ts`.

---

### Task 1: Endpoints, ledger types, API wrappers, query keys

**Files:**

- Modify: `src/core/api/endpoints.ts`
- Modify: `src/lib/query/keys.ts`
- Create: `src/features/admin/ledger/types/ledger.types.ts`
- Create: `src/features/admin/ledger/api/admin-ledger.api.ts`
- Create: `src/features/admin/finance/api/admin-finance.api.ts`
- Create: `src/features/admin/activity/types/activity.types.ts`
- Create: `src/features/admin/activity/api/admin-activity.api.ts`

**Interfaces:**

- Consumes: `apiClient`, `API_ENDPOINTS`.
- Produces: `AdminTransaction`, `TransactionType`, `TransactionStatus`, `ListAdminTransactionsQuery`, `PaginatedAdminTransactions`, `ClinicBalance`, `PaginatedClinicBalances`, `AdminActivityItem`, `AdminActivityType`, `ListAdminActivityQuery`, `PaginatedAdminActivity`; `adminLedgerApi.{list,exportCsv}`, `adminFinanceApi.getClinicBalances`, `adminActivityApi.list`; query keys `adminTransactions`, `adminClinicBalances`, `adminActivity`.

- [ ] **Step 1: Add endpoint groups**

In `src/core/api/endpoints.ts`, add these three entries. Put `ADMIN_TRANSACTIONS` and `ADMIN_ACTIVITY` at the top level beside the other `ADMIN_*` groups, and `BALANCES` inside the existing `ADMIN_CLINICS` object:

```ts
  ADMIN_TRANSACTIONS: {
    LIST: "/admin/transactions",
    EXPORT: "/admin/transactions/export",
  },
  ADMIN_ACTIVITY: {
    LIST: "/admin/activity",
  },
```

and inside `ADMIN_CLINICS`:

```ts
    BALANCES: "/admin/clinics/balances",
```

- [ ] **Step 2: Create ledger types**

Create `src/features/admin/ledger/types/ledger.types.ts`:

```ts
/**
 * Mirrors GET /admin/transactions. Amounts are strings (Postgres bigint) —
 * always read them through parseVnd.
 */
export type TransactionType =
  | "PRODUCT_PURCHASE"
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "WALLET_TOPUP"
  | "REFUND"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REVERSAL"
  | "ESCROW_RELEASE"
  | "COMMISSION";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface AdminTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountVnd: string;
  fromAccount: string | null;
  toAccount: string | null;
  clinicId: string | null;
  clinicName: string | null;
  userId: string | null;
  userName: string | null;
  orderId: string | null;
  consultationId: string | null;
  treatmentId: string | null;
  treatmentPhaseId: string | null;
  escrowHoldId: string | null;
  withdrawalId: string | null;
  expertId: string | null;
  externalRef: string | null;
  note: string | null;
  createdAt: string;
}

export interface ListAdminTransactionsQuery {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  clinicId?: string;
  userId?: string;
  expertId?: string;
  orderId?: string;
  from?: string;
  to?: string;
  minAmountVnd?: number;
  maxAmountVnd?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminTransactions {
  items: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
}
```

- [ ] **Step 3: Create the ledger API wrapper**

Create `src/features/admin/ledger/api/admin-ledger.api.ts`:

```ts
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  ListAdminTransactionsQuery,
  PaginatedAdminTransactions,
} from "../types/ledger.types";

export const adminLedgerApi = {
  list: (
    query?: ListAdminTransactionsQuery,
  ): Promise<AxiosResponse<PaginatedAdminTransactions>> => {
    return apiClient.get<PaginatedAdminTransactions>(
      API_ENDPOINTS.ADMIN_TRANSACTIONS.LIST,
      { params: { page: 1, limit: 20, ...query } },
    );
  },

  exportCsv: (
    query?: Omit<ListAdminTransactionsQuery, "page" | "limit">,
  ): Promise<AxiosResponse<Blob>> => {
    return apiClient.get<Blob>(API_ENDPOINTS.ADMIN_TRANSACTIONS.EXPORT, {
      params: query,
      responseType: "blob",
    });
  },
};
```

- [ ] **Step 4: Create the balances API wrapper**

Create `src/features/admin/finance/api/admin-finance.api.ts`:

```ts
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

/** All figures here are point-in-time or all-time, never period-scoped. */
export interface ClinicBalance {
  clinicId: string;
  clinicName: string;
  balanceVnd: string;
  heldEscrowVnd: string;
  pendingWithdrawalsVnd: string;
  /** All-time, NOT period-scoped. */
  commissionEarnedVnd: string;
  lastPayoutAt: string | null;
}

export interface PaginatedClinicBalances {
  items: ClinicBalance[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicBalancesQuery {
  clinicId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminFinanceApi = {
  getClinicBalances: (
    query?: ListClinicBalancesQuery,
  ): Promise<AxiosResponse<PaginatedClinicBalances>> => {
    return apiClient.get<PaginatedClinicBalances>(
      API_ENDPOINTS.ADMIN_CLINICS.BALANCES,
      { params: { page: 1, limit: 20, ...query } },
    );
  },
};
```

- [ ] **Step 5: Create activity types and API wrapper**

Create `src/features/admin/activity/types/activity.types.ts`:

```ts
export type AdminActivityType =
  | "USER_CREATED"
  | "PRODUCT_PAYMENT"
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "REFUND"
  | "ORDER_CANCELLATION"
  | "STOCK_IMPORT"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED";

/** NOTE: amountVnd is a number here, unlike the ledger's string amounts. */
export interface AdminActivityItem {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string | null;
  amountVnd: number | null;
  actorId: string | null;
  actorName: string | null;
  entityId: string | null;
  occurredAt: string;
}

export interface ListAdminActivityQuery {
  type?: AdminActivityType[];
  from?: string;
  to?: string;
  actorId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminActivity {
  items: AdminActivityItem[];
  total: number;
  page: number;
  limit: number;
}
```

Create `src/features/admin/activity/api/admin-activity.api.ts`:

```ts
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  ListAdminActivityQuery,
  PaginatedAdminActivity,
} from "../types/activity.types";

export const adminActivityApi = {
  list: (
    query?: ListAdminActivityQuery,
  ): Promise<AxiosResponse<PaginatedAdminActivity>> => {
    return apiClient.get<PaginatedAdminActivity>(
      API_ENDPOINTS.ADMIN_ACTIVITY.LIST,
      {
        params: { page: 1, limit: 20, ...query },
        // `type` is an array. Axios's default array encoding is `type[]=A&type[]=B`,
        // but the backend runs Express 5 with the `simple` query parser (Node's
        // querystring), which reads that as the literal key "type[]" — so the filter
        // would be silently dropped by NestJS's whitelisting ValidationPipe.
        // `indexes: null` emits bare repeated keys: `type=A&type=B`.
        paramsSerializer: { indexes: null },
      },
    );
  },
};
```

- [ ] **Step 6: Add query keys**

In `src/lib/query/keys.ts`, add at the end of the object:

```ts
  adminTransactions: (query?: unknown) =>
    ["admin", "transactions", query ?? {}] as const,
  adminClinicBalances: (query?: unknown) =>
    ["admin", "clinic-balances", query ?? {}] as const,
  adminActivity: (query?: unknown) =>
    ["admin", "activity", query ?? {}] as const,
```

- [ ] **Step 7: Verify**

```bash
pnpm typecheck && pnpm lint
```

Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add src/core/api/endpoints.ts src/lib/query/keys.ts src/features/admin/ledger src/features/admin/finance/api src/features/admin/activity/api src/features/admin/activity/types
git commit -m "feat(admin-ledger): add endpoints, types and API wrappers for phase 2"
```

---

### Task 2: Transaction presentation map

**Files:**

- Create: `src/features/admin/ledger/lib/transaction-meta.ts`
- Create: `src/features/admin/ledger/lib/transaction-meta.test.ts`

**Interfaces:**

- Consumes: `TransactionType` (Task 1).
- Produces: `TRANSACTION_TYPE_LABELS: Record<TransactionType, string>`, `TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string>`, `transactionTypeLabel(type: string): string`, `transactionTypeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline"`.

This is the single place transaction types are enumerated for display. Spec R4: phase 1 only knew 7 of the 9 types, so a map missing entries renders raw enum strings to the operator. The test asserts full coverage.

- [ ] **Step 1: Write the failing test**

Create `src/features/admin/ledger/lib/transaction-meta.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "./transaction-meta"`.

- [ ] **Step 3: Write the implementation**

Create `src/features/admin/ledger/lib/transaction-meta.ts`:

```ts
import type { TransactionStatus, TransactionType } from "../types/ledger.types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * The single place transaction types are enumerated for display. All nine
 * values must appear — a missing entry renders a raw enum string to the
 * operator. See spec R4.
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  PRODUCT_PURCHASE: "Mua sản phẩm",
  CONSULTATION_PAYMENT: "Thanh toán tư vấn",
  TREATMENT_PLAN_PAYMENT: "Thanh toán phác đồ",
  WALLET_TOPUP: "Nạp ví",
  REFUND: "Hoàn tiền",
  WITHDRAWAL: "Rút tiền về ngân hàng",
  WITHDRAWAL_REVERSAL: "Hoàn ví (từ chối rút)",
  ESCROW_RELEASE: "Giải ngân escrow",
  COMMISSION: "Hoa hồng sàn",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Đang chờ",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn",
};

/** Money leaving the platform reads destructive; everything else is neutral. */
const OUTFLOW_TYPES = new Set<string>(["REFUND", "WITHDRAWAL"]);
const RETAINED_TYPES = new Set<string>(["COMMISSION"]);

export function transactionTypeLabel(type: string): string {
  return TRANSACTION_TYPE_LABELS[type as TransactionType] ?? type;
}

export function transactionTypeBadgeVariant(type: string): BadgeVariant {
  if (OUTFLOW_TYPES.has(type)) return "destructive";
  if (RETAINED_TYPES.has(type)) return "secondary";
  if (type in TRANSACTION_TYPE_LABELS) return "default";
  return "outline";
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/ledger/lib
git commit -m "feat(admin-ledger): add transaction type and status presentation map"
```

---

### Task 3: Ledger hooks, view, route and nav

**Files:**

- Create: `src/features/admin/ledger/hooks/useAdminLedger.ts`
- Create: `src/features/admin/ledger/components/ledger-filters.tsx`
- Create: `src/features/admin/ledger/components/ledger-view.tsx`
- Create: `src/app/(admin)/dashboard/ledger/page.tsx`
- Modify: `src/config/site.ts`

**Interfaces:**

- Consumes: Tasks 1 and 2; `parseVnd` from `@/features/admin/finance/lib/money`; `useAdminClinics` from `@/features/admin/hooks/useAdminClinics`; `DataTablePagination`; `DashboardSectionCard`, `DashboardEmptyPanel`, `formatCurrency`, `formatDateTime` from `@/features/dashboard/components/dashboard-shell`.
- Produces: `useAdminTransactions(query)`, `useExportLedgerCsv()`, `LedgerView`, `LedgerFilters`.

- [ ] **Step 1: Write the hooks**

Create `src/features/admin/ledger/hooks/useAdminLedger.ts`:

```ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { adminLedgerApi } from "../api/admin-ledger.api";
import type { ListAdminTransactionsQuery } from "../types/ledger.types";

export function useAdminTransactions(query: ListAdminTransactionsQuery) {
  return useQuery({
    queryKey: queryKeys.adminTransactions(query),
    queryFn: () => adminLedgerApi.list(query).then((res) => res.data),
  });
}

export function useExportLedgerCsv() {
  return useMutation({
    mutationFn: async (
      query: Omit<ListAdminTransactionsQuery, "page" | "limit">,
    ) => {
      const response = await adminLedgerApi.exportCsv(query);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "so-cai-giao-dich.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Không thể xuất file CSV. Vui lòng thử lại.");
    },
  });
}
```

- [ ] **Step 2: Write the filter bar**

Create `src/features/admin/ledger/components/ledger-filters.tsx`:

```tsx
"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAdminClinics } from "@/features/admin/hooks/useAdminClinics";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "../lib/transaction-meta";
import type {
  ListAdminTransactionsQuery,
  TransactionStatus,
  TransactionType,
} from "../types/ledger.types";

const TYPE_ITEMS: Record<string, string> = {
  ALL: "Tất cả loại giao dịch",
  ...TRANSACTION_TYPE_LABELS,
};

const STATUS_ITEMS: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  ...TRANSACTION_STATUS_LABELS,
};

export interface LedgerFilterState {
  search: string;
  type: string;
  status: string;
  clinicId: string;
  from: string;
  to: string;
}

export const EMPTY_LEDGER_FILTERS: LedgerFilterState = {
  search: "",
  type: "ALL",
  status: "ALL",
  clinicId: "ALL",
  from: "",
  to: "",
};

/** Turns UI state into the query the endpoint expects, dropping "ALL"/empty. */
export function toLedgerQuery(
  state: LedgerFilterState,
): Omit<ListAdminTransactionsQuery, "page" | "limit"> {
  return {
    search: state.search.trim() || undefined,
    type: state.type === "ALL" ? undefined : (state.type as TransactionType),
    status:
      state.status === "ALL" ? undefined : (state.status as TransactionStatus),
    clinicId: state.clinicId === "ALL" ? undefined : state.clinicId,
    from: state.from || undefined,
    to: state.to || undefined,
  };
}

export function LedgerFilters({
  value,
  onChange,
}: {
  value: LedgerFilterState;
  onChange: (next: LedgerFilterState) => void;
}) {
  const { data: clinicsRes } = useAdminClinics();

  const clinicItems: Record<string, string> = {
    ALL: "Tất cả phòng khám",
    ...Object.fromEntries(
      (clinicsRes?.items ?? []).map((clinic: { id: string; name?: string }) => [
        clinic.id,
        clinic.name ?? `#${clinic.id.slice(0, 8)}`,
      ]),
    ),
  };

  const set = (patch: Partial<LedgerFilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ledger-search" className="text-xs">
          Tìm kiếm
        </Label>
        <Input
          id="ledger-search"
          placeholder="Ghi chú, mã tham chiếu, mã giao dịch..."
          value={value.search}
          onChange={(event) => set({ search: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Loại giao dịch</Label>
        <Select
          value={value.type}
          items={TYPE_ITEMS}
          onValueChange={(next) => set({ type: next || "ALL" })}
        >
          <SelectTrigger aria-label="Lọc theo loại giao dịch">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_ITEMS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Trạng thái</Label>
        <Select
          value={value.status}
          items={STATUS_ITEMS}
          onValueChange={(next) => set({ status: next || "ALL" })}
        >
          <SelectTrigger aria-label="Lọc theo trạng thái">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_ITEMS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Phòng khám</Label>
        <Select
          value={value.clinicId}
          items={clinicItems}
          onValueChange={(next) => set({ clinicId: next || "ALL" })}
        >
          <SelectTrigger aria-label="Lọc theo phòng khám">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(clinicItems).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ledger-from" className="text-xs">
          Từ ngày
        </Label>
        <Input
          id="ledger-from"
          type="date"
          value={value.from}
          onChange={(event) => set({ from: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ledger-to" className="text-xs">
          Đến ngày
        </Label>
        <Input
          id="ledger-to"
          type="date"
          value={value.to}
          onChange={(event) => set({ to: event.target.value })}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the ledger view**

Create `src/features/admin/ledger/components/ledger-view.tsx`:

```tsx
"use client";

import * as React from "react";
import { Download, Loader2, ReceiptText } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
  DashboardError,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import useDebounce from "@/shared/hooks/useDebounce";
import { parseVnd } from "@/features/admin/finance/lib/money";
import {
  EMPTY_LEDGER_FILTERS,
  LedgerFilters,
  toLedgerQuery,
  type LedgerFilterState,
} from "./ledger-filters";
import {
  useAdminTransactions,
  useExportLedgerCsv,
} from "../hooks/useAdminLedger";
import {
  TRANSACTION_STATUS_LABELS,
  transactionTypeBadgeVariant,
  transactionTypeLabel,
} from "../lib/transaction-meta";
import type { AdminTransaction } from "../types/ledger.types";

const PAGE_SIZE = 20;

export function LedgerView() {
  const [filters, setFilters] =
    React.useState<LedgerFilterState>(EMPTY_LEDGER_FILTERS);
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebounce(filters.search.trim(), 350);

  const query = React.useMemo(
    () => toLedgerQuery({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  // Any filter change invalidates the current page number.
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const transactions = useAdminTransactions({
    ...query,
    page,
    limit: PAGE_SIZE,
  });
  const exportCsv = useExportLedgerCsv();

  const items = transactions.data?.items ?? [];
  const total = transactions.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
            GlowScan Operations
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <ReceiptText className="size-6" /> Sổ cái giao dịch
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Toàn bộ giao dịch trên nền tảng. Lọc theo loại, trạng thái, phòng
            khám và khoảng thời gian.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button
            variant="outline"
            onClick={() => exportCsv.mutate(query)}
            disabled={exportCsv.isPending}
          >
            {exportCsv.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            Xuất CSV
          </Button>
          <p className="text-muted-foreground text-xs">
            File CSV sắp xếp cũ nhất trước, tối đa 10.000 dòng.
          </p>
        </div>
      </header>

      <DashboardSectionCard
        title="Giao dịch"
        description={`${total.toLocaleString("vi-VN")} giao dịch khớp bộ lọc`}
      >
        <div className="mb-4">
          <LedgerFilters value={filters} onChange={setFilters} />
        </div>

        {transactions.isError ? (
          <DashboardError retry={() => void transactions.refetch()} />
        ) : items.length === 0 && !transactions.isPending ? (
          <DashboardEmptyPanel
            title="Không có giao dịch"
            description="Không có giao dịch nào khớp bộ lọc hiện tại."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Đối tác</TableHead>
                  <TableHead>Liên kết</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transactionTypeBadgeVariant(item.type)}>
                        {transactionTypeLabel(item.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {TRANSACTION_STATUS_LABELS[item.status] ?? item.status}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(parseVnd(item.amountVnd))}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Counterparty item={item} />
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">
                      <Linkage item={item} />
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-56 truncate text-xs">
                      {item.note ?? item.externalRef ?? "—"}
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
    </main>
  );
}

function Counterparty({ item }: { item: AdminTransaction }) {
  if (item.clinicName) return <span>{item.clinicName}</span>;
  if (item.userName) return <span>{item.userName}</span>;
  if (item.clinicId) return <span>#{item.clinicId.slice(0, 8)}</span>;
  if (item.userId) return <span>#{item.userId.slice(0, 8)}</span>;
  return <span className="text-muted-foreground">—</span>;
}

/**
 * The FK set on a row is what makes it auditable — and for a REFUND it is also
 * what says which kind of refund it is (order / consultation / treatment).
 */
function Linkage({ item }: { item: AdminTransaction }) {
  const links: string[] = [];
  if (item.orderId) links.push(`Đơn: #${item.orderId.slice(0, 8)}`);
  if (item.consultationId)
    links.push(`Tư vấn: #${item.consultationId.slice(0, 8)}`);
  if (item.treatmentId) links.push(`Phác đồ: #${item.treatmentId.slice(0, 8)}`);
  if (item.withdrawalId)
    links.push(`Rút tiền: #${item.withdrawalId.slice(0, 8)}`);

  if (links.length === 0)
    return <span className="text-muted-foreground">—</span>;

  return (
    <span className="flex flex-col">
      {links.map((link) => (
        <span key={link}>{link}</span>
      ))}
      {item.fromAccount && item.toAccount ? (
        <span className="text-muted-foreground">
          {item.fromAccount} → {item.toAccount}
        </span>
      ) : null}
    </span>
  );
}
```

- [ ] **Step 4: Write the route**

Create `src/app/(admin)/dashboard/ledger/page.tsx`:

```tsx
import { LedgerView } from "@/features/admin/ledger/components/ledger-view";

export const metadata = {
  title: "Sổ cái giao dịch",
};

export default function LedgerPage() {
  return <LedgerView />;
}
```

- [ ] **Step 5: Add the nav entry**

In `src/config/site.ts`, inside `siteConfig.dashboard.navMain`, insert directly after the `Dòng tiền & Đối soát` entry:

```ts
      {
        title: "Sổ cái giao dịch",
        url: "/dashboard/ledger",
        icon: "ReceiptText",
      },
```

`ReceiptText` is already registered in `IconMap` in `app-sidebar.tsx` — do not modify that file.

- [ ] **Step 6: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Then, with the backend running and `pnpm dev`, open `http://localhost:3000/dashboard/ledger`:

1. `Sổ cái giao dịch` appears in the sidebar and the table loads real rows.
2. Selecting a type filters the rows and the count in the card description updates.
3. Setting a date range narrows results; clearing it restores them.
4. Paging works and the page resets to 1 when a filter changes.
5. `Xuất CSV` downloads `so-cai-giao-dich.csv` and it opens in Excel with Vietnamese intact.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin/ledger src/app/\(admin\)/dashboard/ledger src/config/site.ts
git commit -m "feat(admin-ledger): add transaction ledger page with server-side filters and CSV export"
```

---

### Task 4: Treatment metrics and the corrected flow math

**Files:**

- Modify: `src/features/dashboard/types/dashboard.types.ts`
- Modify: `src/features/admin/finance/types/finance.types.ts`
- Modify: `src/features/admin/finance/lib/flow.ts`
- Modify: `src/features/admin/finance/lib/flow.test.ts`

**Interfaces:**

- Consumes: `AdminDashboardResponse["metrics"]`.
- Produces: `MoneyFlow` with `treatmentPaymentsVnd`, `treatmentRefundsVnd`, `clinicAccruedVnd`; `buildMoneyFlow(metrics): MoneyFlow` — **note the signature loses its second parameter**, since payouts are no longer derived from a withdrawal list.

This task inverts phase 1's regression guard. That guard existed because the payable figure was not derivable; it now is (spec §4), so the test asserts the field exists and satisfies the identity instead.

- [ ] **Step 1: Add the treatment fields to the dashboard types**

In `src/features/dashboard/types/dashboard.types.ts`, add to `AdminDashboardResponse["metrics"]`, directly after `consultationRefundsVnd`:

```ts
treatmentPaymentsCollectedVnd: number;
treatmentRefundsVnd: number;
```

and add the same two lines to each element of the `trend` array type, after its `consultationRefundsVnd`.

- [ ] **Step 2: Rewrite the finance types**

Replace the whole contents of `src/features/admin/finance/types/finance.types.ts` with:

```ts
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
```

`RefundTotals`, `RefundReconciliation`, `ClinicPayoutRollup` and `BoundedFetchResult` are deleted — they have no consumer after this phase.

- [ ] **Step 3: Write the failing test**

Replace the whole contents of `src/features/admin/finance/lib/flow.test.ts` with:

```ts
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
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `buildMoneyFlow` still requires two arguments and returns no `clinicAccruedVnd`.

- [ ] **Step 5: Rewrite `flow.ts`**

Replace the whole contents of `src/features/admin/finance/lib/flow.ts` with:

```ts
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
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS. Other suites will now fail to typecheck because consumers still call the old signature — that is expected and Task 5 onward fixes them. `pnpm test:unit` itself must be green.

- [ ] **Step 7: Commit**

```bash
git add src/features/dashboard/types/dashboard.types.ts src/features/admin/finance/types/finance.types.ts src/features/admin/finance/lib/flow.ts src/features/admin/finance/lib/flow.test.ts
git commit -m "feat(admin-finance): derive clinic payable from complete treatment metrics"
```

---

### Task 5: Flow header becomes a single waterfall

**Files:**

- Modify: `src/features/admin/finance/components/money-flow-summary.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `MoneyFlow` (Task 4).
- Produces: `MoneyFlowSummary({ flow, onNavigate })` — **the `reconciliation` prop is removed.**

- [ ] **Step 1: Rewrite the summary component's body**

In `money-flow-summary.tsx`:

1. Remove the `reconciliation` prop and its whole "Đối soát hoàn tiền sản phẩm" block, and drop the `RefundReconciliation` import.
2. Delete the `UnavailableNode` function entirely and its `AlertTriangle` import if nothing else uses it.
3. Delete the second block (`Đã chuyển cho phòng khám`) and its caption — payouts are no longer a separate measured block.
4. Replace the node grid with a single four-node waterfall:

```tsx
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <FlowNode
    icon={ArrowUpRight}
    label="Khách thanh toán"
    value={flow.inflowVnd}
    hint="Sản phẩm + tư vấn + phác đồ"
  />
  <FlowNode
    icon={ArrowDownRight}
    label="Hoàn tiền"
    value={flow.refundsOutVnd}
    hint="Toàn bộ hoàn tiền trong kỳ"
    onClick={() => onNavigate("refunds")}
  />
  <FlowNode
    icon={Wallet}
    label="Hoa hồng nền tảng"
    value={flow.commissionRetainedVnd}
    hint="Phần GlowScan giữ lại"
    onClick={() => onNavigate("platform")}
  />
  <FlowNode
    icon={Building2}
    label="Về phòng khám"
    value={flow.clinicAccruedVnd}
    hint="Doanh thu dịch vụ sau hoàn tiền và hoa hồng"
    onClick={() => onNavigate("clinics")}
  />
</div>
```

Import `Building2` from `lucide-react`.

5. Remove the `partial` prop from `FlowNode` and its "Chưa gồm doanh thu phác đồ điều trị" rendering — inflow is complete now.

- [ ] **Step 2: Update the finance view**

In `finance-view.tsx`:

1. `buildMoneyFlow(data.metrics)` — one argument now.
2. Delete the `reconciliation` memo, stop passing the `reconciliation` prop, and drop the `reconcileRefunds` import.

**Change nothing else in this file.** In particular: leave `useAllClinicWithdrawals`, `useAllCancellations`, the `withdrawalsInRange` / `cancellationsInRange` memos, the truncation banner and the existing tab props exactly as they are. They still compile and still work; each tab's own task removes its own consumer, and Task 10 deletes the modules once nothing imports them.

This keeps every task independently green. Ripping the data layer out here would leave the tabs uncompilable until Task 8, which would make Tasks 5–7 unreviewable in isolation.

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Expected: all pass. With the backend running, `/dashboard/finance` shows a single four-node waterfall with a real `Về phòng khám` figure, and the reconciliation row is gone.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/finance/components/money-flow-summary.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "refactor(admin-finance): collapse flow header into a single waterfall with real payable"
```

---

### Task 6: Clinic tab — current position and period activity

**Files:**

- Create: `src/features/admin/finance/hooks/useClinicBalances.ts`
- Modify: `src/features/admin/finance/components/clinic-payouts-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `adminFinanceApi.getClinicBalances` (Task 1), `useAdminTransactions` (Task 3), `parseVnd`.
- Produces: `useClinicBalances(query)`, `ClinicPayoutsTab({ from, to })`.

**This task is where spec §5 is most likely to break.** The two blocks must stay visually and structurally separate, and no row may place a balance figure beside a period figure.

- [ ] **Step 1: Write the balances hook**

Create `src/features/admin/finance/hooks/useClinicBalances.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  adminFinanceApi,
  type ListClinicBalancesQuery,
} from "../api/admin-finance.api";

export function useClinicBalances(query: ListClinicBalancesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.adminClinicBalances(query),
    queryFn: () =>
      adminFinanceApi.getClinicBalances(query).then((res) => res.data),
  });
}
```

- [ ] **Step 2: Rewrite the clinic tab**

Replace `clinic-payouts-tab.tsx` with a component taking `{ from, to }` (the dashboard period) and rendering two clearly separate `DashboardSectionCard`s:

**Block 1 — `Tình trạng hiện tại`**, from `useClinicBalances`. Description must state these are current values, not period figures: `"Số dư hiện tại của từng phòng khám — không phải số liệu của kỳ đang chọn"`. Columns: Phòng khám, Số dư khả dụng, Tạm giữ (escrow), Chờ duyệt rút, Hoa hồng đã thu (lũy kế), Lần chi gần nhất. Amounts via `formatCurrency(parseVnd(...))`, `lastPayoutAt` via `formatDateTime` or `—`. Selecting a row sets `selectedClinicId`, using the same keyboard-accessible clickable-row pattern already in this file (shared `toggle`/`select` handler used by both `onClick` and `onKeyDown` with `preventDefault` on Space, `tabIndex={0}`, `role="button"`, Vietnamese `aria-label`).

**Block 2 — `Hoạt động trong kỳ`**, rendered only when a clinic is selected, from `useAdminTransactions({ clinicId: selectedClinicId, from, to, page, limit: 20 })`. Title includes the clinic name. Columns: Thời gian, Loại, Số tiền, Ghi chú — reusing `transactionTypeLabel` and `transactionTypeBadgeVariant` from `@/features/admin/ledger/lib/transaction-meta`. Include `DataTablePagination`. When no clinic is selected, render a `DashboardEmptyPanel` with `"Chọn một phòng khám"` / `"Chọn một phòng khám ở bảng trên để xem các giao dịch trong kỳ."`.

Add a link button in block 2's header to the full ledger for that clinic: `/dashboard/ledger` — since the ledger owns arbitrary date ranges, this is the escape hatch when the period selector is too narrow.

- [ ] **Step 3: Wire into the finance view**

In `finance-view.tsx`, render `<ClinicPayoutsTab from={data.period.from} to={data.period.to} />` in the `clinics` tab.

Now that nothing consumes withdrawals, also remove from this file: the `useAllClinicWithdrawals()` call, the `withdrawalsInRange` memo, and the `filterWithdrawalsByRange` import. Leave the cancellations hook, the `cancellationsInRange` memo and the truncation banner alone — Task 7 owns those. Update the `truncated` expression to reference only the cancellations query so it still compiles.

- [ ] **Step 4: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

With the backend running:

1. The current-position table lists clinics with real balances.
2. Its description explicitly says these are not period figures.
3. Selecting a clinic loads that clinic's transactions for the selected period.
4. Changing the range selector changes block 2's rows but **not** block 1's figures — that is the scope rule working.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/finance/hooks/useClinicBalances.ts src/features/admin/finance/components/clinic-payouts-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "feat(admin-finance): split clinic tab into current position and period activity"
```

---

### Task 7: Refund tab re-based on server figures

**Files:**

- Modify: `src/features/admin/finance/components/refund-outflow-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `MoneyFlow` (Task 4), `useOrderCancellations` from `@/features/admin/cancellations/hooks/useCancellations` (note: the file is `useCancellations.ts` but the export is `useOrderCancellations`; it returns unwrapped `{items,total,page,limit}` and polls every 10s).
- Produces: `RefundOutflowTab({ flow })`.

- [ ] **Step 1: Replace the summary strip**

The strip becomes two labelled groups.

**Period group** — three `DashboardMetricCard`s straight from `flow`, no client computation: `flow.productRefundsVnd` ("Hoàn tiền sản phẩm"), `flow.consultationRefundsVnd` ("Hoàn phí tư vấn"), `flow.treatmentRefundsVnd` ("Hoàn phí phác đồ"). Group caption: `"Trong kỳ đang chọn"`.

**Current group** — two cards showing **counts, not amounts**, from the `total` of two status-filtered cancellation queries:

```tsx
const inFlight = useOrderCancellations({
  status: "REFUNDING",
  page: 1,
  limit: 1,
});
const stuck = useOrderCancellations({ status: "FAILED", page: 1, limit: 1 });
```

Render `inFlight.data?.total ?? 0` as "Đang hoàn tiền" and `stuck.data?.total ?? 0` as "Đang kẹt (lỗi)", both suffixed `" yêu cầu"`. Group caption: `"Trạng thái hiện tại, không phụ thuộc kỳ"`. `limit: 1` is deliberate — only `total` is used, so there is no reason to transfer rows.

- [ ] **Step 2: Keep the table, drop the prop**

The existing paginated `/admin/order-cancellations` table stays exactly as is, including the detail modal and the keyboard-accessible rows. Remove the `allCancellations` prop and every use of `buildRefundTotals`.

- [ ] **Step 3: Wire into the finance view and remove the last bounded fetch**

`<RefundOutflowTab flow={flow} />` in the `refunds` tab.

Cancellations were the last consumer of the bounded fetching, so now remove from `finance-view.tsx`: the `useAllCancellations()` call, the `cancellationsInRange` memo, the `filterCancellationsByRange` import, the `truncated` computation, the whole truncation `Alert` block, and the `FINANCE_ROW_CAP` / `AlertTriangle` / `Alert` imports if nothing else in the file uses them. `isPending` and `isError` now depend only on the dashboard query.

**Nothing truncates any more**, so a banner saying otherwise would be a false statement on screen.

- [ ] **Step 4: Verify**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

With the backend running: the three period cards change when the range selector moves; the two count cards do **not**; the table still paginates and its rows still open the detail modal.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/finance/components/refund-outflow-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "refactor(admin-finance): source refund figures from server metrics and status counts"
```

---

### Task 8: Platform tab gains the service-revenue breakdown

**Files:**

- Modify: `src/features/admin/finance/components/platform-revenue-tab.tsx`
- Modify: `src/features/admin/finance/components/finance-view.tsx`

**Interfaces:**

- Consumes: `AdminDashboardResponse`, `MoneyFlow`.
- Produces: `PlatformRevenueTab({ data, flow })`.

- [ ] **Step 1: Add the service-revenue block**

Between the existing metric cards and the `Cấu trúc tiền hàng` block, add a new `DashboardSectionCard` titled `Doanh thu dịch vụ` with description `Tư vấn và phác đồ — phần sinh ra hoa hồng`, containing four `Figure` cards reusing the existing local `Figure` component:

- `Phí tư vấn đã thu` → `flow.consultationFeesVnd`
- `Hoàn phí tư vấn` → `flow.consultationRefundsVnd`
- `Thanh toán phác đồ` → `flow.treatmentPaymentsVnd`
- `Hoàn phí phác đồ` → `flow.treatmentRefundsVnd`

Treatment revenue was invisible to admin before this backend change; this block is where it becomes visible.

- [ ] **Step 2: Wire into the finance view**

`<PlatformRevenueTab data={data} flow={flow} />`.

- [ ] **Step 3: Verify — this task must end with a green build**

```bash
pnpm ci:verify
```

Expected: exit 0. All three tabs render; no tab renders `null`.

With the backend running, open `/dashboard/finance` and confirm all four flow nodes and all three tabs show real data.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/finance/components/platform-revenue-tab.tsx src/features/admin/finance/components/finance-view.tsx
git commit -m "feat(admin-finance): surface consultation and treatment revenue on the platform tab"
```

---

### Task 9: Activity page becomes server-driven

**Files:**

- Create: `src/features/admin/activity/hooks/useAdminActivity.ts`
- Modify: `src/features/admin/activity/lib/activity-meta.ts`
- Modify: `src/features/admin/activity/components/activity-log-view.tsx`

**Interfaces:**

- Consumes: `adminActivityApi.list`, `AdminActivityType` (Task 1).
- Produces: `useAdminActivity(query)`, `ACTIVITY_TYPE_LABELS: Record<AdminActivityType, string>`, `activityMetaFor(type: string)` (unchanged signature, now keyed on the published vocabulary).

- [ ] **Step 1: Write the hook**

Create `src/features/admin/activity/hooks/useAdminActivity.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { adminActivityApi } from "../api/admin-activity.api";
import type { ListAdminActivityQuery } from "../types/activity.types";

export function useAdminActivity(query: ListAdminActivityQuery) {
  return useQuery({
    queryKey: queryKeys.adminActivity(query),
    queryFn: () => adminActivityApi.list(query).then((res) => res.data),
  });
}
```

- [ ] **Step 2: Write the failing test for the activity type map**

Create `src/features/admin/activity/lib/activity-meta.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `ACTIVITY_TYPE_LABELS` and `activityTypeLabel` do not exist yet.

- [ ] **Step 4: Replace the regex rules with the published vocabulary**

Rewrite `activity-meta.ts`. The backend now publishes the exact type list, so substring matching is no longer a guess — replace `RULES` with an explicit map keyed by `AdminActivityType`, and add labels. Keep `activityMetaFor`'s signature and its neutral fallback for a type the backend adds later.

```ts
import {
  Banknote,
  Boxes,
  CircleDot,
  PackagePlus,
  ShoppingBag,
  Stethoscope,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { AdminActivityType } from "../types/activity.types";

export interface ActivityMeta {
  icon: LucideIcon;
  /** Filtered list page — entityId is not routable for every type. */
  href: string | null;
}

export const ACTIVITY_TYPE_LABELS: Record<AdminActivityType, string> = {
  USER_CREATED: "Tài khoản mới",
  PRODUCT_PAYMENT: "Thanh toán đơn hàng",
  CONSULTATION_PAYMENT: "Thanh toán tư vấn",
  TREATMENT_PLAN_PAYMENT: "Thanh toán phác đồ",
  REFUND: "Hoàn tiền",
  ORDER_CANCELLATION: "Hủy đơn hàng",
  STOCK_IMPORT: "Phiếu nhập kho",
  WITHDRAWAL_REQUESTED: "Yêu cầu rút tiền",
  WITHDRAWAL_PAID: "Đã chi trả rút tiền",
  WITHDRAWAL_REJECTED: "Từ chối rút tiền",
};

const META: Record<AdminActivityType, ActivityMeta> = {
  USER_CREATED: { icon: UserPlus, href: "/dashboard/users" },
  PRODUCT_PAYMENT: { icon: ShoppingBag, href: "/dashboard/commerce" },
  CONSULTATION_PAYMENT: { icon: Stethoscope, href: "/dashboard/ledger" },
  TREATMENT_PLAN_PAYMENT: { icon: Stethoscope, href: "/dashboard/ledger" },
  REFUND: { icon: Boxes, href: "/dashboard/finance?tab=refunds" },
  ORDER_CANCELLATION: { icon: Boxes, href: "/dashboard/cancellations" },
  STOCK_IMPORT: { icon: PackagePlus, href: "/dashboard/stock-imports" },
  WITHDRAWAL_REQUESTED: {
    icon: Banknote,
    href: "/dashboard/clinic-withdrawals",
  },
  WITHDRAWAL_PAID: { icon: Banknote, href: "/dashboard/finance?tab=clinics" },
  WITHDRAWAL_REJECTED: {
    icon: Banknote,
    href: "/dashboard/clinic-withdrawals",
  },
};

const FALLBACK: ActivityMeta = { icon: CircleDot, href: null };

export function activityMetaFor(type: string): ActivityMeta {
  return META[type as AdminActivityType] ?? FALLBACK;
}

export function activityTypeLabel(type: string): string {
  return ACTIVITY_TYPE_LABELS[type as AdminActivityType] ?? type;
}
```

`Stethoscope` is already imported elsewhere in the codebase and exists in `lucide-react`.

- [ ] **Step 5: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS.

- [ ] **Step 6: Rewrite the activity view**

In `activity-log-view.tsx`:

1. Replace `useAdminDashboard(range)` with `useAdminActivity({ type, from, to, page, limit: 20 })`.
2. Replace the range `Select` with two date inputs (`Từ ngày` / `Đến ngày`) plus a type `Select` whose items come from `ACTIVITY_TYPE_LABELS` with an `ALL` entry — the options are now the published vocabulary, not values derived from the data.
3. Delete the client-side `filtered` memo, the `typeItems` derivation and the free-text search — filtering is server-side now. Keep the `vnDayKey` grouping and `formatDate` heading exactly as they are.
4. **Delete the permanent 10-row `Alert`.** The ceiling it disclosed no longer exists; leaving it would be a false statement on screen.
5. Add `DataTablePagination` below the grouped list, and reset `page` to 1 whenever a filter changes.
6. Render `actorName` on each row when present (`"bởi {actorName}"`), since attribution is new information the old feed could not show.
7. Use `activityTypeLabel(activity.type)` for the row badge rather than `activity.title` — `title` stays as the row's descriptive line.

- [ ] **Step 7: Verify**

```bash
pnpm ci:verify
```

With the backend running, open `/dashboard/activity`:

1. More than 10 rows are reachable via pagination.
2. Filtering by type narrows results server-side, and the total updates.
3. A date range narrows results.
4. The old "10 hoạt động gần nhất" notice is gone.
5. Rows show `actorName` where the backend supplies one.

- [ ] **Step 8: Commit**

```bash
git add src/features/admin/activity
git commit -m "feat(admin-activity): drive the activity log from the paginated endpoint"
```

---

### Task 10: Delete the phase-1 workarounds

**Files:**

- Delete: `src/features/admin/finance/lib/paged-fetch.ts`, `paged-fetch.test.ts`
- Delete: `src/features/admin/finance/lib/csv.ts`, `csv.test.ts`
- Delete: `src/features/admin/finance/lib/clinic-rollup.ts`, `clinic-rollup.test.ts`
- Delete: `src/features/admin/finance/hooks/useAdminFinance.ts`
- Modify: `src/lib/query/keys.ts`

Leaving a bounded fetch beside a server-paginated one invites the next contributor to use the wrong one, so removal is a requirement rather than tidying.

- [ ] **Step 1: Confirm nothing references them**

```bash
grep -rn "paged-fetch\|fetchAllPages\|clinic-rollup\|rollupByClinic\|withdrawalDateFor\|filterWithdrawalsByRange\|filterCancellationsByRange\|useAllClinicWithdrawals\|useAllCancellations\|FINANCE_ROW_CAP\|FINANCE_PAGE_SIZE\|BoundedFetchResult\|buildRefundTotals\|reconcileRefunds\|finance/lib/csv" src/
```

Expected: no matches. If any appear, fix that call site first — do not delete a file something still imports.

- [ ] **Step 2: Delete the files**

```bash
git rm src/features/admin/finance/lib/paged-fetch.ts src/features/admin/finance/lib/paged-fetch.test.ts src/features/admin/finance/lib/csv.ts src/features/admin/finance/lib/csv.test.ts src/features/admin/finance/lib/clinic-rollup.ts src/features/admin/finance/lib/clinic-rollup.test.ts src/features/admin/finance/hooks/useAdminFinance.ts
```

- [ ] **Step 3: Remove the dead query keys**

In `src/lib/query/keys.ts`, delete `adminClinicWithdrawalsAll` and `adminCancellationsAll`. Leave `adminCancellations` — `useOrderCancellations` uses it.

- [ ] **Step 4: Verify**

```bash
pnpm ci:verify
```

Expected: exit 0. The unit suite is now `money.test.ts`, `flow.test.ts` and `transaction-meta.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add -u src/features/admin/finance src/lib/query/keys.ts
git commit -m "refactor(admin-finance): delete bounded fetching, client CSV and client rollup"
```

---

## Final verification

- [ ] **Full gate**

```bash
pnpm ci:verify
```

- [ ] **Confirm the spec's non-negotiables hold, against the running backend**

1. `/dashboard/ledger` lists real transactions, all filters work server-side, CSV downloads.
2. The flow header is one waterfall with a real `Về phòng khám` figure, and the four nodes add up: inflow − refunds − commission − payable equals product payments minus product refunds.
3. Moving the finance page's range selector changes every period figure and **no** balance figure.
4. `/dashboard/activity` pages past 10 rows.
5. `grep -rn "BoundedFetchResult\|fetchAllPages\|rollupByClinic" src/` returns nothing.

- [ ] **Push**

```bash
git push
```
