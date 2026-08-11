"use client";

import React from "react";
import { ProductOnboardingForm } from "@/features/commerce/components/product-onboarding-form";

export default function CatalogOnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Danh Mục Sản Phẩm & Onboard SKU Mới
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Khai báo sản phẩm mới, thiết lập biến thể và liên kết thành phần mỹ
          phẩm cho hệ thống.
        </p>
      </div>

      <ProductOnboardingForm />
    </div>
  );
}
