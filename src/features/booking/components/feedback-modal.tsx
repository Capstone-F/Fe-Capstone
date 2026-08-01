"use client";

import { useState } from "react";
import { Star, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useSubmitFeedback } from "@/features/booking/hooks/useBooking";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  doctorName?: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  bookingId,
  doctorName = "Bác sĩ",
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const submitFeedbackMutation = useSubmitFeedback();

  const handleSubmit = () => {
    if (rating < 1) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }

    submitFeedbackMutation.mutate(
      { id: bookingId, rating, comment },
      {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã gửi đánh giá cho Bác sĩ! ⭐");
          onClose();
        },
        onError: (err: unknown) => {
          const msg = (err as Error)?.message || "Không thể gửi đánh giá.";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Đánh Giá Chất Lượng Tư Vấn
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Hãy chia sẻ trải nghiệm tư vấn cùng{" "}
            <strong className="font-semibold text-slate-800">
              {doctorName}
            </strong>{" "}
            để giúp cộng đồng tham khảo nhé!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {/* Star Picker */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform duration-150 hover:scale-115 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-slate-700">
            {rating === 5 && "⭐ Tuyệt vời! Rất hài lòng"}
            {rating === 4 && "⭐ Tốt! Hài lòng"}
            {rating === 3 && "⭐ Bình thường"}
            {rating === 2 && "⭐ Tạm ổn"}
            {rating === 1 && "⭐ Cần cải thiện"}
          </span>

          {/* Comment Textarea */}
          <div className="w-full space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              Nhận xét thêm (không bắt buộc):
            </label>
            <Textarea
              placeholder="Bác sĩ giải đáp tận tình, hướng dẫn dùng phác đồ rõ ràng..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="rounded-xl border-slate-200 text-xs focus-visible:ring-amber-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={submitFeedbackMutation.isPending}
            onClick={handleSubmit}
            className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            {submitFeedbackMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Gửi Đánh Giá"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
