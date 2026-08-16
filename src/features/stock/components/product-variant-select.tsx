"use client";

import React from "react";
import { Package } from "lucide-react";
import { useProductVariantOptions } from "../hooks/use-product-variant-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
}: ProductVariantSelectProps) {
  const { options, isLoading, isError } = useProductVariantOptions();
  const selectedOptionExists = options.some(
    (option) => option.variantId === value,
  );

  const placeholderText = isLoading
    ? "Đang tải danh sách sản phẩm..."
    : isError
      ? "Không thể tải danh sách sản phẩm"
      : options.length === 0
        ? "Chưa có sản phẩm để lựa chọn"
        : "Chọn sản phẩm và biến thể";

  return (
    <div className="space-y-1.5">
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val ?? "")}
        disabled={isLoading || (options.length === 0 && !value)}
      >
        <SelectTrigger id={id} className="h-10 text-xs sm:text-xs">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {value && !selectedOptionExists ? (
            <SelectItem value={value} className="text-xs">
              Biến thể hiện tại (chưa tải được tên)
            </SelectItem>
          ) : null}
          {options.map((opt) => (
            <SelectItem
              key={opt.variantId}
              value={opt.variantId}
              className="text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
