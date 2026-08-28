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
  Pencil,
  SlidersHorizontal,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { ProductVariantSelect } from "@/features/stock/components/product-variant-select";
import { SalesLogPanel } from "@/features/stock/components/sales-log-panel";
import { useProductVariantOptions } from "@/features/stock/hooks/use-product-variant-options";
import { DatePicker } from "@/shared/components/form/date-picker";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

export interface StockBatch {
  id: string;
  productVariantId: string;
  quantity: number;
  remainingQuantity: number;
  manufacturingDate?: string;
  batchCode?: string;
  createdAt: string;
}

const statusBadges: Record<
  StockImportStatus,
  { label: string; class: string }
> = {
  DRAFT: {
    label: "Bản nháp",
    class: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  SUBMITTED: {
    label: "Chờ duyệt nhập",
    class:
      "bg-blue-100 text-blue-800 font-bold dark:bg-blue-950 dark:text-blue-300",
  },
  CONFIRMED: {
    label: "Đã nhập kho",
    class: "bg-emerald-600 text-white font-bold",
  },
  CANCELLED: {
    label: "Đã hủy",
    class: "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400",
  },
  REJECTED: {
    label: "Đã từ chối",
    class:
      "bg-rose-100 text-rose-800 font-bold dark:bg-rose-950 dark:text-rose-300",
  },
};

export function StockImportView() {
  const queryClient = useQueryClient();
  const today = toLocalDateInputValue(new Date());
  const { optionsById: variantOptionsById } = useProductVariantOptions();
  const [activeTab, setActiveTab] = useState<"IMPORT_FORMS" | "DIRECT_BATCHES">(
    "IMPORT_FORMS",
  );
  const [statusFilter, setStatusFilter] = useState<StockImportStatus | "ALL">(
    "ALL",
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<StockImportForm | null>(null);

  // Draft Edit state
  const [editModalItem, setEditModalItem] = useState<StockImportForm | null>(
    null,
  );
  const [editQuantity, setEditQuantity] = useState(10);

  // Reject Reason state
  const [rejectModalItem, setRejectModalItem] =
    useState<StockImportForm | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Create Import Form state
  const [newVariantId, setNewVariantId] = useState("");
  const [newQuantity, setNewQuantity] = useState(10);
  const [newMfgDate, setNewMfgDate] = useState(
    toLocalDateInputValue(new Date()),
  );
  const [newBatchCode, setNewBatchCode] = useState(
    `LOT-${new Date().getFullYear()}-001`,
  );

  // Direct Batch state
  const [directBatchModalOpen, setDirectBatchModalOpen] = useState(false);
  const [directVariantId, setDirectVariantId] = useState("");
  const [directQty, setDirectQty] = useState(20);
  const [directMfgDate, setDirectMfgDate] = useState(
    toLocalDateInputValue(new Date()),
  );
  const [directBatchCode, setDirectBatchCode] = useState(
    `LOT-DIRECT-${new Date().getFullYear()}-001`,
  );

  // Adjust Batch state
  const [adjustBatchId, setAdjustBatchId] = useState("");
  const [adjustQty, setAdjustQty] = useState(18);
  const [adjustNote, setAdjustNote] = useState("Kiểm kê");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  // Query Import Forms
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

  // Query Batches (for Direct Batches tab)
  const {
    data: batchesData,
    isLoading: isBatchesLoading,
    refetch: refetchBatches,
  } = useQuery({
    queryKey: ["stock-batches"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ items: StockBatch[]; total: number }>(
          API_ENDPOINTS.STOCK.BATCHES,
        );
        return res.data;
      } catch {
        return { items: [], total: 0 };
      }
    },
    enabled: activeTab === "DIRECT_BATCHES",
  });

  // Create Draft Form
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

  // PATCH Draft Form Quantity (TC-STF-04)
  const patchDraftMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      apiClient.patch(`${API_ENDPOINTS.STOCK.IMPORT_FORMS}/${id}`, {
        quantity,
      }),
    onSuccess: () => {
      toast.success("Cập nhật số lượng phiếu nháp thành công!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setEditModalItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật phiếu nháp";
      toast.error(msg);
    },
  });

  // Submit Import Form
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

  // Confirm Import Form (Creates Batch + ON_RACK)
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

  // Cancel Import Form (TC-STF-05)
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

  // Reject Import Form with Reason (TC-STF-06)
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(API_ENDPOINTS.STOCK.REJECT_IMPORT_FORM(id), { reason }),
    onSuccess: () => {
      toast.success("Đã từ chối phiếu nhập kho!");
      queryClient.invalidateQueries({ queryKey: ["stock-import-forms"] });
      setRejectModalItem(null);
      setDetailItem(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể từ chối phiếu";
      toast.error(msg);
    },
  });

  // Direct Batch Creation (TC-STF-07)
  const createDirectBatchMutation = useMutation({
    mutationFn: (body: {
      productVariantId: string;
      quantity: number;
      manufacturingDate: string;
      batchCode?: string;
    }) => apiClient.post(API_ENDPOINTS.STOCK.BATCHES, body),
    onSuccess: (res) => {
      const batchId = res.data?.id || "N/A";
      toast.success(`Tạo lô hàng trực tiếp thành công! (Mã lô: ${batchId})`);
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      setDirectBatchModalOpen(false);
      setDirectVariantId("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể nhập kho trực tiếp";
      toast.error(msg);
    },
  });

  // Adjust Batch Remaining Quantity (TC-STF-07)
  const adjustBatchMutation = useMutation({
    mutationFn: ({
      id,
      quantity,
      note,
    }: {
      id: string;
      quantity: number;
      note: string;
    }) =>
      apiClient.post(API_ENDPOINTS.STOCK.ADJUST_BATCH(id), { quantity, note }),
    onSuccess: () => {
      toast.success("Điều chỉnh số lượng tồn lô hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      setAdjustModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể điều chỉnh số lượng tồn";
      toast.error(msg);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantId.trim()) {
      toast.error("Vui lòng chọn sản phẩm cần nhập kho.");
      return;
    }
    if (newMfgDate > today) {
      toast.error("Ngày sản xuất không được ở tương lai.");
      return;
    }

    createMutation.mutate({
      productVariantId: newVariantId.trim(),
      quantity: newQuantity,
      manufacturingDate: newMfgDate,
      batchCode: newBatchCode.trim() || undefined,
    });
  };

  const handleDirectBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directVariantId.trim()) {
      toast.error("Vui lòng chọn sản phẩm cần nhập kho.");
      return;
    }
    if (directMfgDate > today) {
      toast.error("Ngày sản xuất không được ở tương lai.");
      return;
    }

    createDirectBatchMutation.mutate({
      productVariantId: directVariantId.trim(),
      quantity: directQty,
      manufacturingDate: directMfgDate,
      batchCode: directBatchCode.trim() || undefined,
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBatchId.trim()) {
      toast.error("Vui lòng nhập Mã lô hàng (Batch ID).");
      return;
    }

    adjustBatchMutation.mutate({
      id: adjustBatchId.trim(),
      quantity: adjustQty,
      note: adjustNote.trim(),
    });
  };

  const forms = data?.items || [];
  const batches = batchesData?.items || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={Boxes}
        title="Quản Lý Kho & Nhập Kho Sản Phẩm"
        description="Tạo phiếu nhập nháp, trình duyệt, xác nhận cộng kho, nhập trực tiếp và điều chỉnh kiểm kê lô hàng."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Tạo Phiếu Nhập Nháp
            </Button>

            <Button
              variant="outline"
              onClick={() => setDirectBatchModalOpen(true)}
              className="rounded-xl border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Nhập Kho Trực Tiếp
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetch();
                refetchBatches();
              }}
              disabled={isRefetching}
              className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        }
      />

      {/* Main View Mode Selector */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <Button
          type="button"
          variant={activeTab === "IMPORT_FORMS" ? "default" : "outline"}
          onClick={() => setActiveTab("IMPORT_FORMS")}
          className={`rounded-xl text-xs font-bold ${
            activeTab === "IMPORT_FORMS"
              ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
              : ""
          }`}
        >
          <Boxes className="mr-1.5 h-4 w-4" /> Quản Lý Phiếu Nhập Kho
        </Button>

        <Button
          type="button"
          variant={activeTab === "DIRECT_BATCHES" ? "default" : "outline"}
          onClick={() => setActiveTab("DIRECT_BATCHES")}
          className={`rounded-xl text-xs font-bold ${
            activeTab === "DIRECT_BATCHES"
              ? "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
              : ""
          }`}
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Nhập Kho Trực Tiếp &
          Lô Hàng
        </Button>
      </div>

      {activeTab === "IMPORT_FORMS" ? (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2 dark:border-slate-800">
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
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
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
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Chưa có phiếu nhập kho nào
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase dark:border-slate-800 dark:bg-slate-800/40">
                        <th className="p-4">Mã Phiếu</th>
                        <th className="p-4">Trạng Thái</th>
                        <th className="p-4">Sản Phẩm</th>
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
                            className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
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

                            <td className="p-4 text-slate-700 dark:text-slate-300">
                              {variantOptionsById.has(item.productVariantId) ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {
                                      variantOptionsById.get(
                                        item.productVariantId,
                                      )?.productName
                                    }
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    SKU{" "}
                                    {
                                      variantOptionsById.get(
                                        item.productVariantId,
                                      )?.sku
                                    }
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-700">
                                  Chưa tải được thông tin sản phẩm
                                </span>
                              )}
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
                              <div className="flex items-center justify-end gap-1.5">
                                {item.status === "DRAFT" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditModalItem(item);
                                      setEditQuantity(item.quantity);
                                    }}
                                    className="h-8 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                  >
                                    <Pencil className="mr-1 h-3.5 w-3.5" /> Sửa
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDetailItem(item)}
                                  className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  {item.status === "DRAFT" ||
                                  item.status === "SUBMITTED"
                                    ? "Chi tiết & Duyệt"
                                    : "Chi tiết"}
                                </Button>
                              </div>
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
        </>
      ) : (
        /* Direct Batches Tab */
        <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-0">
            {isBatchesLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
                Đang tải danh sách lô hàng...
              </div>
            ) : batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
                <Boxes className="h-10 w-10 text-slate-300" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Chưa có lô hàng trực tiếp nào
                </span>
                <p className="text-xs text-slate-400">
                  Bấm &quot;Nhập Kho Trực Tiếp&quot; để tạo lô hàng mới không
                  qua phiếu.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase dark:border-slate-800 dark:bg-slate-800/40">
                      <th className="p-4">Batch ID</th>
                      <th className="p-4">Sản Phẩm</th>
                      <th className="p-4">Số Lượng Ban Đầu</th>
                      <th className="p-4">Tồn Thực Tế</th>
                      <th className="p-4">Mã Lô (Batch Code)</th>
                      <th className="p-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {batches.map((b) => (
                      <tr
                        key={b.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{b.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">
                          {variantOptionsById.has(b.productVariantId) ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {
                                  variantOptionsById.get(b.productVariantId)
                                    ?.productName
                                }
                              </p>
                              <p className="text-[11px] text-slate-500">
                                SKU{" "}
                                {
                                  variantOptionsById.get(b.productVariantId)
                                    ?.sku
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-700">
                              Chưa tải được thông tin sản phẩm
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                          {b.quantity} sản phẩm
                        </td>
                        <td className="p-4 font-extrabold text-emerald-700 dark:text-emerald-400">
                          {b.remainingQuantity} sản phẩm
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                          {b.batchCode || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAdjustBatchId(b.id);
                              setAdjustQty(b.remainingQuantity);
                              setAdjustNote("Kiểm kê điều chỉnh kho");
                              setAdjustModalOpen(true);
                            }}
                            className="h-8 rounded-xl border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50"
                          >
                            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />{" "}
                            Điều Chỉnh Tồn Kho
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Import Form Modal */}
      <Dialog
        open={createModalOpen}
        onOpenChange={(open) => !open && setCreateModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
              <Boxes className="h-5 w-5 text-[#2C3E35]" />
              Tạo Bản Nháp Phiếu Nhập Kho
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Chọn sản phẩm, nhập số lượng, ngày sản xuất và mã lô hàng.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="variantId"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Sản phẩm và biến thể *:
              </Label>
              <ProductVariantSelect
                id="variantId"
                value={newVariantId}
                onChange={setNewVariantId}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="qty"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
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
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Ngày Sản Xuất *:
                </Label>
                <DatePicker
                  id="mfgDate"
                  value={newMfgDate}
                  onChange={setNewMfgDate}
                  placeholder="Chọn ngày sản xuất"
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="batchCode"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
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

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
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

      {/* Edit Draft Quantity Modal (PATCH /stock/import-forms/:id) */}
      {editModalItem && (
        <Dialog
          open={Boolean(editModalItem)}
          onOpenChange={(open) => !open && setEditModalItem(null)}
        >
          <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-blue-700">
                <Pencil className="h-5 w-5" />
                Cập Nhật Phiếu Nháp
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Sửa số lượng cho phiếu nháp #
                {editModalItem.id.slice(0, 8).toUpperCase()}.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                patchDraftMutation.mutate({
                  id: editModalItem.id,
                  quantity: editQuantity,
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="edit-qty"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Số lượng mới *:
                </Label>
                <Input
                  id="edit-qty"
                  type="number"
                  min={1}
                  required
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(parseInt(e.target.value, 10) || 1)
                  }
                  className="rounded-xl text-xs font-bold"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalItem(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={patchDraftMutation.isPending}
                  className="rounded-xl bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700"
                >
                  {patchDraftMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Lưu Thay Đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Form Reason Modal (POST /stock/import-forms/:id/reject { reason }) */}
      {rejectModalItem && (
        <Dialog
          open={Boolean(rejectModalItem)}
          onOpenChange={(open) => !open && setRejectModalItem(null)}
        >
          <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
                <XCircle className="h-5 w-5" />
                Từ Chối Phiếu Nhập Kho
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Nhập lý do từ chối phiếu nhập kho #
                {rejectModalItem.id.slice(0, 8).toUpperCase()}.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                rejectMutation.mutate({
                  id: rejectModalItem.id,
                  reason: rejectReason.trim() || "Sai thông tin phiếu nhập",
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="reject-reason"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Lý do từ chối *:
                </Label>
                <Textarea
                  id="reject-reason"
                  required
                  placeholder="VD: Sai ngày SX, hư hỏng bao bì..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModalItem(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  className="rounded-xl bg-rose-600 px-6 text-xs font-bold text-white hover:bg-rose-700"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Xác Nhận Từ Chối"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Direct Batch Creation Modal (POST /stock/batches) */}
      <Dialog
        open={directBatchModalOpen}
        onOpenChange={(open) => !open && setDirectBatchModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-400">
              <Boxes className="h-5 w-5" />
              Nhập Kho Trực Tiếp
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo ngay lô hàng kho và cộng tồn trực tiếp không qua phiếu nhập.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleDirectBatchSubmit}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="direct-vid"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Sản phẩm và biến thể *:
              </Label>
              <ProductVariantSelect
                id="direct-vid"
                value={directVariantId}
                onChange={setDirectVariantId}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="direct-qty"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Số lượng nhập *:
                </Label>
                <Input
                  id="direct-qty"
                  type="number"
                  min={1}
                  required
                  value={directQty}
                  onChange={(e) =>
                    setDirectQty(parseInt(e.target.value, 10) || 1)
                  }
                  className="text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="direct-mfg"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Ngày sản xuất *:
                </Label>
                <DatePicker
                  id="direct-mfg"
                  value={directMfgDate}
                  onChange={setDirectMfgDate}
                  placeholder="Chọn ngày sản xuất"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="direct-bcode"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Mã Lô (Batch Code):
              </Label>
              <Input
                id="direct-bcode"
                placeholder="VD: LOT-DIRECT-2026-001"
                value={directBatchCode}
                onChange={(e) => setDirectBatchCode(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDirectBatchModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createDirectBatchMutation.isPending}
                className="rounded-xl bg-emerald-700 px-6 text-xs font-bold text-white hover:bg-emerald-800"
              >
                {createDirectBatchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo Lô Hàng Trực Tiếp"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Batch Quantity Modal (POST /stock/batches/:id/adjust) */}
      <Dialog
        open={adjustModalOpen}
        onOpenChange={(open) => !open && setAdjustModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-blue-700">
              <SlidersHorizontal className="h-5 w-5" />
              Điều Chỉnh Tồn Kho
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cập nhật số lượng tồn thực tế sau khi kiểm kê.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleAdjustSubmit}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="adj-bid"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Mã lô hệ thống *:
              </Label>
              <Input
                id="adj-bid"
                required
                placeholder="Nhập mã lô hệ thống..."
                value={adjustBatchId}
                onChange={(e) => setAdjustBatchId(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="adj-qty"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Số lượng tồn mới *:
              </Label>
              <Input
                id="adj-qty"
                type="number"
                min={0}
                required
                value={adjustQty}
                onChange={(e) =>
                  setAdjustQty(parseInt(e.target.value, 10) || 0)
                }
                className="text-xs font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="adj-note"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Ghi chú kiểm kê *:
              </Label>
              <Input
                id="adj-note"
                required
                placeholder="VD: Kiểm kê kho định kỳ..."
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={adjustBatchMutation.isPending}
                className="rounded-xl bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700"
              >
                {adjustBatchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Xác Nhận Điều Chỉnh"
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
          <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl p-6 shadow-2xl sm:max-w-4xl">
            <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
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

            <Tabs defaultValue="info" className="py-2">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="sales-log">Log bán hàng</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <div className="flex flex-col gap-4 pt-3 text-xs">
                  {detailItem.stockBatchId && (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        Đã tạo Lô hàng Kho: #{detailItem.stockBatchId}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div>
                      <span className="text-slate-500">Sản phẩm:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {variantOptionsById.get(detailItem.productVariantId)
                          ?.label || "Chưa tải được thông tin sản phẩm"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Số lượng nhập:</span>
                      <p className="font-bold text-[#2C3E35] dark:text-emerald-400">
                        {detailItem.quantity} sản phẩm
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">
                        Mã Lô (Batch Code):
                      </span>
                      <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {detailItem.batchCode || "Chưa tạo mã lô"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Ngày sản xuất:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {detailItem.manufacturingDate || "Chưa nhập ngày"}
                      </p>
                    </div>
                  </div>

                  {/* State Machine Action Controls */}
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {detailItem.status === "DRAFT" && (
                      <>
                        <Button
                          type="button"
                          onClick={() => submitMutation.mutate(detailItem.id)}
                          disabled={submitMutation.isPending}
                          className="rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" /> Trình Duyệt
                          Phiếu
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => cancelMutation.mutate(detailItem.id)}
                          disabled={cancelMutation.isPending}
                          className="rounded-xl border-gray-300 text-xs font-bold text-gray-700 dark:text-slate-300"
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
                          <PackageCheck className="mr-1.5 h-3.5 w-3.5" /> Xác
                          Nhận Nhập Kho (Cộng Kho)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRejectModalItem(detailItem)}
                          className="rounded-xl border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" /> Từ Chối
                          Phiếu
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sales-log" className="pt-3">
                <SalesLogPanel
                  formId={detailItem.id}
                  formStatus={detailItem.status}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
