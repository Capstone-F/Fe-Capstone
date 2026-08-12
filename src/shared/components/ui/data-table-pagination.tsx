"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: DataTablePaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs sm:flex-row dark:border-slate-800 ${className}`}
    >
      <span className="font-medium text-slate-500">
        {totalItems === 0 ? (
          "Không có dữ liệu"
        ) : (
          <>
            Hiển thị{" "}
            <strong className="text-slate-700">
              {from}–{to}
            </strong>{" "}
            trong tổng <strong className="text-slate-700">{totalItems}</strong>{" "}
            mục · Trang <strong className="text-slate-700">{page}</strong> /{" "}
            {totalPages}
          </>
        )}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-7 rounded-lg border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Trước
        </Button>

        {/* Page number pills — show up to 5 around current */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
          )
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(item as number)}
                className={`h-7 min-w-[28px] rounded-lg px-2 text-xs font-bold transition-all ${
                  item === page
                    ? "border-[#2C3E35] bg-[#2C3E35] text-white hover:bg-[#3A5246] hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </Button>
            ),
          )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="h-7 rounded-lg border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          Sau
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
