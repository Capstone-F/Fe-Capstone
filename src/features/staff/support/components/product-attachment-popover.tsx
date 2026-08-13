"use client";

import React, { useState, useMemo } from "react";
import { PackageSearch, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useStockInventory } from "@/features/stock/hooks/useStock";

interface ProductAttachmentPopoverProps {
  onAttach: (product: any) => void;
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
        ing.toLowerCase().includes(searchLower)
      );
      return matchName || matchSku || matchIngredient;
    });
  }, [inventory, search]);

  const handleSelect = (item: any) => {
    setOpen(false);
    onAttach(item);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          className="shrink-0 rounded-xl h-10 w-10 border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
          title="Gắn sản phẩm"
        >
          <PackageSearch className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[450px] p-0 rounded-2xl shadow-lg border-slate-200"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 p-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400 ml-1" />
          <Input
            placeholder="Tìm theo Tên, SKU hoặc Hoạt chất..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent text-xs focus-visible:ring-0 px-0 shadow-none"
          />
        </div>
        <div className="flex flex-row gap-2 max-w-full overflow-x-auto p-3 snap-x pb-4">
          {isLoading ? (
            <div className="w-full text-center text-xs text-slate-400 p-4">Đang tải...</div>
          ) : filteredItems.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-400 p-4">Không tìm thấy sản phẩm</div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.productVariantId}
                onClick={() => handleSelect(item)}
                className="flex flex-col items-center text-center gap-2 rounded-xl p-2 hover:bg-slate-50 transition-colors w-[120px] shrink-0 border border-slate-100 shadow-sm snap-start"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover bg-white border border-slate-100" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0" />
                )}
                <div className="w-full">
                  <div className="text-xs font-semibold text-slate-700 truncate w-full" title={item.productName}>
                    {item.productName}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate w-full" title={item.sku}>
                    {item.sku}
                  </div>
                  {item.activeIngredients && item.activeIngredients.length > 0 && (
                    <div className="text-[9px] text-emerald-600 truncate w-full mt-0.5" title={item.activeIngredients.join(", ")}>
                      {item.activeIngredients[0]}
                    </div>
                  )}
                  <div className="text-[10px] mt-1">
                    Tồn: <span className={item.stockQuantity > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{item.stockQuantity}</span>
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
