"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Minus, PackageX, Plus } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/core/api/errors";
import { useAddToCart } from "@/features/commerce/hooks/useCart";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { formatVnd } from "@/shared/utils/format";
import {
  formatRemainingMl,
  STOCK_WARNING_BADGE_CLASS,
  STOCK_WARNING_LABELS,
} from "../constants/routine-tracking";
import { useSimilarProducts } from "../hooks/useSimilarProducts";
import type { LowStockItem } from "../lib/restock-prompt";

/**
 * Same-category alternatives. Mounted collapsed and only fetches once expanded, so a
 * dialog with several rows costs no extra requests on open.
 */
function SimilarProducts({ productId }: { productId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useSimilarProducts(productId, expanded);

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
      >
        <ChevronDown
          className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        Sản phẩm tương tự
      </button>

      {expanded && isLoading && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang tải gợi ý...
        </p>
      )}

      {/* A failed suggestion must never block the primary reorder action. */}
      {expanded && isError && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          Chưa tải được gợi ý. Bạn vẫn có thể mua lại sản phẩm ở trên.
        </p>
      )}

      {expanded && data !== undefined && data.length === 0 && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          Không có sản phẩm tương tự.
        </p>
      )}

      {expanded && data !== undefined && data.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {data.map((product) => (
            <Link
              key={product.productId}
              href={`/products/${product.productId}`}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              {product.name}
              {product.priceVnd !== null && (
                <span className="ml-1 font-normal text-slate-400">
                  {formatVnd(product.priceVnd)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface RestockRowProps {
  item: LowStockItem;
  checked: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (quantity: number) => void;
}

function RestockRow({
  item,
  checked,
  quantity,
  onToggle,
  onQuantityChange,
}: RestockRowProps) {
  const remaining = formatRemainingMl(item.remainingMl);

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 p-3">
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-1 shrink-0"
        aria-label={`Chọn ${item.name}`}
      />

      {item.imageUrl !== null ? (
        // Catalog media hosts are not in next.config images.remotePatterns, so a plain
        // img avoids a runtime domain error on any host but placehold.co.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
          <PackageX className="h-4 w-4 text-slate-300" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-xs font-bold text-slate-800">
            {item.name}
          </span>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${STOCK_WARNING_BADGE_CLASS[item.warning]}`}
          >
            {STOCK_WARNING_LABELS[item.warning]}
            {remaining !== null && ` · ${remaining}`}
          </span>
        </div>

        {item.productId !== null && (
          <Link
            href={`/products/${item.productId}`}
            className="text-[11px] font-semibold text-[#6b5cf6] hover:underline"
          >
            Xem chi tiết →
          </Link>
        )}

        {item.productId !== null && (
          <SimilarProducts productId={item.productId} />
        )}
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={quantity <= 1}
          onClick={() => onQuantityChange(quantity - 1)}
          className="h-7 w-7 rounded-lg p-0"
          aria-label="Giảm số lượng"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 pt-1 text-center text-xs font-bold text-slate-700">
          {quantity}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onQuantityChange(quantity + 1)}
          className="h-7 w-7 rounded-lg p-0"
          aria-label="Tăng số lượng"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: LowStockItem[];
}

export function RestockDialog({
  open,
  onOpenChange,
  items,
}: RestockDialogProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    items.map((item) => item.variantId),
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const addToCart = useAddToCart();

  const toggle = (variantId: string) => {
    setCheckedIds((previous) =>
      previous.includes(variantId)
        ? previous.filter((id) => id !== variantId)
        : [...previous, variantId],
    );
  };

  const setQuantity = (variantId: string, quantity: number) => {
    setQuantities((previous) => ({
      ...previous,
      [variantId]: Math.max(1, quantity),
    }));
  };

  const selected = items.filter((item) => checkedIds.includes(item.variantId));

  const handleAdd = async () => {
    const failed: string[] = [];

    // Sequential on purpose: N is small, and it keeps per-product error attribution
    // simple while avoiding concurrent writes racing the cart cache.
    for (const item of selected) {
      try {
        await addToCart.mutateAsync({
          productVariantId: item.variantId,
          quantity: quantities[item.variantId] ?? 1,
        });
      } catch (error) {
        failed.push(item.name);
        console.error("Failed to add product to cart:", error);
        if (error instanceof ApiError && error.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return;
        }
      }
    }

    if (failed.length > 0) {
      // Keep the dialog open with the failed rows still checked so a retry only
      // re-adds what actually failed.
      setCheckedIds(
        items
          .filter((item) => failed.includes(item.name))
          .map((item) => item.variantId),
      );
      toast.error(`Không thêm được: ${failed.join(", ")}. Vui lòng thử lại.`);
      return;
    }

    setAdded(true);
    toast.success(`Đã thêm ${selected.length} sản phẩm vào giỏ hàng.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Sản phẩm trong lộ trình sắp hết
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-slate-500">
          Mua lại để giữ lộ trình chăm sóc da không bị gián đoạn.
        </p>

        <div className="space-y-2 pt-1">
          {items.map((item) => (
            <RestockRow
              key={item.variantId}
              item={item}
              checked={checkedIds.includes(item.variantId)}
              quantity={quantities[item.variantId] ?? 1}
              onToggle={() => toggle(item.variantId)}
              onQuantityChange={(quantity) =>
                setQuantity(item.variantId, quantity)
              }
            />
          ))}
        </div>

        {added ? (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Tiếp tục xem routine
            </Button>
            <Link href="/cart">
              <Button
                size="sm"
                className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
              >
                Đến giỏ hàng →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Để sau
            </Button>
            <Button
              size="sm"
              disabled={selected.length === 0 || addToCart.isPending}
              onClick={handleAdd}
              className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              {addToCart.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Thêm {selected.length} sản phẩm vào giỏ
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
