"use client";

import { useMemo, useState } from "react";
import { Building2, RotateCw, Search, SearchX } from "lucide-react";
import { useClinics } from "../hooks/useClinics";
import { ClinicCard, ClinicCardSkeleton } from "../components/clinic-card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import useDebounce from "@/shared/hooks/useDebounce";
import { normalizeVietnamese } from "@/shared/utils/string";

const PAGE_SIZE = 12;

export function ClinicsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const { data, isLoading, isError, error, refetch } = useClinics({
    page,
    limit: PAGE_SIZE,
  });

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const filteredClinics = useMemo(() => {
    const list = data?.items || [];
    if (!debouncedSearch.trim()) return list;
    const query = normalizeVietnamese(debouncedSearch);
    return list.filter(
      (c) =>
        normalizeVietnamese(c.name).includes(query) ||
        (c.address && normalizeVietnamese(c.address).includes(query)),
    );
  }, [data?.items, debouncedSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] shadow-xs dark:bg-emerald-950 dark:text-emerald-300">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Mạng Lưới Phòng Khám Đối Tác
                </h1>
                {!isLoading && (
                  <span className="rounded-full bg-[#E2EBE6] px-2.5 py-0.5 text-xs font-bold text-[#2C3E35] dark:bg-emerald-950/80 dark:text-emerald-300">
                    {total} phòng khám
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                Khám phá và tìm kiếm các phòng khám da liễu đạt chuẩn chất lượng
                liên kết cùng GlowScan.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="w-full sm:max-w-xs">
            <div className="relative">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm tên phòng khám, địa chỉ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="h-10 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 text-xs shadow-2xs focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClinicCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/30 p-8 text-center dark:border-rose-950/50 dark:bg-rose-950/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <RotateCw className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
            Không thể tải danh sách phòng khám
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {(error as Error)?.message ||
              "Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại."}
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
          >
            Thử lại
          </Button>
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
            {search
              ? `Không tìm thấy phòng khám khớp với "${search}"`
              : "Chưa có phòng khám đối tác nào"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {search
              ? "Vui lòng kiểm tra lại chính tả hoặc thử tìm kiếm với từ khóa khác."
              : "Danh sách phòng khám sẽ được cập nhật trong thời gian sớm nhất."}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-4 rounded-xl text-xs font-semibold"
            >
              Xóa từ khóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && !search && (
            <div className="flex justify-center border-t border-slate-100 pt-6 dark:border-slate-800">
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
