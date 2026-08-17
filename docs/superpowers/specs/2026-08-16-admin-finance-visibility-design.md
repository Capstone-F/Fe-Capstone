# Admin finance visibility & activity log — design

**Date:** 2026-08-16
**Status:** Approved, ready for implementation planning
**Scope:** `capstone-fe` only. No `Be-Capstone` changes in this phase.

---

## 1. Problem

The platform admin is the only role that can see the whole money flow, and the only
role with no transaction-level view of it.

Today admin money surfaces are all aggregate:

| Surface                                                      | What it shows                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `src/features/dashboard/components/admin-dashboard-view.tsx` | 13 metric cards, 2 area charts, top-5 products, last-10 activity table — all from one `GET /admin/dashboard` |
| `src/features/admin/components/commerce-wallet-view.tsx`     | Combo discount %, platform commission %, per-customer wallet balance + manual top-up                         |
| `src/features/admin/components/clinic-withdrawals-view.tsx`  | Payout approval queue                                                                                        |

Meanwhile the clinic manager has a real ledger —
`src/features/clinic-manager/components/clinic-statement-view.tsx` — with
type/expert/date/search filters, pagination and CSV export over
`GET /clinic/transactions`.

The gap matters because an aggregate that cannot be drilled into is unauditable: when
a number looks wrong, there is nothing behind it to check.

Secondary ask: the 10-row "Hoạt động gần đây" panel on the admin dashboard should
become its own sidebar destination with proper display and filters.

---

## 2. Constraint and what it costs us

**This phase is frontend-only, against endpoints that already exist.** That is a
deliberate decision, not an oversight, and it has consequences that must stay visible
in the UI rather than being papered over.

### Complete admin-accessible API inventory

| Endpoint                                                                      | Payload                                                                                                                               | Server-side filters                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `GET /admin/dashboard?range=7d\|30d\|90d`                                     | metrics, attention counters, daily trend, funnel, top-5 products, **10 most recent activities**                                       | `range` only                          |
| `GET /admin/clinic-withdrawals`                                               | clinic, amount, status, bank snapshot, `processedByUserId`, `processedAt`, `transferRef`, `debitTransactionId`, `refundTransactionId` | `clinicId`, `status`, `page`, `limit` |
| `GET /admin/order-cancellations`                                              | `orderId`, `refundAmountVnd`, status, items, `attempts`, `lastError`                                                                  | `status`, `page`, `limit`             |
| `GET /admin/wallets/:userId`                                                  | one customer's balance — no history                                                                                                   | single user                           |
| `GET /admin/commerce-settings/platform-commission` · `/survey-combo-discount` | current rates                                                                                                                         | —                                     |
| `GET /admin/clinics` · `/users` · `/experts`                                  | counterparty directories (id → name)                                                                                                  | yes                                   |

**There is no platform-wide transaction endpoint for admin.**
`/clinic/transactions` is scoped to the caller's own `clinicId` and is not callable by
an admin.

### What this makes buildable, and what it does not

| Capability                                        | Status                                           |
| ------------------------------------------------- | ------------------------------------------------ |
| Per-clinic payout ledger (aggregate → line items) | Buildable — new capability                       |
| Refund outflow ledger, incl. stuck refunds        | Buildable — new capability                       |
| Platform commission earned + rate context         | Buildable from aggregates                        |
| Cross-source reconciliation of refunds            | Buildable — new capability                       |
| Escrow held **per clinic**                        | Not available — platform totals only             |
| Commission earned **per clinic**                  | Not available — platform totals only             |
| Amount **owed to clinics** (payable)              | Not available — not derivable, see §5.4          |
| Treatment plan revenue (any granularity)          | Not available — no admin metric exists, see §5.4 |
| Customer spend history                            | Not available — balance only, one user at a time |
| Paginated / filterable activity log               | Not available — source capped at 10 rows         |

Section 8 specifies the endpoints that would close these gaps.

---

## 3. Goals / non-goals

**Goals**

1. Give admin a money-flow view organised by counterparty, where every figure links to
   the rows that produced it.
2. Show only figures the available data actually supports. Where a number cannot be
   computed soundly, render an explicit unavailable state naming what is missing —
   never an estimate dressed as a balance (§5.4).
3. Move the activity panel off the dashboard into its own destination, honest about its
   10-row ceiling.
4. Leave the backend contract for the real ledger written down and ready.

**Non-goals**

- No changes to `Be-Capstone` in this phase.
- No finance surfaces for expert / customer / staff roles.
- The customer wallet inspector stays on `/dashboard/commerce`; it is paired with a
  write action and moving it is scope creep. Cross-link only.
- No new charting library; reuse the existing `recharts` + `chart.tsx` wrapper.

---

## 4. Routes and navigation

Two entries added to `src/config/site.ts` → `siteConfig.dashboard.navMain`. Both icons
are already registered in `IconMap` in `src/shared/components/app-sidebar.tsx`, so that
file needs no change.

| Label                  | Route                 | Icon          | Position                          |
| ---------------------- | --------------------- | ------------- | --------------------------------- |
| `Dòng tiền & Đối soát` | `/dashboard/finance`  | `ReceiptText` | after `Thương mại & Ví`           |
| `Nhật ký hoạt động`    | `/dashboard/activity` | `List`        | after `Duyệt rút tiền phòng khám` |

Per `docs/project-standards.md` §1.4, both `page.tsx` files are thin join points that
render a feature component and nothing else.

---

## 5. Finance page — `/dashboard/finance`

A flow header over three counterparty tabs (`src/shared/components/ui/tabs.tsx`).
Visual language follows `dashboard-shell.tsx` (shadcn `Card`, semantic theme tokens),
**not** the hardcoded `slate-*`/`emerald-*` palette used in the clinic-manager views —
this page lives in the admin portal and must be theme-aware.

Range selector reuses `DashboardPageHeader` with the same `DashboardRange` type, so the
period control is identical to the dashboard's.

### 5.1 Flow header

A horizontal waterfall — deliberately not another area chart, since the question is
"where did the money go", not "how did it trend".

```
Khách thanh toán            inflow              [measured — PARTIAL, see §5.4]
  ├── Hoàn tiền             refundsOut          [measured]
  ├── Hoa hồng sàn          commissionRetained  [measured]
  └── Về phòng khám         —                   [NOT COMPUTABLE, see §5.4]

Đã chuyển cho phòng khám    (measured independently, not a split of the above)
  ├── Đã chi trả            paidOut             [measured]
  └── Chờ duyệt             pendingPayout       [measured]
```

Each node is a button that switches to the tab and filter that produced it.

The header is deliberately **two blocks, not one tree**. Payouts are real money that
left, but they cannot be shown as a share of inflow, because the amount owed to clinics
is not derivable from the available metrics (§5.4). Drawing them as a branch of the
waterfall would imply a completed split that we cannot substantiate.

The `Về phòng khám` node renders as an explicit unavailable state — a short line naming
the missing metric and the phase-2 endpoint that supplies it (§8) — rather than being
silently omitted. A hole that says what it is beats a diagram that looks complete.

### 5.2 Money math — exact definitions

All of the following live in `finance/lib/flow.ts` as pure functions.

From `AdminDashboardResponse.metrics` (range-scoped by the server):

```
inflow             = productPaymentsCollectedVnd + consultationFeesCollectedVnd
                     // PARTIAL — excludes treatment plan revenue, see §5.4
refundsOut         = productRefundsVnd + consultationRefundsVnd
commissionRetained = platformCommissionRevenueVnd
```

There is deliberately **no `clinicAccrued` figure**. See §5.4 for why it cannot be
computed from these metrics.

From the withdrawals list (all-time; **filtered client-side into the selected range**):

```
paidOut         = Σ amountVnd where status = PAID       , dated by processedAt
pendingPayout   = Σ amountVnd where status = REQUESTED  , dated by createdAt
rejectedTotal   = Σ amountVnd where status = REJECTED   , dated by processedAt
```

Dating rule: settled rows (`PAID`/`REJECTED`) are attributed to `processedAt` — the
date the money actually moved. Open rows (`REQUESTED`) have no `processedAt`, so they
are attributed to `createdAt`. This is stated in the UI where the range is applied.

From the cancellations list (`status=ALL`, **bounded fetch** — see below; range-filtered
client-side on `createdAt`):

```
refundedOut    = Σ refundAmountVnd where status ∈ {REFUNDED, AWAITING_RETURN, RESTOCKED, COMPLETED}
refundInFlight = Σ refundAmountVnd where status ∈ {REQUESTED, REFUNDING}
refundStuck    = Σ refundAmountVnd where status = FAILED
```

The wallet credit lands by `AWAITING_RETURN` (confirmed by `e2e/admin-api/REPORT.md`
TC-ADM-13), so `REFUNDED` and every later state count as money that has left.

**Two fetch modes for cancellations.** The summary figures above and the §5.3
reconciliation need a whole-set sum, but the tab's table needs ordinary pagination.
These are served by two separate queries:

- `useAllCancellations()` — `status=ALL, limit=100`, paged loop capped at **500 rows**,
  feeding the summary strip, the flow header and reconciliation. Truncation is
  disclosed by banner, exactly as for withdrawals.
- `useCancellations(params)` — the existing hook, server-paginated, feeding the table.

Sums are therefore never computed from a single page. Where the cap is hit, every
derived figure on the page is marked as covering the most recent 500 cancellations
rather than the full period.

`amountVnd` arrives as a **string** (Postgres `bigint`) on withdrawals and as a
**number** on cancellations. A single `parseVnd()` helper in `finance/lib/money.ts`
normalises both. VND magnitudes are far below `2^53`, so `number` is safe.

### 5.3 Reconciliation

Two independent sources describe product refunds: `metrics.productRefundsVnd` from the
dashboard, and `refundedOut` summed from cancellations. A small "Đối soát" row shows
both with their difference, flagged when they diverge beyond a 1 VND tolerance.

This costs nothing — both are already fetched — and it is the single most
production-like behaviour available to us here: a finance view that checks itself.

### 5.4 The treatment-revenue gap — why clinic payable is not computable

**Confirmed with the product owner (2026-08-16): platform commission is charged on
treatment plan payments as well as consultation fees.**

`AdminDashboardResponse.metrics` has no treatment revenue field of any kind —
`dashboard.types.ts` contains no `treatment*` key. Meanwhile the clinic ledger has a
distinct `TREATMENT_PLAN_PAYMENT` transaction type and `/treatments/:id/pay` is a live
endpoint. Two consequences follow, and both are findings about the existing dashboard
rather than about this feature:

1. **`inflow` is understated.** Treatment plan payments are real money entering the
   platform and appear in no admin metric. Every inflow figure on the dashboard and on
   this page covers products + consultations only. Labelled as such wherever shown.

2. **Clinic payable cannot be derived.** The natural formula
   `consultationFees − consultationRefunds − platformCommission` subtracts commission
   earned on treatment revenue from a base that excludes treatment revenue. It
   systematically understates what clinics are owed, and goes negative once treatment
   revenue is large relative to consultation revenue. It is not a risky estimate; it is
   wrong. The node is therefore removed rather than estimated.

**Rejected alternative.** Treatment revenue could in principle be recovered as
`platformCommission ÷ commissionRate − consultationFees`. This is unsound: the rate is
mutable, and `commerce-wallet-view.tsx` states that escrowed money retains the rate in
force when it was created. Any period spanning a rate change would produce a wrong
number with no way to detect it — strictly worse than showing nothing, because it would
look authoritative.

What the page shows instead: payouts as independently measured figures (§5.1, second
block), never as a share of an inflow total we know to be incomplete. `GET
/admin/clinics/balances` (§8) makes the payable measured and closes this properly.

### 5.5 Tab 1 · Phòng khám

The genuinely new capability: aggregate → line item drill-down per clinic.

`/admin/clinic-withdrawals` is a manually-approved queue, so volume is low. The hook
fetches it once with `status=ALL, limit=100`, looping pages up to a hard cap of **500
rows**, and caches the whole set. All filtering, sorting, aggregation and pagination
then happen client-side, which makes the tab instant and sidesteps the endpoint's
missing date filter. If the cap is hit, a banner says so explicitly rather than
silently truncating.

Clinic names come from `useAdminClinics()` joined on `clinicId`, falling back to the
row's own `clinicName` then to a shortened id.

- **Top level** — one row per clinic: name, request count, total paid, pending,
  rejected, last payout date.
- **Expanded** — that clinic's individual withdrawals: amount, status, requested-at,
  processed-at, bank snapshot, `transferRef`, `staffNote`, and the
  `debitTransactionId` / `refundTransactionId` pair.
- **Filters** — clinic select, status, date range, free-text over `transferRef` /
  bank fields. All client-side; the date inputs carry a note that filtering applies to
  the dating rule in §5.2.
- **Export** — client-side CSV of the current filtered set, mirroring the clinic
  statement's export affordance. Built in `finance/lib/csv.ts` (the clinic version is a
  server-produced blob; admin has no such endpoint).

### 5.6 Tab 2 · Hoàn tiền khách

The table is server-paginated over `/admin/order-cancellations`, reusing the existing
`useCancellations` hook and `ListCancellationsParams`. The summary strip above it is
fed by the separate bounded `useAllCancellations()` query defined in §5.2, so its
totals describe the period rather than the visible page.

Summary strip: `refundedOut`, `refundInFlight`, and **`refundStuck`** — the last
currently exists only as a bare count in the dashboard's "Cần xử lý" panel, yet it is
the number most likely to need action.

Rows open the existing
`src/features/admin/cancellations/components/cancellation-detail-modal.tsx` — reused,
not rebuilt. Status filter is server-side; date filter applies client-side to the
current page and is labelled accordingly.

### 5.7 Tab 3 · Nền tảng

GlowScan's own take, all from data already fetched:

- Commission earned for the period (`platformCommissionRevenueVnd`).
- Daily commission trend — reuses the existing `MoneyChart` component pattern over
  `trend.platformCommissionRevenueVnd`.
- The gross → discounts → shipping → net-collected breakdown, currently buried in a
  three-cell strip on the dashboard, given proper room here.
- Read-only echo of the current commission % and combo discount % via
  `useAdminPlatformCommission()` / `useAdminComboDiscount()`, with a link to
  `/dashboard/commerce` to change them. Without the rates the figures above cannot be
  interpreted; without the link the page would look editable when it is not.

---

## 6. Activity page — `/dashboard/activity`

Consumes `useAdminDashboard(range)` — the **same query key the dashboard already
caches** (`queryKeys.dashboard("admin", range)`), so navigating between the two costs
zero additional network requests.

- Range switcher via `DashboardPageHeader` — the only genuine server-side control.
- Client-side: type filter (options derived from the distinct `type` values actually
  present, so the filter never offers an empty result), free-text search over
  `title` + `description`, and a "chỉ hiện có số tiền" toggle.
- Display: grouped by day, each row carrying a per-type icon, title, description,
  amount and time. `activity-meta.ts` maps `type` → icon, label and deep link
  (withdrawal → finance tab 1, cancellation → finance tab 2, stock → stock-imports,
  and so on), with a neutral fallback for unknown types so a new backend event type
  degrades gracefully instead of breaking the row.
- A permanent, non-dismissible inline note: _"Hiển thị 10 hoạt động gần nhất trong kỳ.
  Nhật ký đầy đủ cần endpoint phân trang (chưa có)."_ On-screen honesty, and it keeps
  the phase-2 gap visible to everyone who opens the page.

### Dashboard changes

`admin-dashboard-view.tsx`:

- `RecentActivity` component and its `<section className="grid gap-6 xl:grid-cols-2">`
  wrapper are removed; `TopProducts` becomes full-width.
- A compact link card replaces it, pointing at `/dashboard/activity`.
- Money metric cards gain `href`s into the matching finance tab
  (`/dashboard/finance?tab=clinics` etc.), replacing today's links to generic pages.
  The active tab is read from a `?tab=` search param so these links and the flow-node
  buttons share one mechanism.

---

## 7. Module structure

Follows the existing `src/features/admin/cancellations/` sub-feature precedent and the
three-layer rule in `docs/project-standards.md` §2 — UI never calls an API directly.

### New files

```
src/app/(admin)/dashboard/finance/page.tsx
src/app/(admin)/dashboard/activity/page.tsx

src/features/admin/finance/types/finance.types.ts
src/features/admin/finance/lib/money.ts               parseVnd, sumVnd
src/features/admin/finance/lib/flow.ts                buildMoneyFlow, reconcileRefunds
src/features/admin/finance/lib/clinic-rollup.ts       rollupByClinic, filterByRange
src/features/admin/finance/lib/csv.ts                 toCsv, downloadCsv
src/features/admin/finance/lib/money.test.ts
src/features/admin/finance/lib/flow.test.ts
src/features/admin/finance/lib/clinic-rollup.test.ts
src/features/admin/finance/hooks/useAdminFinance.ts   useAllClinicWithdrawals, useAllCancellations, useFinanceOverview
src/features/admin/finance/components/finance-view.tsx
src/features/admin/finance/components/money-flow-summary.tsx
src/features/admin/finance/components/clinic-payouts-tab.tsx
src/features/admin/finance/components/refund-outflow-tab.tsx
src/features/admin/finance/components/platform-revenue-tab.tsx

src/features/admin/activity/lib/activity-meta.ts
src/features/admin/activity/components/activity-log-view.tsx
```

No new `*.api.ts` file is required — every call already has a dumb wrapper in
`admin/api/` or `admin/cancellations/api/`. `useAllClinicWithdrawals` composes the
existing `adminClinicWithdrawalsApi.listWithdrawals` across pages, which is hook-layer
orchestration and belongs there per §2 of the standards.

### Modified files

```
src/config/site.ts                                         +2 nav entries
src/lib/query/keys.ts                                      +adminClinicWithdrawalsAll, +adminCancellations
src/features/dashboard/components/admin-dashboard-view.tsx  remove RecentActivity, full-width TopProducts, card hrefs
package.json                                               +vitest devDep, +test:unit script, ci:verify chain
vitest.config.ts                                           new
```

### Query keys

```ts
adminClinicWithdrawalsAll: ["admin", "clinic-withdrawals", "all"] as const,
adminCancellations: (query?: unknown) => ["admin", "cancellations", query ?? {}] as const,
adminCancellationsAll: ["admin", "cancellations", "all"] as const,
```

---

## 8. Phase 2 — backend contracts (specified, not built)

Written down now so they are ready the moment anyone touches `Be-Capstone`. Each one
replaces a missing or truncated figure above with a measured one.

### `GET /admin/transactions`

`/clinic/transactions` de-scoped from a single clinic, plus counterparty filters.
Replaces the whole composed approach with a true ledger, and — because
`TREATMENT_PLAN_PAYMENT` is one of its types — closes the treatment-revenue blind spot
in §5.4 on its own.

```
Query:  search, type, status, clinicId, userId, orderId, expertId,
        from, to, minAmountVnd, maxAmountVnd, page, limit
Returns: { items: Transaction[], total, page, limit }
  Transaction: id, type, status, amountVnd, clinicId, clinicName,
               userId, userName, orderId, consultationId, treatmentId,
               withdrawalId, externalRef, note, createdAt
```

Also `GET /admin/transactions/export` returning `text/csv`, mirroring
`CLINIC.TRANSACTIONS_EXPORT`, which lets `finance/lib/csv.ts` be retired.

### `GET /admin/activity`

Lifts the 10-row ceiling and makes §6's filters server-side.

```
Query:  type[], from, to, actorId, page, limit
Returns: { items: ActivityItem[], total, page, limit }
  ActivityItem: id, type, title, description, amountVnd,
                actorId, actorName, entityId, occurredAt
```

`actorId` / `actorName` are additions beyond today's shape — they are what would later
allow an audit trail ("who approved this withdrawal") without another endpoint.

### `GET /admin/clinics/balances`

The one that actually closes the money-flow picture: per-clinic available balance,
held escrow and pending withdrawals — the admin-side equivalent of `/clinic/wallet`.

```
Query:  clinicId, page, limit
Returns: { items: [{ clinicId, clinicName, balanceVnd, heldEscrowVnd,
                     pendingWithdrawalsVnd, commissionEarnedVnd }], total, page, limit }
```

With this, §5.1's unavailable `Về phòng khám` node becomes a measured figure and the
header can collapse back into a single waterfall.

### Additionally: treatment revenue on `GET /admin/dashboard`

The smallest possible fix for §5.4 if the full ledger is out of reach — add
`treatmentPaymentsCollectedVnd` and `treatmentRefundsVnd` to `metrics` and to each
`trend` point, alongside the existing consultation fields. This alone makes `inflow`
complete and makes clinic payable derivable honestly.

---

## 9. Testing

`capstone-fe` has **no unit-test runner today** — `package.json` carries Playwright
only. The money math in §5.2 is exactly the code where a silent regression is
expensive, so this design adds a minimal one.

- **vitest**, node environment, `include: ["src/**/*.test.ts"]` — scoped so it cannot
  collide with the Playwright specs under `e2e/`. No jsdom, no React testing
  libraries: only the pure functions in `finance/lib/` are covered.
- Cases: `parseVnd` on string and number inputs; each flow figure from a fixed
  metrics fixture; range filtering across the `processedAt` / `createdAt` dating rule;
  per-clinic rollup including a clinic with only rejected rows; reconciliation
  agreement and divergence; and a guard test asserting `buildMoneyFlow` exposes **no**
  clinic-payable field, so §5.4's removed derivation cannot be reintroduced by accident.
- `pnpm test:unit` added to the `ci:verify` chain.
- Everything else is verified through `pnpm ci:verify` (format, lint, typecheck,
  build).

---

## 10. Risks

**R1 — RESOLVED, and it removed a feature.** Confirmed with the product owner on
2026-08-16 that platform commission is charged on treatment plan payments as well as
consultation fees. Since no admin metric carries treatment revenue, clinic payable is
not derivable and the flow header's `Về phòng khám` node was cut rather than estimated
(§5.4). The residual consequence — that every `inflow` figure on the admin dashboard
understates real money in by the whole of treatment revenue — is a **pre-existing gap
in the dashboard, not one this feature introduces**, and is worth raising with whoever
owns `/admin/dashboard` independently of this work.

**R2 — the 500-row bounded fetches.** Safe for withdrawals (a manually-approved queue)
but less certain for cancellations, whose volume scales with order volume and could
realistically exceed 500 within a 90-day range. Mitigated by an explicit truncation
banner that marks every derived figure as partial; resolved by `GET /admin/transactions`
with server-side date filtering. If cancellation volume is already near the cap when
implementation starts, the honest fallback is to drop the refund summary strip to the
`REQUESTED`/`REFUNDING`/`FAILED` statuses only — a far smaller working set — and defer
period totals to phase 2.

**R3 — client-side date filtering diverges from server range semantics.** The
dashboard's `range` is computed server-side in `Asia/Ho_Chi_Minh`; our withdrawal
filtering is computed in the browser. Mitigated by reusing the `period.from`/`period.to`
values the dashboard response already returns, rather than computing boundaries
locally.

**R4 — activity deep links may point at pages that cannot show the entity.** The
activity payload carries only `id` and `type`, with no guarantee the id is routable.
Mitigated by `activity-meta.ts` linking to filtered _list_ pages rather than detail
routes, and falling back to no link for unknown types.

**R5 — stale local backend.** The `Be-Capstone` checkout on `main` predates
`/admin/dashboard`, `/clinic/wallet` and `/clinic/transactions` entirely, so the
inventory in §2 is derived from the frontend's call sites rather than verified against
a running server. The first implementation step should confirm the response shapes
against the live backend before any UI is built on them.
