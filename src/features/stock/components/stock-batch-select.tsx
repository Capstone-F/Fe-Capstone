"use client";

import React, { useState } from "react";
import { useStockImportForms } from "../hooks/useStock";
import { useProducts } from "@/features/commerce/hooks/useProducts";
import { Input } from "@/shared/components/ui/input";
import { Layers, Hash } from "lucide-react";

interface StockBatchSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export function StockBatchSelect({
  value,
  onChange,
  id = "batchId",
  required = true,
}: StockBatchSelectProps) {
  const { data: formsData, isLoading: isFormsLoading } = useStockImportForms();
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    limit: 100,
  });
  const [isManualInput, setIsManualInput] = useState(false);

  // Map variantId -> product & variant name info
  const variantMap = new Map<string, string>();
  if (productsData?.products) {
    for (const product of productsData.products) {
      if (product.variants) {
        for (const variant of product.variants) {
          const vol = variant.volume ? ` (${variant.volume})` : "";
          variantMap.set(
            variant.id,
            `${product.name} [SKU: ${variant.sku}]${vol}`,
          );
        }
      }
    }
  }

  // Extract batches from confirmed import forms or forms with stockBatchId / batchCode
  const options: Array<{
    batchId: string;
    label: string;
  }> = [];

  if (formsData?.items) {
    for (const form of formsData.items) {
      const bId = form.stockBatchId || form.id;
      const variantName =
        variantMap.get(form.productVariantId) ||
        `Variant (${form.productVariantId.substring(0, 8)})`;
      const codeStr = form.batchCode
        ? `Mã Lô: ${form.batchCode}`
        : `Mã Phiếu: ${form.id.substring(0, 8)}`;
      options.push({
        batchId: bId,
        label: `${codeStr} - ${variantName} (SL: ${form.quantity})`,
      });
    }
  }

  const isLoading = isFormsLoading || isProductsLoading;

  if (isManualInput) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Hash className="h-3 w-3" /> Nhập Batch ID / UUID trực tiếp
          </span>
          <button
            type="button"
            onClick={() => setIsManualInput(false)}
            className="text-xs font-medium text-emerald-600 hover:underline"
          >
            ← Chọn từ danh sách lô kho
          </button>
        </div>
        <Input
          id={id}
          placeholder="Nhập Stock Batch UUID..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
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
            ? "-- Đang tải danh sách lô kho --"
            : options.length === 0
              ? "-- Chưa có lô kho tồn --"
              : "-- Chọn lô sản phẩm cần điều chỉnh --"}
        </option>
        {options.map((opt) => (
          <option key={opt.batchId} value={opt.batchId}>
            {opt.label}
          </option>
        ))}
        <option value="__MANUAL__">✏️ Nhập Batch ID thủ công...</option>
      </select>

      {options.length === 0 && !isLoading && (
        <p className="flex items-center gap-1 text-xs text-amber-600">
          <Layers className="h-3.5 w-3.5" /> Chưa có lô kho khả dụng trong DB.
          Chọn &quot;Nhập Batch ID thủ công&quot; ở trên nếu có UUID.
        </p>
      )}
    </div>
  );
}
