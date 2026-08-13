import { z } from "zod";

export const authFormSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    name: z
      .string()
      .trim()
      .max(100, "Họ và tên không được vượt quá 100 ký tự."),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập địa chỉ email.")
      .email("Địa chỉ email không hợp lệ."),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .max(128, "Mật khẩu không được vượt quá 128 ký tự."),
    confirmPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (value.mode !== "register") return;

    if (value.name.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "Họ và tên phải có ít nhất 2 ký tự.",
      });
    }

    if (value.confirmPassword.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Vui lòng nhập lại mật khẩu.",
      });
    } else if (value.confirmPassword !== value.password) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận không khớp.",
      });
    }
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;
