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

  // Any filter change invalidates the current page number. `query` is
  // memoized above, so its reference only changes when the filters actually
  // do — adjusting state during render here avoids the extra effect-driven
  // render pass that `setPage` inside a `useEffect` would cause.
  const [prevQuery, setPrevQuery] = React.useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setPage(1);
  }

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
