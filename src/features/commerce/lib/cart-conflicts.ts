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
