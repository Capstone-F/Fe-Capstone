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
