"use client";

import React, { useEffect } from "react";
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
import { DatePicker } from "@/shared/components/form/date-picker";
import { useCreateStockImportForm } from "../hooks/useStock";
import { ProductVariantSelect } from "./product-variant-select";
import {
  createStockImportFormSchema,
  type CreateStockImportFormValues,
} from "../schemas/stock-form.schema";

interface CreateImportFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateImportFormModal({
  open,
  onOpenChange,
}: CreateImportFormModalProps) {
  const createMutation = useCreateStockImportForm();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStockImportFormValues>({
    resolver: zodResolver(createStockImportFormSchema),
    defaultValues: {
      productVariantId: "",
      quantity: undefined,
      manufacturingDate: "",
      batchCode: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        productVariantId: "",
        quantity: undefined,
        manufacturingDate: "",
        batchCode: "",
      });
    }
  }, [open, reset]);

  const onSubmit = (values: CreateStockImportFormValues) => {
    createMutation.mutate(
      {
        productVariantId: values.productVariantId.trim(),
        quantity: Number(values.quantity),
        manufacturingDate: values.manufacturingDate.trim(),
        batchCode: values.batchCode?.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Đã tạo phiếu nhập kho nháp (ID: ${data.id.substring(0, 8)})`,
          );
          reset();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Không thể tạo phiếu nhập kho",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Tạo phiếu nhập kho mới (Draft)</DialogTitle>
            <DialogDescription>
              Tạo bản nháp phiếu nhập kho cho biến thể sản phẩm. Phiếu sẽ ở
              trạng thái DRAFT cho đến khi gửi duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="variantId">Sản phẩm / Biến thể *</Label>
              <Controller
                name="productVariantId"
                control={control}
                render={({ field }) => (
                  <ProductVariantSelect
                    id="variantId"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
              {errors.productVariantId && (
                <p className="text-xs font-medium text-rose-500">
                  {errors.productVariantId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Số lượng nhập *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="VD: 100"
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mfd">Ngày sản xuất *</Label>
                <Controller
                  name="manufacturingDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="mfd"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn ngày sản xuất"
                    />
                  )}
                />
                {errors.manufacturingDate && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.manufacturingDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="batchCode">
                Mã lô sản xuất (Tùy chọn - Tự động sinh nếu để trống)
              </Label>
              <Input
                id="batchCode"
                placeholder="VD: LOT-2026-001..."
                {...register("batchCode")}
              />
              {errors.batchCode && (
                <p className="text-xs font-medium text-rose-500">
                  {errors.batchCode.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Đang tạo..." : "Tạo phiếu nháp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
