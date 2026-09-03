"use client";

import React, { useState } from "react";
import { PackagePlus, Plus } from "lucide-react";

import { ProductOnboardingForm } from "@/features/commerce/components/product-onboarding-form";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";
import { InventoryWarningTable } from "@/features/stock/components/inventory-warning-table";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export default function CatalogOnboardingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={PackagePlus}
        title="Quản Lý Kho & Khai Báo Sản Phẩm"
        description="Theo dõi số lượng tồn kho hiện tại, cảnh báo sản phẩm cần nhập kho và khai báo SKU sản phẩm mới."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 rounded-xl bg-[#2C3E35] text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
          >
            <Plus className="h-4 w-4" />
            Khai Báo Sản Phẩm Mới
          </Button>
        }
      />

      {/* Main inventory status */}
      <InventoryWarningTable />

      {/* Product Onboarding Popup Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl p-6 shadow-2xl sm:max-w-4xl">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
              <PackagePlus className="h-5 w-5 text-emerald-600" />
              Khai Báo Sản Phẩm Mới (Onboard SKU)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Điền thông tin chi tiết để thêm sản phẩm và biến thể mới vào kho
              hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <ProductOnboardingForm
              isModal
              onSuccess={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
