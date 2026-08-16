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
              const lineItems = isOpen
                ? filtered.filter((item) => item.clinicId === row.clinicId)
                : [];
              const toggle = () => setExpanded(isOpen ? null : row.clinicId);

              return (
                <React.Fragment key={row.clinicId}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={toggle}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isOpen}
                    aria-label={`${row.clinicName} — xem chi tiết lệnh rút tiền`}
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
