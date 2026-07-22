"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const DEFAULT_PAGE_SIZE_OPTIONS = [8, 12, 24];

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Defaults to the product-grid sizes. */
  pageSizeOptions?: number[];
  /** Unit shown next to each size, e.g. "đơn/trang". */
  perPageLabel?: string;
}

export function ProductPagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  perPageLabel,
}: ProductPaginationProps) {
  const c = {
    title: "Cửa hàng sản phẩm",
    subtitle:
      "Chọn sản phẩm skincare phù hợp với làn da của bạn — đã được kiểm tra hoạt chất.",
    filters: "Bộ lọc",
    reset: "Đặt lại",
    searchLabel: "Tìm kiếm",
    searchPlaceholder: "Tên, thương hiệu, hoạt chất...",
    category: "Danh mục",
    brand: "Thương hiệu",
    ingredient: "Thành phần",
    ingredientPlaceholder: "VD: Niacinamide, Retinol...",
    all: "Tất cả",
    addToCart: "Thêm vào giỏ",
    added: "Đã thêm vào giỏ",
    addError: "Không thể thêm vào giỏ hàng. Vui lòng thử lại.",
    emptyTitle: "Không tìm thấy sản phẩm phù hợp",
    emptyHint: "Thử nới lỏng bộ lọc của bạn.",
    perPage: "sản phẩm/trang",
    pageLabel: "Trang",
  };
  const unitLabel = perPageLabel ?? c.perPage;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <Select
        value={`${pageSize}`}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger size="sm" className="w-28 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size} {unitLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-xs font-medium">
          {c.pageLabel} {page} / {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
