import { z } from "zod";

export const bookingFormSchema = z.object({
  slotId: z.string().min(1, "Vui lòng chọn một khung giờ hẹn."),
  symptoms: z
    .string()
    .trim()
    .min(10, "Vui lòng mô tả tình trạng da ít nhất 10 ký tự.")
    .max(2000, "Mô tả không được vượt quá 2.000 ký tự."),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const feedbackFormSchema = z.object({
  rating: z.number().int().min(1, "Vui lòng chọn số sao đánh giá.").max(5),
  comment: z
    .string()
    .trim()
    .max(1000, "Nhận xét không được vượt quá 1.000 ký tự."),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
