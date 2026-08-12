import { z } from "zod";

export const createStockImportFormSchema = z.object({
  productVariantId: z
    .string()
    .min(1, { message: "Vui lòng chọn sản phẩm / biến thể" }),
  quantity: z
    .number({ message: "Số lượng phải là số" })
    .min(1, { message: "Số lượng nhập phải lớn hơn 0" }),
  manufacturingDate: z
    .string()
    .min(1, { message: "Vui lòng chọn ngày sản xuất" }),
  batchCode: z.string().optional(),
});

export type CreateStockImportFormValues = z.infer<
  typeof createStockImportFormSchema
>;

export const updateStockImportFormSchema = z.object({
  productVariantId: z.string().optional(),
  quantity: z
    .number({ message: "Số lượng phải là số" })
    .min(1, { message: "Số lượng nhập phải lớn hơn 0" })
    .optional(),
  manufacturingDate: z.string().optional(),
  batchCode: z.string().optional(),
});

export type UpdateStockImportFormValues = z.infer<
  typeof updateStockImportFormSchema
>;

export const rejectStockImportFormSchema = z.object({
  reason: z.string().optional(),
});

export type RejectStockImportFormValues = z.infer<
  typeof rejectStockImportFormSchema
>;

export const directBatchImportSchema = z.object({
  productVariantId: z
    .string()
    .min(1, { message: "Vui lòng chọn sản phẩm / biến thể" }),
  quantity: z
    .number({ message: "Số lượng phải là số" })
    .min(1, { message: "Số lượng nhập phải lớn hơn 0" }),
  manufacturingDate: z
    .string()
    .min(1, { message: "Vui lòng chọn ngày sản xuất" }),
  batchCode: z.string().optional(),
});

export type DirectBatchImportValues = z.infer<typeof directBatchImportSchema>;

export const adjustStockBatchSchema = z.object({
  batchId: z.string().min(1, { message: "Vui lòng chọn hoặc nhập mã lô kho" }),
  quantity: z
    .number({ message: "Số lượng phải là số" })
    .min(0, { message: "Số lượng tồn kho không được âm" }),
  note: z.string().optional(),
});

export type AdjustStockBatchValues = z.infer<typeof adjustStockBatchSchema>;
