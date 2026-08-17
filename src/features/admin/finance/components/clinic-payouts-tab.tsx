"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
  DashboardLoading,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import useDebounce from "@/shared/hooks/useDebounce";
import { useAdminTransactions } from "@/features/admin/ledger/hooks/useAdminLedger";
import {
  transactionTypeBadgeVariant,
  transactionTypeLabel,
} from "@/features/admin/ledger/lib/transaction-meta";
import { useClinicBalances } from "../hooks/useClinicBalances";
import { parseVnd } from "../lib/money";

const ACTIVITY_PAGE_SIZE = 20;
const BALANCES_PAGE_SIZE = 20;

export function ClinicPayoutsTab({ from, to }: { from: string; to: string }) {
  const [selectedClinicId, setSelectedClinicId] = React.useState<string | null>(
    null,
  );
  const [balancePage, setBalancePage] = React.useState(1);
  const [clinicSearch, setClinicSearch] = React.useState("");
  const debouncedClinicSearch = useDebounce(clinicSearch.trim(), 350);

  // Any change to the search term invalidates the current balances page —
  // adjust during render (not an effect) to avoid the extra render pass a
  // useEffect-driven setPage would cause.
  const [prevClinicSearch, setPrevClinicSearch] = React.useState(
    debouncedClinicSearch,
  );
  if (prevClinicSearch !== debouncedClinicSearch) {
    setPrevClinicSearch(debouncedClinicSearch);
    setBalancePage(1);
  }

  const balances = useClinicBalances({
    search: debouncedClinicSearch || undefined,
    page: balancePage,
    limit: BALANCES_PAGE_SIZE,
  });
  const items = React.useMemo(
    () => balances.data?.items ?? [],
    [balances.data],
  );
  const selectedClinic =
    items.find((clinic) => clinic.clinicId === selectedClinicId) ?? null;

  // Pagination and search can page the selected clinic out of view — when
  // that happens, drop the selection instead of leaving Block 2 querying a
  // clinic Block 1 no longer shows. Adjusted during render, keyed off the
  // memoized `items` reference so it only fires when the page actually changes.
  const [prevItems, setPrevItems] = React.useState(items);
  if (prevItems !== items) {
    setPrevItems(items);
    if (
      selectedClinicId &&
      !items.some((clinic) => clinic.clinicId === selectedClinicId)
    ) {
      setSelectedClinicId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Block 1 — current position. Every figure here comes from
          /admin/clinics/balances and is point-in-time or all-time, never
          scoped to the selected period. It must never sit next to a
          period figure, hence the separate card and the explicit caption. */}
      <DashboardSectionCard
        title="Tình trạng hiện tại"
        description="Số dư hiện tại của từng phòng khám — không phải số liệu của kỳ đang chọn"
      >
        <div className="mb-4 flex flex-col gap-1.5">
          <Label htmlFor="clinic-balance-search" className="text-xs">
            Tìm kiếm
          </Label>
          <Input
            id="clinic-balance-search"
            placeholder="Tìm phòng khám theo tên..."
            value={clinicSearch}
            onChange={(event) => setClinicSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {balances.isPending ? (
          <DashboardLoading />
        ) : balances.isError ? (
          <DashboardError retry={() => void balances.refetch()} />
        ) : items.length === 0 ? (
          <DashboardEmptyPanel
            title="Không có phòng khám"
            description="Chưa có phòng khám nào có số dư để hiển thị."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phòng khám</TableHead>
                  <TableHead className="text-right">Số dư khả dụng</TableHead>
                  <TableHead className="text-right">Tạm giữ (escrow)</TableHead>
                  <TableHead className="text-right">Chờ duyệt rút</TableHead>
                  <TableHead className="text-right">
                    Hoa hồng đã thu (lũy kế)
                  </TableHead>
                  <TableHead className="text-right">Lần chi gần nhất</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((clinic) => {
                  const isSelected = clinic.clinicId === selectedClinicId;
                  const select = () => setSelectedClinicId(clinic.clinicId);

                  return (
                    <TableRow
                      key={clinic.clinicId}
                      className={`cursor-pointer ${isSelected ? "bg-muted/40" : ""}`}
                      onClick={select}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          select();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      aria-label={`${clinic.clinicName} — xem hoạt động trong kỳ`}
                    >
                      <TableCell className="font-medium">
                        {clinic.clinicName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseVnd(clinic.balanceVnd))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseVnd(clinic.heldEscrowVnd))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseVnd(clinic.pendingWithdrawalsVnd))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseVnd(clinic.commissionEarnedVnd))}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs">
                        {clinic.lastPayoutAt
                          ? formatDateTime(clinic.lastPayoutAt)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <DataTablePagination
              page={balancePage}
              totalPages={
                Math.ceil((balances.data?.total ?? 0) / BALANCES_PAGE_SIZE) || 1
              }
              totalItems={balances.data?.total ?? 0}
              pageSize={BALANCES_PAGE_SIZE}
              onPageChange={setBalancePage}
            />
          </>
        )}
      </DashboardSectionCard>

      {/* Block 2 — period activity for ONE selected clinic. Every figure here
          comes from /admin/transactions with from/to applied, never from the
          balances endpoint. This is a row list, not a cross-clinic total. */}
      <DashboardSectionCard
        title={
          selectedClinic
            ? `Hoạt động trong kỳ — ${selectedClinic.clinicName}`
            : "Hoạt động trong kỳ"
        }
        description="Các giao dịch của phòng khám đã chọn trong khoảng thời gian đang xem."
        action={
          selectedClinicId ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/ledger" />}
              nativeButton={false}
            >
              Mở sổ cái <ArrowUpRight />
            </Button>
          ) : undefined
        }
      >
        {selectedClinicId ? (
          <ClinicActivityPanel
            key={`${selectedClinicId}-${from}-${to}`}
            clinicId={selectedClinicId}
            from={from}
            to={to}
          />
        ) : (
          <DashboardEmptyPanel
            title="Chọn một phòng khám"
            description="Chọn một phòng khám ở bảng trên để xem các giao dịch trong kỳ."
          />
        )}
      </DashboardSectionCard>
    </div>
  );
}

function ClinicActivityPanel({
  clinicId,
  from,
  to,
}: {
  clinicId: string;
  from: string;
  to: string;
}) {
  const [page, setPage] = React.useState(1);

  const transactions = useAdminTransactions({
    clinicId,
    from,
    to,
    page,
    limit: ACTIVITY_PAGE_SIZE,
  });

  const items = transactions.data?.items ?? [];
  const total = transactions.data?.total ?? 0;
  const totalPages = Math.ceil(total / ACTIVITY_PAGE_SIZE) || 1;

  if (transactions.isPending) {
    return <DashboardLoading />;
  }

  if (transactions.isError) {
    return <DashboardError retry={() => void transactions.refetch()} />;
  }

  if (items.length === 0) {
    return (
      <DashboardEmptyPanel
        title="Không có giao dịch"
        description="Phòng khám này không có giao dịch nào trong kỳ đang chọn."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
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
              <TableCell className="text-right font-medium">
                {formatCurrency(parseVnd(item.amountVnd))}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-64 truncate text-xs">
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
        pageSize={ACTIVITY_PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
}
