import { z } from "zod";

const requiredVndSchema = z
  .string()
  .min(1, "Vui lòng nhập số tiền.")
  .regex(/^\d+$/, "Số tiền chỉ được chứa chữ số.")
  .refine((value) => Number.isSafeInteger(Number(value)), {
    message: "Số tiền vượt quá giới hạn cho phép.",
  })
  .refine((value) => Number(value) > 0, {
    message: "Số tiền phải lớn hơn 0 đồng.",
  });

export const adminWalletTopUpSchema = z.object({
  amountVnd: requiredVndSchema,
  note: z.string().trim().max(500, "Ghi chú không được vượt quá 500 ký tự."),
});

export type AdminWalletTopUpValues = z.infer<typeof adminWalletTopUpSchema>;

export const createExpertSchema = z
  .object({
    emailPrefix: z.string().trim().min(1, "Vui lòng nhập email đăng nhập."),
    emailDomain: z.enum(["@glowscan.com", "@glowscan.vn", "@gmail.com"]),
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ và tên không được vượt quá 100 ký tự."),
    temporaryPassword: z
      .string()
      .min(8, "Mật khẩu tạm thời phải có ít nhất 8 ký tự.")
      .max(128, "Mật khẩu không được vượt quá 128 ký tự."),
    clinicId: z.string(),
    specialization: z.string().min(1, "Vui lòng chọn chuyên khoa."),
    consultationFee: requiredVndSchema,
  })
  .superRefine((values, context) => {
    const email = values.emailPrefix.includes("@")
      ? values.emailPrefix
      : `${values.emailPrefix}${values.emailDomain}`;
    if (!z.email().safeParse(email).success) {
      context.addIssue({
        code: "custom",
        path: ["emailPrefix"],
        message: "Địa chỉ email không hợp lệ.",
      });
    }
  });

export type CreateExpertValues = z.infer<typeof createExpertSchema>;

export const quickBookSchema = z.object({
  expertId: z.string().min(1, "Vui lòng chọn chuyên gia phụ trách."),
  scheduledAt: z
    .string()
    .min(1, "Vui lòng chọn thời gian ca hẹn.")
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date > new Date();
    }, "Thời gian ca hẹn phải nằm trong tương lai."),
  reason: z
    .string()
    .trim()
    .min(3, "Vui lòng mô tả lý do tư vấn.")
    .max(500, "Lý do không được vượt quá 500 ký tự."),
});

export type QuickBookValues = z.infer<typeof quickBookSchema>;
