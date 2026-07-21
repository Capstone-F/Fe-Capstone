"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { vi } from "@/config/locales/vi";
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
  const c = vi.commerce.products;
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
