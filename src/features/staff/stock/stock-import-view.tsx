"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Boxes,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Send,
  Ban,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";

export type StockImportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED";

export interface StockImportForm {
  id: string;
  status: StockImportStatus;
  productVariantId: string;
  quantity: number;
  manufacturingDate?: string;
  batchCode?: string;
  createdByUserId?: string;
  stockBatchId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusBadges: Record<
  StockImportStatus,
  { label: string; class: string }
> = {
  DRAFT: { label: "Bản nháp", class: "bg-slate-100 text-slate-700" },
  SUBMITTED: {
    label: "Chờ duyệt nhập",
    class: "bg-blue-100 text-blue-800 font-bold",
  },
  CONFIRMED: {
    label: "Đã nhập kho",
    class: "bg-emerald-600 text-white font-bold",
  },
  CANCELLED: { label: "Đã hủy", class: "bg-gray-100 text-gray-500" },
  REJECTED: {
    label: "Đã từ chối",
    class: "bg-rose-100 text-rose-800 font-bold",
  },
};

export function StockImportView() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StockImportStatus | "ALL">(
    "ALL",
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<StockImportForm | null>(null);

  const [newVariantId, setNewVariantId] = useState("");
  const [newQuantity, setNewQuantity] = useState(10);
  const [newMfgDate, setNewMfgDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newBatchCode, setNewBatchCode] = useState(
    `LOT-${new Date().getFullYear()}-001`,
  );

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["stock-import-forms", statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await apiClient.get<{
        items: StockImportForm[];
        total: number;
      }>(API_ENDPOINTS.STOCK.IMPORT_FORMS, { params });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: {
      productVariantId: string;
      quantity: number;
      manufacturingDate: string;
      batchCode?: string;
    }) => apiClient.post(API_ENDPOINTS.STOCK.IMPORT_FORMS, body),
    onSuccess: () => {
      toast.success("Tạo bản nháp phiếu nhập kho thành công!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setCreateModalOpen(false);
      setNewVariantId("");
    },
    onError: (err: unknown) => {
      const errorMsg = (
        err as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Không thể tạo phiếu nhập kho";
      toast.error(msg);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(API_ENDPOINTS.STOCK.SUBMIT_IMPORT_FORM(id)),
    onSuccess: () => {
      toast.success("Đã trình duyệt phiếu nhập kho!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setDetailItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể trình duyệt phiếu";
      toast.error(msg);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(API_ENDPOINTS.STOCK.CONFIRM_IMPORT_FORM(id)),
    onSuccess: (res) => {
      const batchId = res.data?.stockBatchId || "N/A";
      toast.success(`Xác nhận nhập kho thành công! Mã lô hàng: ${batchId}`);
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setDetailItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể xác nhận nhập kho";
      toast.error(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(API_ENDPOINTS.STOCK.CANCEL_IMPORT_FORM(id)),
    onSuccess: () => {
      toast.success("Đã hủy phiếu nhập kho!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setDetailItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể hủy phiếu";
      toast.error(msg);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(API_ENDPOINTS.STOCK.REJECT_IMPORT_FORM(id)),
    onSuccess: () => {
      toast.success("Đã từ chối phiếu nhập kho!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setDetailItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể từ chối phiếu";
      toast.error(msg);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantId.trim()) {
      toast.error("Vui lòng nhập Product Variant ID.");
      return;
    }

    createMutation.mutate({
      productVariantId: newVariantId.trim(),
      quantity: newQuantity,
      manufacturingDate: newMfgDate,
      batchCode: newBatchCode.trim() || undefined,
    });
  };

  const forms = data?.items || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={Boxes}
        title="Quản Lý Phiếu Nhập Kho Sản Phẩm (Stock Imports)"
        description="Tạo bản nháp phiếu nhập, trình duyệt, xác nhận cộng kho thực tế và quản lý các lô hàng."
        actions={
          <>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Tạo Phiếu Nhập Nháp
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
          </>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { key: "ALL", label: "Tất cả phiếu" },
          { key: "DRAFT", label: "Bản nháp" },
          { key: "SUBMITTED", label: "Chờ duyệt" },
          { key: "CONFIRMED", label: "Đã nhập kho" },
          { key: "CANCELLED", label: "Đã hủy" },
          { key: "REJECTED", label: "Đã từ chối" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Button
              key={tab.key}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setStatusFilter(tab.key as StockImportStatus | "ALL")
              }
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#2C3E35] text-white shadow-xs hover:bg-[#3A5246]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Import Forms Table */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải danh sách phiếu nhập kho...
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <Boxes className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700">
                Chưa có phiếu nhập kho nào
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="p-4">Mã Phiếu</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Variant UUID</th>
                    <th className="p-4">Số Lượng</th>
                    <th className="p-4">Mã Lô (Batch Code)</th>
                    <th className="p-4">Ngày Sản Xuất</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {forms.map((item) => {
                    const badge = statusBadges[item.status] || {
                      label: item.status,
                      class: "bg-slate-100 text-slate-700",
                    };

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{item.id.slice(0, 8).toUpperCase()}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase ${badge.class}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-slate-700">
                          {item.productVariantId}
                        </td>

                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity} sản phẩm
                        </td>

                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                          {item.batchCode || (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="p-4 text-[11px] text-slate-500">
                          {item.manufacturingDate ||
                            new Date(item.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                        </td>

                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailItem(item)}
                            className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Chi tiết &
                            Duyệt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog
        open={createModalOpen}
        onOpenChange={(open) => !open && setCreateModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35]">
              <Boxes className="h-5 w-5 text-[#2C3E35]" />
              Tạo Bản Nháp Phiếu Nhập Kho
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập mã UUID biến thể sản phẩm, số lượng, ngày sản xuất và mã lô
              hàng.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="variantId"
                className="text-xs font-bold text-slate-700"
              >
                Product Variant ID (UUID) *:
              </Label>
              <Input
                id="variantId"
                required
                placeholder="Nhập UUID của biến thể sản phẩm..."
                value={newVariantId}
                onChange={(e) => setNewVariantId(e.target.value)}
                className="rounded-xl border-slate-200 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="qty"
                  className="text-xs font-bold text-slate-700"
                >
                  Số Lượng Nhập *:
                </Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  required
                  value={newQuantity}
                  onChange={(e) =>
                    setNewQuantity(parseInt(e.target.value, 10) || 1)
                  }
                  className="rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="mfgDate"
                  className="text-xs font-bold text-slate-700"
                >
                  Ngày Sản Xuất *:
                </Label>
                <Input
                  id="mfgDate"
                  type="date"
                  required
                  value={newMfgDate}
                  onChange={(e) => setNewMfgDate(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="batchCode"
                className="text-xs font-bold text-slate-700"
              >
                Mã Lô Hàng (Batch Code):
              </Label>
              <Input
                id="batchCode"
                placeholder="VD: LOT-2026-001"
                value={newBatchCode}
                onChange={(e) => setNewBatchCode(e.target.value)}
                className="rounded-xl border-slate-200 font-mono text-xs"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo Phiếu Nháp"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail & State Machine Modal */}
      {detailItem && (
        <Dialog
          open={Boolean(detailItem)}
          onOpenChange={(open) => !open && setDetailItem(null)}
        >
          <DialogContent className="max-w-xl rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35]">
                  <Boxes className="h-5 w-5 text-[#2C3E35]" />
                  Chi Tiết Phiếu Nhập Kho #
                  {detailItem.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusBadges[detailItem.status]?.class}`}
                >
                  {statusBadges[detailItem.status]?.label}
                </span>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2 text-xs">
              {detailItem.stockBatchId && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Đã tạo Lô hàng Kho: #{detailItem.stockBatchId}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <span className="text-slate-500">Mã Biến thể (UUID):</span>
                  <p className="font-mono font-bold text-slate-800">
                    {detailItem.productVariantId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Số lượng nhập:</span>
                  <p className="font-bold text-[#2C3E35]">
                    {detailItem.quantity} sản phẩm
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Mã Lô (Batch Code):</span>
                  <p className="font-mono font-semibold text-slate-700">
                    {detailItem.batchCode || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Ngày sản xuất:</span>
                  <p className="font-semibold text-slate-700">
                    {detailItem.manufacturingDate || "N/A"}
                  </p>
                </div>
              </div>

              {/* State Machine Action Controls */}
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {detailItem.status === "DRAFT" && (
                  <>
                    <Button
                      type="button"
                      onClick={() => submitMutation.mutate(detailItem.id)}
                      disabled={submitMutation.isPending}
                      className="rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Trình Duyệt Phiếu
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cancelMutation.mutate(detailItem.id)}
                      disabled={cancelMutation.isPending}
                      className="rounded-xl border-gray-300 text-xs font-bold text-gray-700"
                    >
                      <Ban className="mr-1.5 h-3.5 w-3.5" /> Hủy Phiếu Nháp
                    </Button>
                  </>
                )}

                {detailItem.status === "SUBMITTED" && (
                  <>
                    <Button
                      type="button"
                      onClick={() => confirmMutation.mutate(detailItem.id)}
                      disabled={confirmMutation.isPending}
                      className="rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      <PackageCheck className="mr-1.5 h-3.5 w-3.5" /> Xác Nhận
                      Nhập Kho (Cộng Kho)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(detailItem.id)}
                      disabled={rejectMutation.isPending}
                      className="rounded-xl border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Từ Chối Phiếu
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
