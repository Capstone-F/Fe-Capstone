"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { conflictMessage, dedupeConflicts } from "../lib/cart-conflicts";
import type { CartConflict, ConflictSeverity } from "../types/cart.types";

const cc = {
  title: "Lưu ý kết hợp hoạt chất",
  hint: "Đây chỉ là khuyến nghị sử dụng — bạn vẫn có thể tiếp tục đặt hàng.",
  severityLabel: {
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp",
  } satisfies Record<ConflictSeverity, string>,
};

const severityBadge: Record<ConflictSeverity, string> = {
  HIGH: "border-destructive/30 bg-destructive-soft text-destructive",
  MEDIUM: "border-warning/40 bg-white text-warning",
  LOW: "border-slate-200 bg-white text-slate-600",
};

/** Unknown severities from the BE degrade to the mildest styling. */
function severityKey(severity: string): ConflictSeverity {
  return severity === "HIGH" || severity === "MEDIUM" || severity === "LOW"
    ? severity
    : "LOW";
}

interface CartConflictAlertProps {
  conflicts: CartConflict[];
  className?: string;
}

export function CartConflictAlert({
  conflicts,
  className,
}: CartConflictAlertProps) {
  const unique = dedupeConflicts(conflicts);
  if (unique.length === 0) {
    return null;
  }

  return (
    <div
      role="status"
      className={cn(
        "border-warning/40 bg-warning-soft flex flex-col gap-2 rounded-xl border p-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <TriangleAlert className="text-warning h-4 w-4 shrink-0" />
        <span className="text-xs font-bold text-slate-900">{cc.title}</span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {unique.map((conflict) => {
          const severity = severityKey(conflict.severity);
          return (
            <li
              key={`${conflict.protocolCode}-${conflict.conflictingProtocolCode}`}
              className="flex items-start gap-2 text-xs"
            >
              <span
                className={cn(
                  "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                  severityBadge[severity],
                )}
              >
                {cc.severityLabel[severity]}
              </span>
              <span className="pt-0.5 text-slate-700">
                {conflictMessage(conflict)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-slate-600">{cc.hint}</p>
    </div>
  );
}
