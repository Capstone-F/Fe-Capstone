"use client";

import { useState } from "react";
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useCreateAvailability,
  useDeleteAvailability,
  useExpertAvailability,
  useUpdateAvailability,
} from "@/features/admin/hooks/useAdminExperts";
import {
  AVAILABILITY_MAX_END_HOUR,
  AVAILABILITY_MIN_START_HOUR,
  DAY_OF_WEEK_LABELS,
} from "@/features/admin/types/expert-admin.types";

/** Business hours are 09:00–20:00: start is inclusive 9–19, end is exclusive 10–20. */
const START_HOURS = Array.from(
  { length: AVAILABILITY_MAX_END_HOUR - AVAILABILITY_MIN_START_HOUR },
  (_, index) => AVAILABILITY_MIN_START_HOUR + index,
);

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

interface ExpertAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expertName: string;
  /** Expert PROFILE id. Null when it could not be resolved from the account row. */
  expertProfileId: string | null;
}

export function ExpertAvailabilityDialog({
  open,
  onOpenChange,
  expertName,
  expertProfileId,
}: ExpertAvailabilityDialogProps) {
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startHour, setStartHour] = useState("9");
  const [endHour, setEndHour] = useState("12");

  const { data: blocks = [], isLoading } =
    useExpertAvailability(expertProfileId);
  const createBlock = useCreateAvailability();
  const updateBlock = useUpdateAvailability();
  const deleteBlock = useDeleteAvailability();

  const start = Number(startHour);
  const end = Number(endHour);
  const isRangeValid = end > start;

  const handleAdd = () => {
    if (!expertProfileId || !isRangeValid) return;
    createBlock.mutate(
      {
        expertProfileId,
        payload: {
          dayOfWeek: Number(dayOfWeek),
          startHour: start,
          endHour: end,
        },
      },
      {
        onSuccess: () => toast.success("Đã thêm khung giờ."),
        // The BE rejects overlapping blocks on the same day; surface that verbatim.
        onError: (error: unknown) =>
          toast.error(
            (error as Error)?.message ??
              "Không thể thêm khung giờ (có thể bị trùng với khung đã có).",
          ),
      },
    );
  };

  const handleUpdateEndHour = (blockId: string, value: string | null) => {
    if (!expertProfileId || !value) return;
    updateBlock.mutate(
      { expertProfileId, blockId, payload: { endHour: Number(value) } },
      {
        onSuccess: () => toast.success("Đã cập nhật giờ kết thúc."),
        onError: () => toast.error("Không thể cập nhật khung giờ."),
      },
    );
  };

  const handleDelete = (blockId: string) => {
    if (!expertProfileId) return;
    deleteBlock.mutate(
      { expertProfileId, blockId },
      {
        onSuccess: () => toast.success("Đã xoá khung giờ."),
        onError: () => toast.error("Không thể xoá khung giờ."),
      },
    );
  };

  const sortedBlocks = [...blocks].sort(
    (left, right) =>
      left.dayOfWeek - right.dayOfWeek || left.startHour - right.startHour,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Khung giờ tư vấn hàng tuần
          </DialogTitle>
          <DialogDescription>
            Chuyên gia: <strong>{expertName}</strong>. Giờ theo GMT+7, trong
            khung 09:00–20:00. Các khung trùng nhau trong cùng một ngày sẽ bị từ
            chối.
          </DialogDescription>
        </DialogHeader>

        {!expertProfileId ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Chưa tìm thấy hồ sơ chuyên gia cho tài khoản này. Hãy tạo hồ sơ
            chuyên gia trước khi thiết lập lịch.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải khung giờ...
                </div>
              ) : sortedBlocks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có khung giờ nào. Chuyên gia sẽ không nhận được lịch hẹn
                  cho tới khi thêm ít nhất một khung.
                </p>
              ) : (
                sortedBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                  >
                    <span className="text-sm">
                      <strong>{DAY_OF_WEEK_LABELS[block.dayOfWeek]}</strong>
                      {"  "}
                      {formatHour(block.startHour)} –
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Only the end hour is editable inline; changing the day or start is a
                          delete-and-re-add, which keeps the overlap check simple. */}
                      <Select
                        value={String(block.endHour)}
                        onValueChange={(value) =>
                          handleUpdateEndHour(block.id, value)
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-24"
                          aria-label="Giờ kết thúc"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {START_HOURS.map((hour) => hour + 1)
                            .filter((hour) => hour > block.startHour)
                            .map((hour) => (
                              <SelectItem key={hour} value={String(hour)}>
                                {formatHour(hour)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(block.id)}
                        disabled={deleteBlock.isPending}
                        aria-label="Xoá khung giờ"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <Select
                value={dayOfWeek}
                onValueChange={(value) => setDayOfWeek(value ?? "1")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OF_WEEK_LABELS.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={startHour}
                onValueChange={(value) => setStartHour(value ?? "9")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {START_HOURS.map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={endHour}
                onValueChange={(value) => setEndHour(value ?? "12")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {START_HOURS.map((hour) => hour + 1).map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isRangeValid && (
              <p className="text-xs text-red-500">
                Giờ kết thúc phải lớn hơn giờ bắt đầu.
              </p>
            )}

            <Button
              onClick={handleAdd}
              disabled={!isRangeValid || createBlock.isPending}
              className="w-full"
            >
              {createBlock.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Thêm khung giờ
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
