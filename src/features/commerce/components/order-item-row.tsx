import { vi } from "@/config/locales/vi";
import { HydratedOrderItem } from "../lib/order-hydration";
import { formatVnd } from "@/shared/utils/format";
import { CategoryPlaceholder } from "./category-placeholder";

/**
 * A single purchased line. `product` is null when the variant's product has
 * left the catalog — the line still renders with its historical prices.
 */
export function OrderItemRow({ item }: { item: HydratedOrderItem }) {
  const t = vi.commerce.orders;
  const name =
    item.product?.name ??
    `${t.unknownProduct} #${item.productVariantId.slice(0, 8).toUpperCase()}`;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200">
        {item.product ? (
          <CategoryPlaceholder categoryName={item.product.categoryName} />
        ) : (
          <div className="h-full w-full bg-slate-50" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
        {item.product ? (
          <p className="text-muted-foreground truncate text-xs">
            {item.product.brandName}
          </p>
        ) : null}
        <p className="text-muted-foreground mt-0.5 text-xs">
          {t.quantityShort} {item.quantity} × {formatVnd(item.unitPriceVnd)}
        </p>
      </div>

      <span className="shrink-0 text-sm font-bold text-slate-800">
        {formatVnd(item.lineTotalVnd)}
      </span>
    </div>
  );
}
