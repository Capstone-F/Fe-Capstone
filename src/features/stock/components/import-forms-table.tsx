"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Boxes,
  CheckCircle2,
  FileCheck2,
  FilePenLine,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  useCancelStockImportForm,
  useStockImportForms,
  useSubmitStockImportForm,
} from "../hooks/useStock";
import {
  StockImportFormResponseDto,
  StockImportFormStatus,
} from "../types/stock.types";
import { ConfirmImportModal } from "./confirm-import-modal";
import { CreateImportFormModal } from "./create-import-form-modal";
import { DirectBatchModal } from "./direct-batch-modal";
import { EditImportFormModal } from "./edit-import-form-modal";
import { RejectImportModal } from "./reject-import-modal";

import { getStockStatusLabel } from "../utils/stock-mappers";

export function ImportFormsTable() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page] = useState(1);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [directBatchOpen, setDirectBatchOpen] = useState(false);
  const [editForm, setEditForm] = useState<StockImportFormResponseDto | null>(
    null,
  );
  const [confirmForm, setConfirmForm] =
    useState<StockImportFormResponseDto | null>(null);
  const [rejectForm, setRejectForm] =
    useState<StockImportFormResponseDto | null>(null);

  const statusQuery =
    selectedStatus === "ALL"
      ? undefined
      : (selectedStatus as StockImportFormStatus);
  const { data, isLoading, refetch } = useStockImportForms({
    status: statusQuery,
    page,
    limit: 20,
  });

  const submitMutation = useSubmitStockImportForm();
  const cancelMutation = useCancelStockImportForm();

  const handleSubmitForm = (id: string) => {
    submitMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã gửi duyệt phiếu nhập kho (Chờ duyệt)");
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        toast.error(axiosErr.response?.data?.message || "Gửi duyệt thất bại");
      },
    });
  };

  const handleCancelForm = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã hủy phiếu nhập kho (Đã hủy)");
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        toast.error(axiosErr.response?.data?.message || "Hủy phiếu thất bại");
      },
    });
  };

  const renderBadge = (status: StockImportFormStatus) => {
    const label = getStockStatusLabel(status);
    switch (status) {
      case StockImportFormStatus.DRAFT:
        return (
          <Badge
            variant="outline"
            className="border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          >
            {label}
          </Badge>
        );
      case StockImportFormStatus.SUBMITTED:
        return (
          <Badge
            variant="outline"
            className="border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {label}
          </Badge>
        );
      case StockImportFormStatus.CONFIRMED:
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            {label}
          </Badge>
        );
      case StockImportFormStatus.CANCELLED:
        return (
          <Badge
            variant="outline"
            className="border-slate-300 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          >
            {label}
          </Badge>
        );
      case StockImportFormStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {label}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{label}</Badge>;
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-col space-y-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Boxes className="h-5 w-5 text-emerald-600" />
            Danh sách phiếu nhập kho
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-xs">
            Quản lý vòng đời phiếu nhập kho từ bản nháp, trình duyệt đến khi ghi
            nhận tồn kho thực tế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDirectBatchOpen(true)}
            className="h-9 gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Thao tác Kho trực tiếp
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-9 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu nhập mới
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid h-9 grid-cols-3 text-xs sm:flex">
              <TabsTrigger value="ALL">Tất cả</TabsTrigger>
              <TabsTrigger value="DRAFT">Bản nháp</TabsTrigger>
              <TabsTrigger value="SUBMITTED">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="CONFIRMED">Đã nhập kho</TabsTrigger>
              <TabsTrigger value="CANCELLED">Đã hủy</TabsTrigger>
              <TabsTrigger value="REJECTED">Đã từ chối</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground h-8 self-end text-xs sm:self-auto"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Làm mới
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[110px]">Mã phiếu</TableHead>
                <TableHead>Mã biến thể</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Ngày sản xuất</TableHead>
                <TableHead>Mã lô hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !data || data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground h-32 text-center"
                  >
                    Không tìm thấy phiếu nhập kho nào.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((form) => (
                  <TableRow
                    key={form.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      #{form.id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {form.productVariantId.substring(0, 13)}...
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                      {form.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {form.manufacturingDate
                        ? new Date(form.manufacturingDate).toLocaleDateString(
                            "vi-VN",
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {form.batchCode || "—"}
                    </TableCell>
                    <TableCell>{renderBadge(form.status)}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(form.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* DRAFT state actions */}
                        {form.status === StockImportFormStatus.DRAFT && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              title="Sửa chi tiết"
                              onClick={() => setEditForm(form)}
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-blue-200 bg-blue-50/50 text-xs font-medium text-blue-600 hover:bg-blue-100"
                              onClick={() => handleSubmitForm(form.id)}
                            >
                              <FileCheck2 className="mr-1 h-3.5 w-3.5" /> Trình
                              duyệt
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Hủy phiếu"
                              onClick={() => handleCancelForm(form.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* SUBMITTED state actions */}
                        {form.status === StockImportFormStatus.SUBMITTED && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              title="Sửa chi tiết"
                              onClick={() => setEditForm(form)}
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                              onClick={() => setConfirmForm(form)}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Xác
                              nhận nhập kho
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                              onClick={() => setRejectForm(form)}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}

                        {/* Terminal states */}
                        {(form.status === StockImportFormStatus.CONFIRMED ||
                          form.status === StockImportFormStatus.CANCELLED ||
                          form.status === StockImportFormStatus.REJECTED) && (
                          <span className="px-2 text-xs text-slate-400 italic">
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modals */}
      <CreateImportFormModal open={createOpen} onOpenChange={setCreateOpen} />
      <DirectBatchModal
        open={directBatchOpen}
        onOpenChange={setDirectBatchOpen}
      />
      <EditImportFormModal
        form={editForm}
        open={Boolean(editForm)}
        onOpenChange={(open) => !open && setEditForm(null)}
      />
      <ConfirmImportModal
        form={confirmForm}
        open={Boolean(confirmForm)}
        onOpenChange={(open) => !open && setConfirmForm(null)}
      />
      <RejectImportModal
        form={rejectForm}
        open={Boolean(rejectForm)}
        onOpenChange={(open) => !open && setRejectForm(null)}
      />
    </Card>
  );
}
