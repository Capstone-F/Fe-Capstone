# Admin finance phase 2 — real ledger, measured balances — design

**Date:** 2026-08-17
**Status:** Approved, ready for implementation planning
**Scope:** `capstone-fe` only. The backend work this depends on is already merged.
**Supersedes parts of:** `docs/superpowers/specs/2026-08-16-admin-finance-visibility-design.md` (phase 1)

---

## 1. What changed since phase 1

Phase 1 was frontend-only against three existing endpoints. It shipped honest
workarounds: bounded 500-row client fetches, a truncation banner, a client-side CSV
builder, a 10-row activity ceiling, and an explicit "chưa tính được" hole where the
amount owed to clinics should be.

The backend has now merged all four requests from `docs/admin-finance-be-handoff.md`
(`Be-Capstone` commits `aa5889f`, `fe2e326`), documented in
`Be-Capstone/docs/admin-finance-flow.md`:

| Endpoint                                | Purpose                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /admin/transactions` (+ `/export`) | Platform-wide ledger, 13 filters, server pagination, joined names               |
| `GET /admin/clinics/balances`           | Per-clinic available / escrow / pending / commission / last payout              |
| `GET /admin/activity`                   | Activity feed without the 10-row cap, with `actorId` / `actorName` / `entityId` |
| `GET /admin/dashboard`                  | Now carries `treatmentPaymentsCollectedVnd` and `treatmentRefundsVnd`           |

Both open questions from the handoff are answered:

- **Full `TransactionType` enum is 9 values**, not the 7 phase 1 knew:
  `PRODUCT_PURCHASE`, `CONSULTATION_PAYMENT`, `TREATMENT_PLAN_PAYMENT`, `WALLET_TOPUP`,
  `REFUND`, `WITHDRAWAL`, `WITHDRAWAL_REVERSAL`, `ESCROW_RELEASE`, `COMMISSION`.
- **`/admin/clinic-withdrawals` and `/admin/order-cancellations` both default to
  `createdAt DESC`** — phase 1's stitching assumption was correct after all.

This phase spends that capability: it adds the ledger the original request asked for,
and deletes the workarounds.

---

## 2. Goals / non-goals

**Goals**

1. Give admin a true transaction-level ledger with server-side filtering, pagination and
   CSV export — the admin equivalent of the clinic manager's statement.
2. Close phase 1's `§5.4` hole: render the amount owed to clinics as a real figure.
3. Delete every phase-1 workaround rather than leaving it beside the real thing.
4. Keep every figure on a given surface in one scope — no point-in-time number sitting
   beside period-scoped ones.

**Non-goals**

- No backend changes.
- No finance surfaces for expert / customer / staff roles (still deferred).
- The customer wallet inspector stays on `/dashboard/commerce`.
- No new charting library.

---

## 3. Backend contracts this design consumes

Verified against the DTOs, not just the backend's prose doc.

**Common:** role `app_admin`; `page` default 1, `limit` default 20 max 100; response
`{ items, total, page, limit }`; `from`/`to` are `YYYY-MM-DD` calendar days in
`Asia/Ho_Chi_Minh`.

**Amount types differ by endpoint and this matters:** ledger and balance amounts are
**strings** (Postgres `bigint`); activity `amountVnd` is a **number**. The existing
`parseVnd` already normalises both — keep using it, do not add a second coercion path.

### `GET /admin/transactions`

Query: `search`, `type`, `status`, `clinicId`, `userId`, `expertId`, `orderId`,
`from`, `to`, `minAmountVnd`, `maxAmountVnd`, `page`, `limit`. Sorted `createdAt DESC`.

Item fields: `id`, `type`, `status`, `amountVnd` (string), `fromAccount`, `toAccount`,
`clinicId`, `clinicName`, `userId`, `userName`, `orderId`, `consultationId`,
`treatmentId`, `treatmentPhaseId`, `escrowHoldId`, `withdrawalId`, `expertId`,
`externalRef`, `note`, `createdAt`.

`TransactionStatus`: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`.

A `REFUND` row is discriminated by which FK is set: `orderId` (product),
`consultationId` (booking), `treatmentId` (treatment plan).

### `GET /admin/transactions/export`

Same filters, `page`/`limit` ignored. Returns `text/csv; charset=utf-8` with a UTF-8
BOM, up to 10,000 rows, **oldest first** — deliberately the opposite order from the
list endpoint. The UI must not imply the export matches the on-screen row order.

### `GET /admin/clinics/balances`

Query: `clinicId`, `search`, `page`, `limit`. Sorted by clinic name.
Fields: `clinicId`, `clinicName`, `balanceVnd`, `heldEscrowVnd`,
`pendingWithdrawalsVnd`, `commissionEarnedVnd` (all strings), `lastPayoutAt`
(`Date | null`).

**Every figure here is point-in-time or all-time, never period-scoped.**
`commissionEarnedVnd` in particular is all-time. See §5.

### `GET /admin/activity`

Query: `type` (repeatable array), `from`, `to`, `actorId`, `page`, `limit`.
Fields: `id`, `type`, `title`, `description`, `amountVnd` (number), `actorId`,
`actorName`, `entityId`, `occurredAt`.

Activity types (10): `USER_CREATED`, `PRODUCT_PAYMENT`, `CONSULTATION_PAYMENT`,
`TREATMENT_PLAN_PAYMENT`, `REFUND`, `ORDER_CANCELLATION`, `STOCK_IMPORT`,
`WITHDRAWAL_REQUESTED`, `WITHDRAWAL_PAID`, `WITHDRAWAL_REJECTED`.

`entityId` is the source record's id for deep links — the withdrawal, cancellation,
stock form or transaction; for `PRODUCT_PAYMENT` it is the **order** id.

---

## 4. The payable figure becomes sound

Phase 1 removed the "Về phòng khám" node because the natural formula subtracted
commission earned on treatment revenue from a base that excluded treatment revenue —
wrong, and negative once treatment revenue grew. With treatment revenue now in
`metrics`, every term is present and period-scoped:

```
clinicAccrued = consultationFeesCollectedVnd
              + treatmentPaymentsCollectedVnd
              - consultationRefundsVnd
              - treatmentRefundsVnd
              - platformCommissionRevenueVnd
```

Commission is charged on exactly those two revenue streams (confirmed with the product
owner, 2026-08-16), so the identity balances. Product revenue is excluded from both
sides and is correctly absent.

Consequences:

- The flow header **collapses back to a single waterfall**. The two-block split existed
  only because payouts could not honestly be drawn as a share of inflow.
- The dashed `UnavailableNode` is deleted.
- The `Chưa gồm doanh thu phác đồ điều trị` caveat comes off the inflow node, and
  `inflow` gains the treatment term.
- Phase 1's regression guard (`buildMoneyFlow` exposes no payable field) is **inverted**:
  the new test asserts the field exists and equals the formula above. A test asserting a
  non-negative result on a realistic fixture replaces the old "guard against reintroduction"
  intent, because the reason for that guard is gone.

**This figure comes from `/admin/dashboard`, not from `/admin/clinics/balances`.** The
header is period-scoped; balances are point-in-time. Mixing them would recreate phase 1's
Critical.

---

## 5. Scope discipline — the rule this phase must not break

Phase 1's Critical was an all-time figure sitting on a period-scoped page. The balances
endpoint reintroduces exactly that hazard, so the rule is explicit:

> Every figure rendered inside a period-scoped block comes from `/admin/dashboard` or
> from `/admin/transactions` with `from`/`to` applied. Every figure from
> `/admin/clinics/balances` renders only inside a block labelled as current position.

The clinic tab therefore has **two visually separated blocks**:

- **`Tình trạng hiện tại`** — from `/admin/clinics/balances`. Available balance, escrow
  held, pending withdrawals, commission collected (all-time), last payout date. Carries a
  caption stating these are current values, not figures for the selected period.
- **`Hoạt động trong kỳ`** — from `/admin/transactions?clinicId=&from=&to=`, shown for
  **one selected clinic at a time**, as a paginated list of that clinic's movements in the
  range.

No block mixes the two, and no single row places a point-in-time value next to a
period one.

**The period block is a row list, never a per-clinic aggregate.** Totalling period
activity across clinics would mean summing a paginated set client-side — the pattern §9
exists to delete. The interaction is therefore: read the current-position table (all
clinics), select one, and see its movements. That also keeps the drill-down shape phase 1
established, where the aggregate row is the entry point to line items.

---

## 6. New surface — `/dashboard/ledger`

Its own sidebar entry (`Sổ cái giao dịch`, icon `ReceiptText`), not a tab on the finance
page. Rationale: auditing is a different task from understanding the money picture; the
ledger needs arbitrary `from`/`to` dates, which conflicts with the finance page's
7/30/90-day selector; and it wants the full viewport for rows. This also mirrors the
clinic manager's `Sao kê & Xuất CSV`, which is its own nav item beside wallet and
withdrawals.

**Filters** (all server-side, all optional): free-text search, type (9 values), status
(4 values), clinic (select, from `useAdminClinics`), date range (two date inputs), and
amount min/max. Filter changes reset to page 1.

**Table columns:** time, type badge, status, amount, counterparty
(`clinicName` / `userName` with a shortened id fallback), linkage, note.

The **linkage** column is what makes the ledger auditable: it renders whichever FKs are
set — order, consultation, treatment, withdrawal — and for a `REFUND` row that FK is
what tells you which kind of refund it is. `fromAccount → toAccount` renders as a small
movement indicator, since that is the ledger's own statement of where money went.

**Export** calls `GET /admin/transactions/export` with the current filters and triggers
a download from the response blob, mirroring how `clinicStatementApi.exportCsv` already
does it. A note beside the button states the export is oldest-first and capped at 10,000
rows — both facts are true of the endpoint and both would otherwise surprise.

**Type presentation** lives in `ledger/lib/transaction-meta.ts`: type → Vietnamese label
and badge variant, covering all 9 values with a neutral fallback. This is the same shape
as the clinic statement's `translateType`, but it is a data map rather than a switch
returning JSX, so the labels can also drive the filter dropdown without duplication.

---

## 7. Finance page — re-based, not rebuilt

- **Flow header** — single waterfall, payable node real (§4), treatment term added to
  inflow, caveat removed.
- **Clinic tab** — restructured into the two blocks of §5.
- **Refund tab** — split the same way as the clinic tab, for the same reason:
  - **Period block** — total refunded, from `/admin/dashboard` metrics, now broken out
    three ways (`productRefundsVnd`, `consultationRefundsVnd`, `treatmentRefundsVnd`).
    These are server-computed and period-scoped, so no client summing is needed at all.
  - **Current block** — in-flight and stuck refunds from
    `/admin/order-cancellations?status=`, shown as **counts, not amounts**. These are
    **workflow states, not period figures**: a refund that is stuck is stuck now,
    regardless of which range the header shows. The count comes straight from the
    response's `total`, so it is exact and free — whereas summing their amounts would
    mean paging the set. A count is also the more actionable number here: what an admin
    needs from "đang kẹt" is how many items require intervention.

  The `/admin/order-cancellations` table stays, because it carries workflow detail
  (`attempts`, `lastError`, the item breakdown) that the ledger does not, and `FAILED` is
  a cancellation-workflow state with no transaction-status equivalent.

  Note this tab does **not** call `/admin/transactions`. Deriving a refund total by
  summing ledger rows would require paging the whole filtered set — the exact pattern §9
  deletes.

- **Platform tab** — gains a service-revenue breakdown (consultation vs treatment
  collected and refunded), which was invisible before this backend change. Commission,
  rates and the product sales structure are unchanged.

**The reconciliation row is removed.** Phase 1 justified it as free — both numbers were
already in hand. Summing refunds from the ledger now costs a multi-page fetch, which is
precisely what this phase deletes, and an operator can verify the same thing directly by
filtering the ledger. Keeping a costly self-check that the ledger performs better is not
worth its complexity. This reverses a phase-1 decision deliberately.

---

## 8. Activity page — server-driven

Replaces `useAdminDashboard(range)` with a dedicated `useAdminActivity(query)` over
`GET /admin/activity`.

- Server-side: type (multi-select over the 10 published values), date range, pagination.
- The permanent 10-row notice is **deleted** — the ceiling it disclosed is gone.
- `activity-meta.ts` gains a `TYPE_LABELS` map. Phase 1 deferred this because the
  backend's vocabulary was unpublished; it is published now, so the filter and the rows
  show proper Vietnamese category names instead of an instance `title` standing in for a
  category.
- Deep links use `entityId` rather than guessing from `type` alone. Where `entityId`
  identifies a record with no detail route, the link still targets the filtered list page
  as before.
- Day grouping keeps the `vnDayKey` + `formatDate` treatment from phase 1 — that logic was
  correct and stays.

Because pagination is now server-side, day grouping applies within a page. The page
header states the range, so a group heading is never ambiguous.

---

## 9. What gets deleted

Phase 2 is substantially subtraction. Removing these is a requirement, not a cleanup
option — leaving a bounded fetch beside a server-paginated one invites the next
contributor to use the wrong one.

| File / symbol                                                                                       | Reason                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `finance/lib/paged-fetch.ts` + test                                                                 | Server paginates                                                                                                                                                                     |
| `finance/lib/csv.ts` + test                                                                         | Server exports                                                                                                                                                                       |
| `finance/lib/clinic-rollup.ts` + test (entire module)                                               | `rollupByClinic` replaced by the balances endpoint; `filterWithdrawalsByRange`, `filterCancellationsByRange`, `withdrawalDateFor` replaced by server-side `from`/`to`                |
| `useAllClinicWithdrawals`, `useAllCancellations`                                                    | Replaced by server-filtered queries                                                                                                                                                  |
| `BoundedFetchResult`, `FINANCE_ROW_CAP`, `FINANCE_PAGE_SIZE`                                        | Nothing bounded remains                                                                                                                                                              |
| The truncation banner in `finance-view.tsx`                                                         | Nothing truncates                                                                                                                                                                    |
| `UnavailableNode` in `money-flow-summary.tsx`                                                       | The figure is real                                                                                                                                                                   |
| `reconcileRefunds` + `RefundReconciliation` + tests                                                 | §7                                                                                                                                                                                   |
| `buildRefundTotals`, `RefundTotals`, `REFUND_SETTLED_STATUSES`, `REFUND_IN_FLIGHT_STATUSES` + tests | Period refunds now come server-computed from `/admin/dashboard`; in-flight and stuck are counts from the cancellations endpoint's `total`. Nothing sums a cancellation list any more |
| The activity page's client-side type/search filtering and `typeItems` derivation                    | Server-side now                                                                                                                                                                      |
| The activity page's 10-row notice                                                                   | Ceiling removed                                                                                                                                                                      |
| `queryKeys.adminClinicWithdrawalsAll`, `adminCancellationsAll`                                      | Queries deleted                                                                                                                                                                      |

---

## 10. Module structure

New, following the `api → hooks → components` layering in `docs/project-standards.md` §2:

```
src/app/(admin)/dashboard/ledger/page.tsx

src/features/admin/ledger/api/admin-ledger.api.ts        dumb wrapper: list + exportCsv
src/features/admin/ledger/types/ledger.types.ts          AdminTransaction, query, enums
src/features/admin/ledger/lib/transaction-meta.ts        type -> label + badge variant
src/features/admin/ledger/hooks/useAdminLedger.ts        useAdminTransactions, useExportLedgerCsv
src/features/admin/ledger/components/ledger-view.tsx     filters + table + pagination
src/features/admin/ledger/components/ledger-filters.tsx  extracted; the filter bar is 6 controls

src/features/admin/finance/api/admin-finance.api.ts      clinic balances
src/features/admin/activity/api/admin-activity.api.ts    activity list
src/features/admin/activity/hooks/useAdminActivity.ts
```

Modified: `core/api/endpoints.ts` (three new groups), `config/site.ts` (one nav entry),
`lib/query/keys.ts`, `dashboard/types/dashboard.types.ts` (treatment fields),
`finance/types/finance.types.ts`, `finance/lib/flow.ts` + test, the four finance
components, `activity-log-view.tsx`, `activity-meta.ts`, `useAdminFinance.ts`.

### Query keys

```ts
adminTransactions: (query?: unknown) => ["admin", "transactions", query ?? {}] as const,
adminClinicBalances: (query?: unknown) => ["admin", "clinic-balances", query ?? {}] as const,
adminActivity: (query?: unknown) => ["admin", "activity", query ?? {}] as const,
```

---

## 11. Testing

The pure-logic surface shrinks sharply — most of `finance/lib/` is being deleted, and the
new screens are server-driven with little client computation left. What remains under
vitest:

- `flow.ts` — the corrected `buildMoneyFlow`, TDD. Cases: inflow includes treatment
  payments; refunds include treatment refunds; the `clinicAccrued` formula on a fixture
  with both revenue streams; `clinicAccrued` non-negative on a realistic fixture; and the
  arithmetic identity

  ```
  inflow − refundsOut − commissionRetained − clinicAccrued
    === productPaymentsCollectedVnd − productRefundsVnd
  ```

  which pins the formula against silent drift. The identity states that what remains
  after paying clinics and taking commission is exactly the platform's own product
  margin — so if a later edit changes one term without the others, the test fails
  instead of the waterfall quietly ceasing to add up.

- `money.ts` — unchanged, still covers the string/number split the new endpoints preserve.
- `transaction-meta.ts` — all 9 types map to a label, unknown type falls back.
- `activity-meta.ts` — all 10 types map to a label, unknown type falls back, rule ordering.

`clinic-rollup.test.ts`, `csv.test.ts` and `paged-fetch.test.ts` are deleted with their
modules.

Full gate is `pnpm ci:verify`. **Unlike phase 1, the backend will be running**, so the
manual checks phase 1 had to defer are performable and are part of the definition of done
for the tasks that touch each surface.

---

## 12. Risks

**R1 — this touches every surface phase 1 built.** Mitigated by the backend being
available for real verification, and by the deletions being mechanical (a symbol is either
referenced or it isn't; lint's `--max-warnings=0` catches orphans).

**R2 — the scope rule in §5 is the one that silently breaks.** A point-in-time balance
rendered inside a period block produces a plausible wrong number that no type checker
catches, and phase 1 proved a per-task reviewer cannot see it. Any task touching the
clinic tab must be reviewed against §5 explicitly, not only against its own brief.

**R3 — export order differs from list order.** The endpoint returns oldest-first while
the table is newest-first. Left unstated in the UI, an operator comparing a CSV against
the screen will think rows are missing. The note beside the export button is the
mitigation and is a requirement, not polish.

**R4 — `PRODUCT_PURCHASE` and `WALLET_TOPUP` were unknown in phase 1.** Any UI that
enumerates transaction types must cover all 9; a switch or map missing two values renders
raw enum strings to the operator. `transaction-meta.ts` is the single place this is
enumerated, and its test asserts full coverage.
