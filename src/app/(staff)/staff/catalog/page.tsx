"use client";

import React from "react";
import { PackagePlus } from "lucide-react";

import { ProductOnboardingForm } from "@/features/commerce/components/product-onboarding-form";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";

export default function CatalogOnboardingPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={PackagePlus}
        title="Danh Mục Sản Phẩm & Onboard SKU Mới"
        description="Khai báo sản phẩm mới, thiết lập biến thể và liên kết thành phần mỹ phẩm cho hệ thống."
      />

      <ProductOnboardingForm />
    </div>
  );
}
