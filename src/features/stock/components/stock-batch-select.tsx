"use client";

import React, { useState } from "react";
import { useStockImportForms } from "../hooks/useStock";
import { useProducts } from "@/features/commerce/hooks/useProducts";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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

  const placeholderText = isLoading
    ? "-- Đang tải danh sách lô kho --"
    : options.length === 0
      ? "-- Chưa có lô kho tồn --"
      : "-- Chọn lô sản phẩm cần điều chỉnh --";

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
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Select
        value={value || ""}
        onValueChange={(val) => {
          if (val === "__MANUAL__") {
            setIsManualInput(true);
            onChange("");
          } else {
            onChange(val ?? "");
          }
        }}
      >
        <SelectTrigger id={id} className="h-10 text-xs sm:text-xs">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((opt) => (
            <SelectItem
              key={opt.batchId}
              value={opt.batchId}
              className="text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
          <SelectItem
            value="__MANUAL__"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            ✏️ Nhập Batch ID thủ công...
          </SelectItem>
        </SelectContent>
      </Select>

      {options.length === 0 && !isLoading && (
        <p className="flex items-center gap-1 text-xs text-amber-600">
          <Layers className="h-3.5 w-3.5" /> Chưa có lô kho khả dụng trong DB.
          Chọn &quot;Nhập Batch ID thủ công&quot; ở trên nếu có UUID.
        </p>
      )}
    </div>
  );
}
