"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus, Trash2, PackageCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { ImageUploader } from "@/shared/components/image-uploader";
import {
  productOnboardingSchema,
  type ProductOnboardingValues,
} from "../schemas/product-onboarding.schema";

interface ProductOnboardingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function ProductOnboardingForm({
  onSuccess,
  onCancel,
  isModal = false,
}: ProductOnboardingFormProps = {}) {
  const [loading, setLoading] = useState(false);

  // Fetch Categories helper (TC-STF-03)
  const { data: categories = [] } = useQuery({
    queryKey: ["products-categories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<Array<{ code: string; name: string }>>(
          API_ENDPOINTS.PRODUCTS.CATEGORIES,
        );
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch Ingredients helper (TC-STF-03)
  const { data: availableIngredients = [] } = useQuery({
    queryKey: ["ingredients-list"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<Array<{ id: string; name: string }>>(
          API_ENDPOINTS.INGREDIENTS.LIST,
        );
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductOnboardingValues>({
    resolver: zodResolver(productOnboardingSchema),
    defaultValues: {
      name: "",
      brand: "",
      categoryCode: "",
      categoryName: "",
      description: "",
      sku: "",
      volume: "",
      packaging: "",
      priceVnd: undefined,
      imageUrl: "",
      shelfLifeValue: undefined,
      shelfLifeUnit: "DAY",
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const handleCategorySelect = (code: string) => {
    const selected = categories.find((c) => c.code === code);
    if (selected) {
      setValue("categoryCode", selected.code);
      setValue("categoryName", selected.name);
    } else {
      setValue("categoryCode", code);
    }
  };

  const onSubmit = async (values: ProductOnboardingValues) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name.trim(),
        brand: values.brand.trim(),
        categoryCode: values.categoryCode.trim(),
        categoryName: values.categoryName.trim(),
        description: values.description?.trim() || "",
        sku: values.sku.trim(),
        volume: values.volume?.trim() || "",
        packaging: values.packaging?.trim() || "",
        priceVnd: Number(values.priceVnd),
        imageUrl: values.imageUrl.trim(),
        shelfLifeValue: Number(values.shelfLifeValue),
        shelfLifeUnit: values.shelfLifeUnit.trim(),
        ingredients: (values.ingredients || []).filter(
          (ing) => ing.name && ing.name.trim() !== "",
        ),
      };

      // Step 1: POST /products
      const response = await apiClient.post<{
        id?: string;
        variants?: { id: string }[];
      }>(API_ENDPOINTS.PRODUCTS.LIST, payload);

      const variantId = response.data?.variants?.[0]?.id || response.data?.id;

      // Step 2 (TC-STF-03 Step 4): PATCH /products/variants/:variantId if imageUrl is set
      if (variantId && values.imageUrl.trim()) {
        try {
          await apiClient.patch(
            API_ENDPOINTS.PRODUCTS.VARIANT_UPDATE(variantId),
            { imageUrl: values.imageUrl.trim() },
          );
        } catch {
          // Ignore if backend already assigned imageUrl during create
        }
      }

      toast.success("Tạo sản phẩm thành công!");

      reset({
        name: "",
        brand: "",
        categoryCode: "",
        categoryName: "",
        description: "",
        sku: "",
        volume: "",
        packaging: "",
        priceVnd: undefined,
        imageUrl: "",
        shelfLifeValue: undefined,
        shelfLifeUnit: "DAY",
        ingredients: [],
      });

      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        "Tạo sản phẩm thất bại: " +
          (axiosErr.response?.data?.message || axiosErr.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Thông tin cơ bản */}
      <div className="space-y-4">
        <h4 className="border-b pb-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
          1. Thông tin sản phẩm
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Tên sản phẩm *</Label>
            <Input
              id="p-name"
              placeholder="VD: La Roche-Posay Effaclar Serum..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-rose-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-brand">Thương hiệu *</Label>
            <Input
              id="p-brand"
              placeholder="VD: La Roche-Posay..."
              {...register("brand")}
            />
            {errors.brand && (
              <p className="text-xs font-medium text-rose-500">
                {errors.brand.message}
              </p>
            )}
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${
            categories.length > 0 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          <div className="grid gap-2">
            <Label htmlFor="p-sku">Mã SKU *</Label>
            <Input
              id="p-sku"
              placeholder="VD: QA-STAFF-SERUM-01..."
              {...register("sku")}
            />
            {errors.sku && (
              <p className="text-xs font-medium text-rose-500">
                {errors.sku.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-catcode">Danh mục sản phẩm *</Label>
            {categories.length > 0 ? (
              <Controller
                name="categoryCode"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(val) => {
                      const v = val ?? "";
                      field.onChange(v);
                      handleCategorySelect(v);
                    }}
                  >
                    <SelectTrigger id="p-catcode" className="h-10 text-xs">
                      <SelectValue placeholder="-- Chọn danh mục --" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.code}
                          value={cat.code}
                          className="text-xs"
                        >
                          {cat.name} ({cat.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="p-catcode"
                placeholder="VD: SERUM, CLEANSER..."
                {...register("categoryCode")}
              />
            )}
            {errors.categoryCode && (
              <p className="text-xs font-medium text-rose-500">
                {errors.categoryCode.message}
              </p>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="grid gap-2">
              <Label htmlFor="p-catname">Tên danh mục *</Label>
              <Input
                id="p-catname"
                placeholder="VD: Tinh chất dưỡng da..."
                {...register("categoryName")}
              />
              {errors.categoryName && (
                <p className="text-xs font-medium text-rose-500">
                  {errors.categoryName.message}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="p-desc">Mô tả sản phẩm</Label>
          <Textarea
            id="p-desc"
            placeholder="Mô tả công dụng, loại da phù hợp..."
            {...register("description")}
            rows={3}
          />
          {errors.description && (
            <p className="text-xs font-medium text-rose-500">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Biến thể & Giá */}
      <div className="space-y-4">
        <h4 className="border-b pb-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
          2. Biến thể, Giá & Hạn sử dụng
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="p-price">Giá niêm yết (VND) *</Label>
            <Input
              id="p-price"
              type="number"
              placeholder="VD: 500000"
              {...register("priceVnd", { valueAsNumber: true })}
            />
            {errors.priceVnd && (
              <p className="text-xs font-medium text-rose-500">
                {errors.priceVnd.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-vol">Dung tích / Thể tích</Label>
            <Input
              id="p-vol"
              placeholder="VD: 30ml, 100g..."
              {...register("volume")}
            />
            {errors.volume && (
              <p className="text-xs font-medium text-rose-500">
                {errors.volume.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-pack">Bao bì / Đóng gói</Label>
            <Input
              id="p-pack"
              placeholder="VD: Chai, Tuýp..."
              {...register("packaging")}
            />
            {errors.packaging && (
              <p className="text-xs font-medium text-rose-500">
                {errors.packaging.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-shelflife">Hạn lưu kho *</Label>
            <div className="flex gap-2">
              <Input
                id="p-shelflife"
                type="number"
                placeholder="VD: 365"
                {...register("shelfLifeValue", { valueAsNumber: true })}
                className="w-24"
              />
              <Controller
                name="shelfLifeUnit"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "DAY"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAY" className="text-xs">
                        Ngày
                      </SelectItem>
                      <SelectItem value="MONTH" className="text-xs">
                        Tháng
                      </SelectItem>
                      <SelectItem value="YEAR" className="text-xs">
                        Năm
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.shelfLifeValue && (
              <p className="text-xs font-medium text-rose-500">
                {errors.shelfLifeValue.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Hình ảnh sản phẩm *</Label>
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                disabled={loading}
              />
            )}
          />
          {errors.imageUrl && (
            <p className="text-xs font-medium text-rose-500">
              {errors.imageUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* Thành phần mỹ phẩm */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            3. Thành phần mỹ phẩm
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "",
                concentrationPct: undefined,
                isKeyIngredient: false,
              })
            }
            className="h-8 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm thành phần
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed py-2 text-center text-xs text-slate-400 italic">
            Chưa có thành phần nào. Bấm &quot;Thêm thành phần&quot; để khai báo
            nếu cần.
          </p>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex-1">
                {availableIngredients.length > 0 ? (
                  <Controller
                    name={`ingredients.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="-- Chọn thành phần có sẵn --" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIngredients.map((ing) => (
                            <SelectItem
                              key={ing.id}
                              value={ing.name}
                              className="text-xs"
                            >
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    placeholder="Tên thành phần (VD: Salicylic Acid, Niacinamide)..."
                    {...register(`ingredients.${index}.name`)}
                    className="h-9 text-xs"
                  />
                )}
              </div>

              <div className="relative w-28">
                <Input
                  type="number"
                  step={0.1}
                  placeholder="Nồng độ"
                  {...register(`ingredients.${index}.concentrationPct`, {
                    valueAsNumber: true,
                  })}
                  className="h-9 pr-8 text-xs"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-slate-500"
                >
                  %
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  id={`key-${index}`}
                  {...register(`ingredients.${index}.isKeyIngredient`)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor={`key-${index}`}
                  className="cursor-pointer select-none"
                >
                  Chính
                </label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-4 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-5 text-xs font-bold"
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          size={isModal ? "default" : "lg"}
          disabled={loading}
          className="gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
        >
          <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          {loading ? "Đang lưu sản phẩm..." : "Xác Nhận Tạo Sản Phẩm"}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className="space-y-6">
      <Card className="mx-auto max-w-4xl border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            Khai Báo Sản Phẩm Mới
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            Khai báo sản phẩm thương mại mới, liên kết thành phần mỹ phẩm và
            thiết lập biến thể sẵn sàng nhập kho/bán hàng.
          </p>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  );
}
