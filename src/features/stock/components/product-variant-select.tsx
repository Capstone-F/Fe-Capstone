"use client";

import React, { useState } from "react";
import { useProducts } from "@/features/commerce/hooks/useProducts";
import { Input } from "@/shared/components/ui/input";
import { Package, Hash } from "lucide-react";

interface ProductVariantSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export function ProductVariantSelect({
  value,
  onChange,
  id = "variantId",
  required = true,
}: ProductVariantSelectProps) {
  const { data, isLoading } = useProducts({ limit: 100 });
  const [isManualInput, setIsManualInput] = useState(false);

  // Flatten products into variant options
  const options: Array<{
    variantId: string;
    label: string;
    sku: string;
    productName: string;
  }> = [];

  if (data?.products) {
    for (const product of data.products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const vol = variant.volume ? ` (${variant.volume})` : "";
          options.push({
            variantId: variant.id,
            label: `${product.name} - SKU: ${variant.sku}${vol}`,
            sku: variant.sku,
            productName: product.name,
          });
        }
      }
    }
  }

  if (isManualInput) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Hash className="h-3 w-3" /> Nhập UUID trực tiếp
          </span>
          <button
            type="button"
            onClick={() => setIsManualInput(false)}
            className="text-xs font-medium text-emerald-600 hover:underline"
          >
            ← Chọn từ danh sách sản phẩm
          </button>
        </div>
        <Input
          id={id}
          placeholder="Nhập ID biến thể sản phẩm (UUID)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => {
            if (e.target.value === "__MANUAL__") {
              setIsManualInput(true);
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          required={required}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
        >
          <option value="">
            {isLoading
              ? "-- Đang tải danh sách sản phẩm --"
              : options.length === 0
                ? "-- Không tìm thấy biến thể sản phẩm nào --"
                : "-- Chọn biến thể sản phẩm --"}
          </option>
          {options.map((opt) => (
            <option key={opt.variantId} value={opt.variantId}>
              {opt.label}
            </option>
          ))}
          <option value="__MANUAL__">✏️ Nhập UUID thủ công...</option>
        </select>
      </div>

      {options.length === 0 && !isLoading && (
        <p className="flex items-center gap-1 text-xs text-amber-600">
          <Package className="h-3.5 w-3.5" /> Chưa có sản phẩm trong DB. Bấm
          &quot;Nhập UUID thủ công&quot; bên dưới.
        </p>
      )}
    </div>
  );
}
