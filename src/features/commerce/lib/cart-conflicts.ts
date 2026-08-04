import type { CartLine } from "@/types/domain";
import type { CartConflict } from "../types/cart.types";

/**
 * Unordered pair key. The BE stores conflicts directionally (unique on
 * protocolId + conflictingProtocolId), so a pair recorded in both directions
 * would otherwise render two identical warnings.
 */
function pairKey(conflict: CartConflict): string {
  return [conflict.protocolCode, conflict.conflictingProtocolCode]
    .sort()
    .join("|");
}

export function dedupeConflicts(conflicts: CartConflict[]): CartConflict[] {
  const seen = new Set<string>();
  return conflicts.filter((conflict) => {
    const key = pairKey(conflict);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** Every cart variant id involved in at least one conflict, for line highlighting. */
export function collectConflictingVariantIds(
  conflicts: CartConflict[],
): Set<string> {
  const ids = new Set<string>();
  for (const conflict of conflicts) {
    for (const id of conflict.productVariantIds) {
      ids.add(id);
    }
    for (const id of conflict.conflictingProductVariantIds) {
      ids.add(id);
    }
  }
  return ids;
}

/** BE falls back to `reason` then `''` when no Vietnamese copy is stored. */
export function conflictMessage(conflict: CartConflict): string {
  return (
    conflict.description ||
    conflict.reason ||
    `${conflict.protocolCode} + ${conflict.conflictingProtocolCode}`
  );
}

export interface ConflictPairSummary {
  key: string;
  message: string;
  /** Product names behind protocolCode; empty when a variant is unresolved. */
  productNames: string[];
  /** Product names behind conflictingProtocolCode. */
  conflictingProductNames: string[];
}

/**
 * Name the products on each side of a conflict, for compact surfaces (navbar
 * tooltip) where protocol codes mean nothing to the customer.
 */
export function describeConflicts(
  conflicts: CartConflict[],
  lines: CartLine[],
): ConflictPairSummary[] {
  const nameByVariantId = new Map(
    lines.map((line) => [line.variant.id, line.product.name]),
  );
  const namesOf = (variantIds: string[]): string[] => [
    ...new Set(
      variantIds
        .map((id) => nameByVariantId.get(id))
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return dedupeConflicts(conflicts).map((conflict) => ({
    key: `${conflict.protocolCode}-${conflict.conflictingProtocolCode}`,
    message: conflictMessage(conflict),
    productNames: namesOf(conflict.productVariantIds),
    conflictingProductNames: namesOf(conflict.conflictingProductVariantIds),
  }));
}
