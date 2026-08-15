"use client";

import { Package } from "lucide-react";
import { useProductVariantOptions } from "../hooks/use-product-variant-options";

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
  const { options, isLoading, isError } = useProductVariantOptions();
  const selectedOptionExists = options.some(
    (option) => option.variantId === value,
  );

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={isLoading || (options.length === 0 && !value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
        >
          <option value="">
            {isLoading
              ? "Đang tải danh sách sản phẩm..."
              : isError
                ? "Không thể tải danh sách sản phẩm"
                : options.length === 0
                  ? "Chưa có sản phẩm để lựa chọn"
                  : "Chọn sản phẩm và biến thể"}
          </option>
          {value && !selectedOptionExists ? (
            <option value={value}>Biến thể hiện tại (chưa tải được tên)</option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.variantId} value={opt.variantId}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {(isError || (options.length === 0 && !isLoading)) && (
        <p className="flex items-center gap-1 text-xs text-amber-600">
          <Package className="h-3.5 w-3.5" />
          {isError
            ? "Không thể tải danh sách sản phẩm. Vui lòng thử lại."
            : "Chưa có sản phẩm nào để nhập kho."}
        </p>
      )}
    </div>
  );
}
