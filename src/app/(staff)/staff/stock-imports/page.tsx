"use client";

import React from "react";
import { ImportFormsTable } from "@/features/stock/components/import-forms-table";

export default function StockImportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Quy trình Quản lý Nhập Kho
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Tạo bản nháp, chỉnh sửa, nộp duyệt, và xác nhận nhập kho tự động sinh
          lô kho (StockBatch).
        </p>
      </div>

      <ImportFormsTable />
    </div>
  );
}
