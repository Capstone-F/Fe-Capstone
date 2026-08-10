import { z } from "zod";

export const feelingSchema = z.enum(["BETTER", "SAME", "WORSE"]);

export const symptomSchema = z.enum([
  "oiliness",
  "dryness",
  "redness",
  "acne",
  "itching",
  "burning",
  "peeling",
  "new_breakout",
]);

export const dailyCheckInSchema = z.object({
  feeling: feelingSchema,
  symptoms: z.array(symptomSchema),
  note: z.string().trim().max(2000, "Ghi chú không được vượt quá 2.000 ký tự."),
});

export type DailyCheckInFormValues = z.infer<typeof dailyCheckInSchema>;

export const weeklyCheckInSchema = z.object({
  feeling: feelingSchema,
  symptoms: z.array(
    z.enum(["oiliness", "dryness", "redness", "acne", "peeling"]),
  ),
  note: z.string().trim().max(2000, "Ghi chú không được vượt quá 2.000 ký tự."),
});

export type WeeklyCheckInFormValues = z.infer<typeof weeklyCheckInSchema>;

export const skipStepSchema = z
  .object({
    reason: z.enum(["OUT_OF_STOCK", "FORGOT", "OTHER"]),
    note: z.string().trim().max(500, "Ghi chú không được vượt quá 500 ký tự."),
  })
  .superRefine((values, context) => {
    if (values.reason === "OTHER" && !values.note) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: 'Vui lòng mô tả lý do khi chọn "Lý do khác".',
      });
    }
  });

export type SkipStepFormValues = z.infer<typeof skipStepSchema>;

export const sideEffectReportSchema = z.object({
  symptoms: z
    .array(
      z.enum([
        "redness",
        "burning",
        "itching",
        "peeling",
        "swelling",
        "blistering",
        "new_breakout",
      ]),
    )
    .min(1, "Vui lòng chọn ít nhất một biểu hiện kích ứng."),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
  selectedStepId: z.string(),
  affectedArea: z
    .string()
    .trim()
    .max(500, "Vùng da bị ảnh hưởng không được vượt quá 500 ký tự."),
  description: z
    .string()
    .trim()
    .max(2000, "Ghi chú không được vượt quá 2.000 ký tự."),
});

export type SideEffectReportFormValues = z.infer<typeof sideEffectReportSchema>;

export const progressPhotoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên mốc tiến độ.")
    .max(200, "Tên mốc không được vượt quá 200 ký tự."),
  note: z.string().trim().max(2000, "Ghi chú không được vượt quá 2.000 ký tự."),
});

export type ProgressPhotoFormValues = z.infer<typeof progressPhotoSchema>;

export const cancelTreatmentSchema = z.object({
  reason: z.string().trim().max(2000, "Lý do không được vượt quá 2.000 ký tự."),
});

export type CancelTreatmentFormValues = z.infer<typeof cancelTreatmentSchema>;
