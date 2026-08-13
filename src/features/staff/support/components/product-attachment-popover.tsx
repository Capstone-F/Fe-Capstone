"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { PackageSearch, Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { InventoryItemDto } from "@/features/stock/types/stock.types";
import { useStockInventory } from "@/features/stock/hooks/useStock";

interface ProductAttachmentPopoverProps {
  onAttach: (product: InventoryItemDto) => void;
  disabled?: boolean;
}

export function ProductAttachmentPopover({
  onAttach,
  disabled,
}: ProductAttachmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: inventory, isLoading } = useStockInventory();

  const filteredItems = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchName = item.productName.toLowerCase().includes(searchLower);
      const matchSku = item.sku.toLowerCase().includes(searchLower);
      const matchIngredient = item.activeIngredients?.some((ing: string) =>
        ing.toLowerCase().includes(searchLower),
      );
      return matchName || matchSku || matchIngredient;
    });
  }, [inventory, search]);

  const handleSelect = (item: InventoryItemDto) => {
    setOpen(false);
    onAttach(item);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
        title="Gắn sản phẩm"
      >
        <PackageSearch className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[450px] rounded-2xl border-slate-200 p-0 shadow-lg"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 p-2">
          <Search className="ml-1 h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Tìm theo Tên, SKU hoặc Hoạt chất..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex max-w-full snap-x flex-row gap-2 overflow-x-auto p-3 pb-4">
          {isLoading ? (
            <div className="w-full p-4 text-center text-xs text-slate-400">
              Đang tải...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="w-full p-4 text-center text-xs text-slate-400">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.productVariantId}
                onClick={() => handleSelect(item)}
                className="flex w-[120px] shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-slate-100 p-2 text-center shadow-sm transition-colors hover:bg-slate-50"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg border border-slate-100 bg-white object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-slate-100" />
                )}
                <div className="w-full">
                  <div
                    className="w-full truncate text-xs font-semibold text-slate-700"
                    title={item.productName}
                  >
                    {item.productName}
                  </div>
                  <div
                    className="mt-1 w-full truncate text-[10px] text-slate-500"
                    title={item.sku}
                  >
                    {item.sku}
                  </div>
                  {item.activeIngredients &&
                    item.activeIngredients.length > 0 && (
                      <div
                        className="mt-0.5 w-full truncate text-[9px] text-emerald-600"
                        title={item.activeIngredients.join(", ")}
                      >
                        {item.activeIngredients[0]}
                      </div>
                    )}
                  <div className="mt-1 text-[10px]">
                    Tồn:{" "}
                    <span
                      className={
                        item.stockQuantity > 0
                          ? "font-bold text-emerald-600"
                          : "font-bold text-rose-500"
                      }
                    >
                      {item.stockQuantity}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
