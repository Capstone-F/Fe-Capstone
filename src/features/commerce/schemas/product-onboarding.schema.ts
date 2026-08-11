import { z } from "zod";

export const productIngredientSchema = z.object({
  name: z.string(),
  concentrationPct: z.number({ message: "Nồng độ phải là số" }).optional(),
  isKeyIngredient: z.boolean().optional(),
});

export const productOnboardingSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập tên sản phẩm" }),
  brand: z.string().min(1, { message: "Vui lòng nhập thương hiệu" }),
  categoryCode: z.string().min(1, { message: "Vui lòng nhập mã danh mục" }),
  categoryName: z.string().min(1, { message: "Vui lòng nhập tên danh mục" }),
  description: z.string().optional(),
  sku: z.string().min(1, { message: "Vui lòng nhập mã SKU sản phẩm" }),
  volume: z.string().optional(),
  packaging: z.string().optional(),
  priceVnd: z
    .number({ message: "Giá niêm yết phải là số" })
    .min(0, { message: "Giá niêm yết không được âm" }),
  imageUrl: z.string().min(1, { message: "Vui lòng tải ảnh sản phẩm" }),
  shelfLifeValue: z
    .number({ message: "Hạn sử dụng phải là số" })
    .min(1, { message: "Hạn sử dụng phải lớn hơn 0" }),
  shelfLifeUnit: z.string().min(1, { message: "Đơn vị hạn sử dụng" }),
  ingredients: z.array(productIngredientSchema).optional(),
});

export type ProductOnboardingValues = z.infer<typeof productOnboardingSchema>;
