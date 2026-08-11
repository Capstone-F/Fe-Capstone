"use client";

import React from "react";
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
import { useConfirmStockImportForm } from "../hooks/useStock";
import { getStockStatusLabel } from "../utils/stock-mappers";
import {
  StockImportFormResponseDto,
  StockImportFormStatus,
} from "../types/stock.types";

interface ConfirmImportModalProps {
  form: StockImportFormResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmImportModal({
  form,
  open,
  onOpenChange,
}: ConfirmImportModalProps) {
  const confirmMutation = useConfirmStockImportForm();

  if (!form) return null;

  const handleConfirm = () => {
    confirmMutation.mutate(form.id, {
      onSuccess: (res) => {
        toast.success(
          `Đã xác nhận nhập kho thành công! (Mã lô: ${res.stockBatchId || "mới"})`,
        );
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        toast.error(
          axiosErr.response?.data?.message || "Xác nhận nhập kho thất bại",
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Xác nhận duyệt & Nhập kho sản phẩm</DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <div>
              Bạn chuẩn bị chuyển phiếu{" "}
              <strong>#{form.id.substring(0, 8)}</strong> sang trạng thái{" "}
              <strong>
                {getStockStatusLabel(StockImportFormStatus.CONFIRMED)}
              </strong>
              .
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              ⚠️ Hành động này sẽ tự động sinh lô kho, ghi nhận giao dịch Nhập
              kho và tạo <strong>{form.quantity}</strong> đơn vị sản phẩm sẵn
              sàng mở bán trên hệ thống.
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? "Đang xử lý..." : "Xác nhận nhập kho"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
