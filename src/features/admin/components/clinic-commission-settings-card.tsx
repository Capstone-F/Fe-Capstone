"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Percent,
  Search,
} from "lucide-react";

import type { AdminClinic } from "@/features/admin/api/admin-clinics.api";
import {
  useAdminClinics,
  useUpdateClinicCommission,
} from "@/features/admin/hooks/useAdminClinics";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import useDebounce from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 8;

type PendingUpdate = {
  clinic: AdminClinic;
  percent: number;
};

function parsePercent(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const percent = Number(normalized);
  return percent >= 0 && percent <= 100 ? percent : null;
}

export function ClinicCommissionSettingsCard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(
    null,
  );
  const debouncedSearch = useDebounce(search.trim(), 350);

  const clinicsQuery = useAdminClinics({
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const updateCommission = useUpdateClinicCommission();
  const clinics = clinicsQuery.data?.items ?? [];
  const total = clinicsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getDraft = (clinic: AdminClinic) =>
    drafts[clinic.id] ?? String(clinic.commissionPercent);

  const requestUpdate = (clinic: AdminClinic) => {
    const percent = parsePercent(getDraft(clinic));
    if (percent === null) {
      setRowErrors((current) => ({
        ...current,
        [clinic.id]: "Nhập số từ 0–100, tối đa 2 chữ số thập phân.",
      }));
      return;
    }

    setRowErrors((current) => ({ ...current, [clinic.id]: "" }));
    setPendingUpdate({ clinic, percent });
  };

  const confirmUpdate = async () => {
    if (!pendingUpdate) return;

    const clinicId = pendingUpdate.clinic.id;
    try {
      await updateCommission.mutateAsync({
        id: clinicId,
        percent: pendingUpdate.percent,
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[clinicId];
        return next;
      });
      setPendingUpdate(null);
    } catch {
      // The mutation displays the API error and the draft remains editable.
    }
  };

  const renderEditor = (clinic: AdminClinic) => {
    const draft = getDraft(clinic);
    const parsed = parsePercent(draft);
    const unchanged = parsed === clinic.commissionPercent;
    const isUpdating =
      updateCommission.isPending && pendingUpdate?.clinic.id === clinic.id;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-36">
            <Input
              aria-label={`Tỷ lệ hoa hồng của ${clinic.name}`}
              inputMode="decimal"
              value={draft}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "" || /^\d{0,3}(?:[.,]\d{0,2})?$/.test(value)) {
                  setDrafts((current) => ({ ...current, [clinic.id]: value }));
                  setRowErrors((current) => ({
                    ...current,
                    [clinic.id]: "",
                  }));
                }
              }}
              className="h-9 rounded-xl pr-8 font-mono text-sm"
            />
            <Percent className="text-muted-foreground pointer-events-none absolute top-2.5 right-2.5 h-4 w-4" />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => requestUpdate(clinic)}
            disabled={unchanged || isUpdating}
            className="rounded-xl"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu"}
          </Button>
        </div>
        {rowErrors[clinic.id] ? (
          <p className="text-destructive max-w-64 text-xs">
            {rowErrors[clinic.id]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="space-y-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
                Hoa hồng theo phòng khám
              </CardTitle>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Tỷ lệ mới chỉ áp dụng cho escrow được tạo sau khi lưu. Phòng
                khám mới mặc định 10%.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
              <Input
                aria-label="Tìm phòng khám"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên phòng khám..."
                className="h-9 rounded-xl pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {clinicsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : clinicsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Không thể tải cấu hình hoa hồng theo phòng khám.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => clinicsQuery.refetch()}
                >
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          ) : clinics.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
              {debouncedSearch
                ? "Không tìm thấy phòng khám phù hợp."
                : "Chưa có phòng khám nào trong hệ thống."}
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng khám</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-72">Tỷ lệ hoa hồng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <p className="font-semibold">{clinic.name}</p>
                          <p className="text-muted-foreground max-w-md truncate text-xs">
                            {clinic.address || "Chưa cập nhật địa chỉ"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <ClinicStatusBadge clinic={clinic} />
                        </TableCell>
                        <TableCell>{renderEditor(clinic)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {clinics.map((clinic) => (
                  <article
                    key={clinic.id}
                    className="space-y-4 rounded-2xl border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {clinic.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {clinic.address || "Chưa cập nhật địa chỉ"}
                        </p>
                      </div>
                      <ClinicStatusBadge clinic={clinic} />
                    </div>
                    {renderEditor(clinic)}
                  </article>
                ))}
              </div>

              {pageCount > 1 ? (
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-xs">
                    Trang {page}/{pageCount} · {total} phòng khám
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Trang trước"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Trang sau"
                      disabled={page >= pageCount}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingUpdate)}
        onOpenChange={(open) => {
          if (!open && !updateCommission.isPending) setPendingUpdate(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thay đổi hoa hồng</DialogTitle>
            <DialogDescription>
              Kiểm tra đúng phòng khám trước khi lưu cấu hình mới.
            </DialogDescription>
          </DialogHeader>
          {pendingUpdate ? (
            <div className="rounded-2xl border bg-slate-50 p-4 text-sm dark:bg-slate-950">
              <p className="font-semibold">{pendingUpdate.clinic.name}</p>
              <p className="text-muted-foreground mt-2">
                {pendingUpdate.clinic.commissionPercent}% →{" "}
                <strong className="text-foreground">
                  {pendingUpdate.percent}%
                </strong>
              </p>
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                Escrow đã tạo giữ nguyên tỷ lệ cũ. Tỷ lệ mới chỉ áp dụng cho
                giao dịch phát sinh sau thời điểm cập nhật.
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingUpdate(null)}
              disabled={updateCommission.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={confirmUpdate}
              disabled={updateCommission.isPending}
            >
              {updateCommission.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClinicStatusBadge({ clinic }: { clinic: AdminClinic }) {
  return clinic.isActive ? (
    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
      Đang hoạt động
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Tạm ngừng
    </Badge>
  );
}
