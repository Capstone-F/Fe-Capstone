"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Plus, Search, RefreshCw, Loader2, Tag } from "lucide-react";
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
import { formatVnd } from "@/shared/utils/format";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceVnd: number;
  stockQuantity?: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  categoryId?: string;
  variants: ProductVariant[];
  createdAt: string;
}

export function ProductsManagementView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    name: "",
    brand: "GlowScan Certified",
    description: "",
    priceVnd: 250000,
    sku: "",
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-products", searchTerm],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      const res = await apiClient.get<{ items: Product[]; total: number }>(
        API_ENDPOINTS.PRODUCTS.LIST,
        { params },
      );
      return res.data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (body: typeof formData) =>
      apiClient.post(API_ENDPOINTS.PRODUCTS.LIST, body),
    onSuccess: () => {
      toast.success("Khai báo sản phẩm SKU mới thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tạo sản phẩm mới";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm.");
      return;
    }
    createProductMutation.mutate(formData);
  };

  const products = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = products.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Danh Mục Sản Phẩm & Kho Hàng Onboard
            </h2>
            <p className="text-xs text-slate-500">
              Khai báo SKU sản phẩm mới, cập nhật giá bán, hình ảnh biến thể và
              danh mục thành phần mỹ phẩm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Onboard SKU Mới
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
        </div>
      </div>

      {/* Products Table — Search inside Card header */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Embedded Search bar */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên sản phẩm, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải danh mục sản phẩm...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <Package className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700">
                Chưa có sản phẩm nào
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Tên Sản Phẩm
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Thương Hiệu
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Biến Thể (Variants)
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Giá Bán
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedProducts.map((p) => {
                    const firstVariant = p.variants?.[0];
                    return (
                      <tr
                        key={p.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            <Tag className="h-3 w-3 text-slate-400" />
                            {p.brand || "GlowScan"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <span className="font-mono font-bold text-[#2C3E35]">
                            {p.variants?.length || 1} biến thể
                          </span>
                        </td>

                        <td className="p-4 font-extrabold text-[#2C3E35] dark:text-emerald-400">
                          {firstVariant
                            ? formatVnd(firstVariant.priceVnd)
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination */}
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={products.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => !open && setIsModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35]">
              <Package className="h-5 w-5 text-[#2C3E35]" />
              Onboard Sản Phẩm SKU Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Khai báo thông tin sản phẩm và giá niêm yết ban đầu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-slate-700"
              >
                Tên Sản Phẩm *:
              </Label>
              <Input
                id="name"
                required
                placeholder="VD: Serum Dưỡng Ẩm B5 GlowScan Pure"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="brand"
                  className="text-xs font-bold text-slate-700"
                >
                  Thương Hiệu:
                </Label>
                <Input
                  id="brand"
                  placeholder="GlowScan Certified"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="priceVnd"
                  className="text-xs font-bold text-slate-700"
                >
                  Giá Niêm Yết (VNĐ):
                </Label>
                <Input
                  id="priceVnd"
                  type="number"
                  min={0}
                  value={formData.priceVnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceVnd: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-bold text-slate-700"
              >
                Mô Tả Sản Phẩm:
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả công dụng và thành phần mỹ phẩm..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                {createProductMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo Sản Phẩm Mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
