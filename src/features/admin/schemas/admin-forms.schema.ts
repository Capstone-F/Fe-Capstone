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

const optionalEmailSchema = z
  .string()
  .refine(
    (value) => value.trim() === "" || z.email().safeParse(value.trim()).success,
    "Địa chỉ email không hợp lệ.",
  );

export const seedDemoCustomerSchema = z.object({
  email: optionalEmailSchema,
  password: z
    .string()
    .refine(
      (value) => value === "" || (value.length >= 6 && value.length <= 72),
      "Mật khẩu phải có từ 6 đến 72 ký tự.",
    ),
  fullName: z
    .string()
    .refine(
      (value) => value.trim().length <= 120,
      "Họ tên không được vượt quá 120 ký tự.",
    ),
  historyDays: z.string().refine((value) => {
    if (value === "") return true;
    if (!/^\d+$/.test(value)) return false;
    const days = Number(value);
    return Number.isInteger(days) && days >= 7 && days <= 60;
  }, "Số ngày lịch sử phải là số nguyên từ 7 đến 60."),
});

export type SeedDemoCustomerFormValues = z.infer<typeof seedDemoCustomerSchema>;

export const createManagedUserSchema = z
  .object({
    email: z.email("Địa chỉ email không hợp lệ."),
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ và tên không được vượt quá 100 ký tự."),
    role: z.enum(["staff", "expert", "clinic_manager"]),
    temporaryPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .max(128, "Mật khẩu không được vượt quá 128 ký tự."),
    clinicId: z.string(),
    specialization: z.string().trim().max(120),
    consultationFee: z.string(),
  })
  .superRefine((values, context) => {
    if (
      (values.role === "expert" || values.role === "clinic_manager") &&
      !values.clinicId
    ) {
      context.addIssue({
        code: "custom",
        path: ["clinicId"],
        message: "Vui lòng chọn phòng khám.",
      });
    }
    if (values.role === "expert") {
      if (!values.specialization) {
        context.addIssue({
          code: "custom",
          path: ["specialization"],
          message: "Vui lòng nhập chuyên khoa.",
        });
      }
      if (!requiredVndSchema.safeParse(values.consultationFee).success) {
        context.addIssue({
          code: "custom",
          path: ["consultationFee"],
          message: "Phí tư vấn phải là số tiền lớn hơn 0.",
        });
      }
    }
  });

export type CreateManagedUserValues = z.infer<typeof createManagedUserSchema>;

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
