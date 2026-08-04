"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { CartLine } from "@/types/domain";
import { describeConflicts } from "../lib/cart-conflicts";
import type { CartConflict } from "../types/cart.types";

const cc = {
  title: "Sản phẩm trong giỏ có thể xung đột",
  ariaLabel: "Giỏ hàng có cảnh báo kết hợp hoạt chất",
  pairSeparator: " ✕ ",
};

interface CartConflictIndicatorProps {
  conflicts: CartConflict[];
  lines: CartLine[];
  /** Positioning is the caller's job — each navbar anchors its own cart icon. */
  className?: string;
}

/**
 * Red "!" dot on the cart icon. Hovering names the products that clash; the
 * warning is informational and never blocks checkout.
 */
export function CartConflictIndicator({
  conflicts,
  lines,
  className,
}: CartConflictIndicatorProps) {
  const pairs = describeConflicts(conflicts, lines);
  if (pairs.length === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // A span, not a button: this sits inside the cart <Link>.
          <span
            aria-label={cc.ariaLabel}
            className={cn(
              "bg-destructive flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none font-bold text-white ring-2 ring-white",
              className,
            )}
          />
        }
      >
        !
      </TooltipTrigger>
      <TooltipContent className="max-w-xs flex-col items-start gap-1.5 py-2">
        <span className="font-semibold">{cc.title}</span>
        <ul className="flex flex-col gap-1.5">
          {pairs.map((pair) => (
            <li key={pair.key} className="flex flex-col">
              {pair.productNames.length > 0 &&
                pair.conflictingProductNames.length > 0 && (
                  <span className="font-medium">
                    {pair.productNames.join(", ")}
                    {cc.pairSeparator}
                    {pair.conflictingProductNames.join(", ")}
                  </span>
                )}
              <span className="opacity-75">{pair.message}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
