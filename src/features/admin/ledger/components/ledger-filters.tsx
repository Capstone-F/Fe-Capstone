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
  minAmount: string;
  maxAmount: string;
}

export const EMPTY_LEDGER_FILTERS: LedgerFilterState = {
  search: "",
  type: "ALL",
  status: "ALL",
  clinicId: "ALL",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
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
    minAmountVnd: state.minAmount ? Number(state.minAmount) : undefined,
    maxAmountVnd: state.maxAmount ? Number(state.maxAmount) : undefined,
  };
}

export function LedgerFilters({
  value,
  onChange,
}: {
  value: LedgerFilterState;
  onChange: (next: LedgerFilterState) => void;
}) {
  const { data: clinicsRes } = useAdminClinics({ limit: 100 });

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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ledger-min-amount" className="text-xs">
          Số tiền từ
        </Label>
        <Input
          id="ledger-min-amount"
          type="number"
          min={0}
          value={value.minAmount}
          onChange={(event) => set({ minAmount: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ledger-max-amount" className="text-xs">
          Số tiền đến
        </Label>
        <Input
          id="ledger-max-amount"
          type="number"
          min={0}
          value={value.maxAmount}
          onChange={(event) => set({ maxAmount: event.target.value })}
        />
      </div>
    </div>
  );
}
