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
import { useCloseSupportSession } from "../hooks/useSupport";
import { SupportSessionResponseDto } from "../types/support.types";
import {
  closeSupportSessionSchema,
  type CloseSupportSessionValues,
} from "../schemas/support-form.schema";

interface CloseSessionModalProps {
  session: SupportSessionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionUpdated?: (session: SupportSessionResponseDto) => void;
}

export function CloseSessionModal({
  session,
  open,
  onOpenChange,
  onSessionUpdated,
}: CloseSessionModalProps) {
  const closeMutation = useCloseSupportSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CloseSupportSessionValues>({
    resolver: zodResolver(closeSupportSessionSchema),
    defaultValues: {
      resolutionNotes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ resolutionNotes: "" });
    }
  }, [open, reset]);

  if (!session) return null;

  const onSubmit = (values: CloseSupportSessionValues) => {
    closeMutation.mutate(
      {
        id: session.id,
        data: { reason: values.resolutionNotes?.trim() || undefined },
      },
      {
        onSuccess: (updatedSession) => {
          toast.success("Đã hoàn tất & đóng phiên hỗ trợ");
          reset();
          onOpenChange(false);
          onSessionUpdated?.(updatedSession);
        },
        onError: (err: unknown) => {
          const axiosErr = err as AxiosError<{ message?: string }>;
          toast.error(
            axiosErr.response?.data?.message || "Không thể đóng phiên hỗ trợ",
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
            <DialogTitle>Kết thúc phiên hỗ trợ</DialogTitle>
            <DialogDescription>
              Đóng phiên tư vấn cho khách hàng{" "}
              {session.customerName || session.customerUserId.substring(0, 8)}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="close-notes">Ghi chú giải quyết (tùy chọn)</Label>
              <Textarea
                id="close-notes"
                placeholder="VD: Đã giải đáp thắc mắc đơn hàng #1234..."
                {...register("resolutionNotes")}
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
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isSubmitting || closeMutation.isPending}
            >
              {closeMutation.isPending ? "Đang đóng..." : "Xác nhận đóng phiên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
