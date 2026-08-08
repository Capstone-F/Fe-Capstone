import { z } from "zod";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^(?:0|\+84)\d{9,10}$/.test(value),
    "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có độ dài hợp lệ.",
  );

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),
  phone: optionalPhoneSchema,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().refine((value) => {
    if (!value) return true;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date <= new Date();
  }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai."),
  allergies: z.array(z.string()),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
