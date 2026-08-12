"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useRejectStockImportForm } from "../hooks/useStock";
import { StockImportFormResponseDto } from "../types/stock.types";
import {
  rejectStockImportFormSchema,
  type RejectStockImportFormValues,
} from "../schemas/stock-form.schema";

interface RejectImportModalProps {
  form: StockImportFormResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectImportModal({
  form,
  open,
  onOpenChange,
}: RejectImportModalProps) {
  const rejectMutation = useRejectStockImportForm();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RejectStockImportFormValues>({
    resolver: zodResolver(rejectStockImportFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ reason: "" });
    }
  }, [open, reset]);

  if (!form) return null;

  const onSubmit = (values: RejectStockImportFormValues) => {
    rejectMutation.mutate(
      {
        id: form.id,
        data: { reason: values.reason?.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Đã từ chối phiếu nhập kho");
          reset();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Từ chối phiếu thất bại",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>
              Từ chối phiếu nhập kho #{form.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Phiếu sẽ chuyển sang trạng thái Đã từ chối (REJECTED) và không áp
              dụng tồn kho.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-reason">Lý do từ chối (tùy chọn)</Label>
              <Textarea
                id="reject-reason"
                placeholder="VD: Sai ngày sản xuất, số lượng không khớp..."
                {...register("reason")}
                rows={3}
              />
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
              variant="destructive"
              disabled={isSubmitting || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Đang xử lý..." : "Từ chối phiếu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
