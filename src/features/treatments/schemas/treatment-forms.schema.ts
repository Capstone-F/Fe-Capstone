import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message);

const dateRangeRefinement = (
  values: { startDate: string; endDate: string },
  context: z.RefinementCtx,
) => {
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    context.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
    });
  }
};

export const createTreatmentPlanSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Tên phác đồ phải có ít nhất 3 ký tự.")
      .max(200, "Tên phác đồ không được vượt quá 200 ký tự."),
    description: optionalText(2000, "Tóm tắt không được vượt quá 2.000 ký tự."),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu."),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc."),
  })
  .superRefine(dateRangeRefinement);

export type CreateTreatmentPlanValues = z.infer<
  typeof createTreatmentPlanSchema
>;

export const treatmentPhaseFormSchema = z
  .object({
    phaseType: z.enum([
      "INITIAL_ASSESSMENT",
      "ACTIVE_TREATMENT",
      "MAINTENANCE",
      "RECOVERY",
    ]),
    title: optionalText(200, "Tên giai đoạn không được vượt quá 200 ký tự."),
    goals: optionalText(2000, "Mục tiêu không được vượt quá 2.000 ký tự."),
    notes: optionalText(2000, "Ghi chú không được vượt quá 2.000 ký tự."),
    noteByExpert: optionalText(
      4000,
      "Lý do chuyên môn không được vượt quá 4.000 ký tự.",
    ),
    priceVnd: z
      .string()
      .min(1, "Vui lòng nhập phí giai đoạn.")
      .regex(/^\d+$/, "Phí chỉ được chứa chữ số.")
      .refine((value) => Number.isSafeInteger(Number(value)), {
        message: "Phí vượt quá giới hạn cho phép.",
      }),
    startDate: z.string(),
    endDate: z.string(),
  })
  .superRefine(dateRangeRefinement);

export type TreatmentPhaseFormValues = z.infer<typeof treatmentPhaseFormSchema>;

export const routineSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tên routine phải có ít nhất 3 ký tự.")
    .max(200, "Tên routine không được vượt quá 200 ký tự."),
  description: optionalText(
    2000,
    "Mô tả routine không được vượt quá 2.000 ký tự.",
  ),
  steps: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Tên bước không được để trống."),
        period: z.enum(["MORNING", "EVENING"]),
        instructions: optionalText(
          2000,
          "Hướng dẫn không được vượt quá 2.000 ký tự.",
        ),
        dosageText: optionalText(
          500,
          "Liều lượng không được vượt quá 500 ký tự.",
        ),
        waitMinutes: z.number().int().min(0).nullable(),
      }),
    )
    .min(1, "Routine phải có ít nhất một bước."),
});
