"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useAdjustStockBatch, useDirectBatchImport } from "../hooks/useStock";
import { ProductVariantSelect } from "./product-variant-select";
import { StockBatchSelect } from "./stock-batch-select";
import {
  directBatchImportSchema,
  adjustStockBatchSchema,
  type DirectBatchImportValues,
  type AdjustStockBatchValues,
} from "../schemas/stock-form.schema";

interface DirectBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DirectBatchModal({
  open,
  onOpenChange,
}: DirectBatchModalProps) {
  const [tab, setTab] = useState<"import" | "adjust">("import");

  const directImportMutation = useDirectBatchImport();
  const adjustMutation = useAdjustStockBatch();

  // Form 1: Direct Import
  const importForm = useForm<DirectBatchImportValues>({
    resolver: zodResolver(directBatchImportSchema),
    defaultValues: {
      productVariantId: "",
      quantity: undefined,
      manufacturingDate: "",
      batchCode: "",
    },
  });

  // Form 2: Adjust Batch
  const adjustForm = useForm<AdjustStockBatchValues>({
    resolver: zodResolver(adjustStockBatchSchema),
    defaultValues: {
      batchId: "",
      quantity: undefined,
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      importForm.reset({
        productVariantId: "",
        quantity: undefined,
        manufacturingDate: "",
        batchCode: "",
      });
      adjustForm.reset({
        batchId: "",
        quantity: undefined,
        note: "",
      });
    }
  }, [open, importForm, adjustForm]);

  const onDirectImportSubmit = (values: DirectBatchImportValues) => {
    directImportMutation.mutate(
      {
        productVariantId: values.productVariantId.trim(),
        quantity: Number(values.quantity),
        manufacturingDate: values.manufacturingDate.trim(),
        batchCode: values.batchCode?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Nhập lô kho trực tiếp thành công!");
          importForm.reset();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(axiosErr.response?.data?.message || "Nhập kho thất bại");
        },
      },
    );
  };

  const onAdjustSubmit = (values: AdjustStockBatchValues) => {
    adjustMutation.mutate(
      {
        id: values.batchId.trim(),
        data: {
          quantity: Number(values.quantity),
          note: values.note?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Điều chỉnh số lượng tồn kho thành công!");
          adjustForm.reset();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Điều chỉnh thất bại",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Thao tác Kho trực tiếp</DialogTitle>
          <DialogDescription>
            Nhập hàng tức thì hoặc kiểm kê/điều chỉnh tồn kho không qua quy
            trình phê duyệt phiếu.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "import" | "adjust")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Nhập lô trực tiếp</TabsTrigger>
            <TabsTrigger value="adjust">Điều chỉnh kiểm kê</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="pt-4">
            <form
              onSubmit={importForm.handleSubmit(onDirectImportSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="dir-variantId">Sản phẩm / Biến thể *</Label>
                <Controller
                  name="productVariantId"
                  control={importForm.control}
                  render={({ field }) => (
                    <ProductVariantSelect
                      id="dir-variantId"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                  )}
                />
                {importForm.formState.errors.productVariantId && (
                  <p className="text-xs font-medium text-rose-500">
                    {importForm.formState.errors.productVariantId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dir-qty">Số lượng nhập *</Label>
                  <Input
                    id="dir-qty"
                    type="number"
                    placeholder="VD: 50"
                    {...importForm.register("quantity", {
                      valueAsNumber: true,
                    })}
                  />
                  {importForm.formState.errors.quantity && (
                    <p className="text-xs font-medium text-rose-500">
                      {importForm.formState.errors.quantity.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dir-mfd">Ngày sản xuất *</Label>
                  <Input
                    id="dir-mfd"
                    type="date"
                    {...importForm.register("manufacturingDate")}
                  />
                  {importForm.formState.errors.manufacturingDate && (
                    <p className="text-xs font-medium text-rose-500">
                      {importForm.formState.errors.manufacturingDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dir-batch">
                  Mã lô hàng (Tùy chọn - Tự động sinh nếu để trống)
                </Label>
                <Input
                  id="dir-batch"
                  placeholder="VD: LOT-2026-001..."
                  {...importForm.register("batchCode")}
                />
                {importForm.formState.errors.batchCode && (
                  <p className="text-xs font-medium text-rose-500">
                    {importForm.formState.errors.batchCode.message}
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    importForm.formState.isSubmitting ||
                    directImportMutation.isPending
                  }
                >
                  {directImportMutation.isPending
                    ? "Đang nhập..."
                    : "Xác nhận nhập lô"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="adjust" className="pt-4">
            <form
              onSubmit={adjustForm.handleSubmit(onAdjustSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="adj-batchId">
                  Lô kho cần kiểm kê / điều chỉnh *
                </Label>
                <Controller
                  name="batchId"
                  control={adjustForm.control}
                  render={({ field }) => (
                    <StockBatchSelect
                      id="adj-batchId"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                  )}
                />
                {adjustForm.formState.errors.batchId && (
                  <p className="text-xs font-medium text-rose-500">
                    {adjustForm.formState.errors.batchId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adj-qty">Số lượng tồn kho thực tế mới *</Label>
                <Input
                  id="adj-qty"
                  type="number"
                  placeholder="VD: 15"
                  {...adjustForm.register("quantity", { valueAsNumber: true })}
                />
                {adjustForm.formState.errors.quantity && (
                  <p className="text-xs font-medium text-rose-500">
                    {adjustForm.formState.errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adj-note">Ghi chú điều chỉnh</Label>
                <Input
                  id="adj-note"
                  placeholder="Lý do điều chỉnh kiểm kê thực tế..."
                  {...adjustForm.register("note")}
                />
                {adjustForm.formState.errors.note && (
                  <p className="text-xs font-medium text-rose-500">
                    {adjustForm.formState.errors.note.message}
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    adjustForm.formState.isSubmitting ||
                    adjustMutation.isPending
                  }
                >
                  {adjustMutation.isPending
                    ? "Đang lưu..."
                    : "Cập nhật tồn kho"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
