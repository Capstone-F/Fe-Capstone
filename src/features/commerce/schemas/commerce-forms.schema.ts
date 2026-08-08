import { z } from "zod";

export const shippingAddressSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên người nhận.")
    .max(1024, "Tên người nhận quá dài."),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."),
  provinceId: z
    .number()
    .int()
    .positive()
    .nullable()
    .refine((value) => value !== null, "Vui lòng chọn tỉnh hoặc thành phố."),
  districtId: z
    .number()
    .int()
    .positive()
    .nullable()
    .refine((value) => value !== null, "Vui lòng chọn quận hoặc huyện."),
  wardCode: z
    .string()
    .nullable()
    .refine((value) => Boolean(value), "Vui lòng chọn phường hoặc xã."),
  streetAddress: z
    .string()
    .trim()
    .min(3, "Vui lòng nhập số nhà và tên đường.")
    .max(1024, "Địa chỉ quá dài."),
});

// The form must retain null while the user has not selected an address level.
// The schema output narrows these values after validation.
export type ShippingAddressFormValues = z.input<typeof shippingAddressSchema>;

export const cancellationSchema = z
  .object({
    selectedReason: z.string(),
    customReason: z
      .string()
      .trim()
      .max(500, "Lý do không được vượt quá 500 ký tự."),
  })
  .refine((values) => Boolean(values.selectedReason || values.customReason), {
    path: ["customReason"],
    message: "Vui lòng chọn hoặc nhập lý do hủy.",
  });

export type CancellationFormValues = z.infer<typeof cancellationSchema>;
