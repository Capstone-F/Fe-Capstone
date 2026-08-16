"use client";

import React from "react";
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
import { useUpdateStockImportForm } from "../hooks/useStock";
import { StockImportFormResponseDto } from "../types/stock.types";
import { ProductVariantSelect } from "./product-variant-select";
import {
  updateStockImportFormSchema,
  type UpdateStockImportFormValues,
} from "../schemas/stock-form.schema";
import { getStockStatusLabel } from "../utils/stock-mappers";

interface EditImportFormModalProps {
  form: StockImportFormResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditImportFormModal({
  form,
  open,
  onOpenChange,
}: EditImportFormModalProps) {
  return form ? (
    <EditImportFormContent
      key={form.id}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
    />
  ) : null;
}

function EditImportFormContent({
  form,
  open,
  onOpenChange,
}: {
  form: StockImportFormResponseDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateStockImportForm();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStockImportFormValues>({
    resolver: zodResolver(updateStockImportFormSchema),
    defaultValues: {
      productVariantId: form.productVariantId || "",
      quantity: form.quantity || undefined,
      manufacturingDate: form.manufacturingDate
        ? form.manufacturingDate.substring(0, 10)
        : "",
      batchCode: form.batchCode || "",
    },
  });

  const onSubmit = (values: UpdateStockImportFormValues) => {
    updateMutation.mutate(
      {
        id: form.id,
        data: {
          productVariantId: values.productVariantId?.trim() || undefined,
          quantity: values.quantity ? Number(values.quantity) : undefined,
          manufacturingDate: values.manufacturingDate?.trim() || undefined,
          batchCode: values.batchCode?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật thông tin phiếu nhập kho");
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message ||
              "Cập nhật phiếu nhập kho thất bại",
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
            <DialogTitle>
              Chỉnh sửa phiếu nhập kho #{form.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Cập nhật số lượng, ngày sản xuất hoặc mã lô cho phiếu ở trạng thái{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {getStockStatusLabel(form.status)}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-variantId">Sản phẩm / Biến thể</Label>
              <Controller
                name="productVariantId"
                control={control}
                render={({ field }) => (
                  <ProductVariantSelect
                    id="edit-variantId"
                    value={field.value || ""}
                    onChange={field.onChange}
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
                <Label htmlFor="edit-quantity">Số lượng nhập</Label>
                <Input
                  id="edit-quantity"
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
                <Label htmlFor="edit-mfd">Ngày sản xuất</Label>
                <Controller
                  name="manufacturingDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="edit-mfd"
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
              <Label htmlFor="edit-batchCode">
                Mã lô sản xuất (Batch Code)
              </Label>
              <Input
                id="edit-batchCode"
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
              disabled={isSubmitting || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
