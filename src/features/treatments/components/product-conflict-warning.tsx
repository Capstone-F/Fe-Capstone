"use client";

import { ShieldAlert, TriangleAlert } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  CandidateConflictWarning,
  ConflictSeverity,
  TreatmentProductConflict,
} from "../types/treatment.types";

const severityRank: Record<ConflictSeverity, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const severityLabel: Record<ConflictSeverity, string> = {
  HIGH: "Nguy cơ cao",
  MEDIUM: "Cần lưu ý",
  LOW: "Theo dõi",
};

function severityClassName(severity: ConflictSeverity): string {
  if (severity === "HIGH") {
    return "border-red-300 bg-red-50 text-red-700";
  }
  if (severity === "MEDIUM") {
    return "border-amber-300 bg-amber-50 text-amber-800";
  }
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function SeverityBadge({ severity }: { severity: ConflictSeverity }) {
  return (
    <Badge variant="outline" className={severityClassName(severity)}>
      <TriangleAlert /> {severityLabel[severity]}
    </Badge>
  );
}

export function CandidateConflictBadge({
  warnings,
  resolveProductName,
}: {
  warnings: CandidateConflictWarning[];
  resolveProductName: (variantId: string) => string;
}) {
  if (!warnings.length) return null;

  const ordered = [...warnings].sort(
    (left, right) => severityRank[left.severity] - severityRank[right.severity],
  );
  const highestSeverity = ordered[0].severity;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={`${warnings.length} cảnh báo xung đột sản phẩm`}
            className="rounded-full focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={(event) => event.preventDefault()}
          />
        }
      >
        <SeverityBadge severity={highestSeverity} />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm flex-col items-start gap-2 py-3">
        <span className="font-semibold">Xung đột với sản phẩm đã chọn</span>
        <ul className="space-y-2">
          {ordered.map((warning, index) => (
            <li
              key={`${warning.selectedProductVariantId}-${warning.protocolCode}-${warning.conflictingProtocolCode}-${index}`}
            >
              <span className="font-medium">
                {severityLabel[warning.severity]} ·{" "}
                {resolveProductName(warning.selectedProductVariantId)}
              </span>
              <span className="block opacity-80">{warning.description}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

export function PhaseProductConflictAlert({
  conflicts,
  resolveProductName,
}: {
  conflicts: TreatmentProductConflict[];
  resolveProductName: (variantId: string) => string;
}) {
  if (!conflicts.length) return null;

  const ordered = [...conflicts].sort(
    (left, right) => severityRank[left.severity] - severityRank[right.severity],
  );
  const hasHighSeverity = ordered.some((item) => item.severity === "HIGH");

  return (
    <Alert
      className={cn(
        "lg:col-span-2",
        hasHighSeverity
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-amber-200 bg-amber-50 text-amber-900",
      )}
    >
      <ShieldAlert />
      <AlertTitle>
        Đã lưu sản phẩm, nhưng có {conflicts.length} cảnh báo kết hợp
      </AlertTitle>
      <AlertDescription className="mt-2 text-current">
        <ul className="space-y-2">
          {ordered.map((conflict, index) => {
            const products = conflict.productVariantIds.map(resolveProductName);
            const conflictingProducts =
              conflict.conflictingProductVariantIds.map(resolveProductName);
            return (
              <li
                key={`${conflict.protocolCode}-${conflict.conflictingProtocolCode}-${index}`}
                className="rounded-lg bg-white/70 p-2.5"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={conflict.severity} />
                  <span className="text-xs font-semibold">
                    {products.join(", ")} × {conflictingProducts.join(", ")}
                  </span>
                </div>
                <p className="text-xs">{conflict.description}</p>
                {conflict.reason && (
                  <p className="mt-1 text-xs opacity-75">{conflict.reason}</p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs font-medium">
          Cảnh báo chỉ hỗ trợ quyết định chuyên môn và không ngăn lưu phác đồ.
        </p>
      </AlertDescription>
    </Alert>
  );
}
