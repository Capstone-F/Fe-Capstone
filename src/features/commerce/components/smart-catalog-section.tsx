"use client";

import { AlertTriangle } from "lucide-react";
import { useProductSelection } from "../hooks/use-product-selection";

export function SmartCatalogSection() {
  const { selectedProduct, hasConflict, handleProductSelect } =
    useProductSelection();

  return (
    <section
      id="products"
      className="bg-secondary/10 border-border/30 border-t py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl space-y-3 text-left">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Cửa hàng thông minh
            </span>
            <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Cảnh báo thông minh chống xung đột hoạt chất
            </h2>
            <p className="text-muted-foreground text-sm">
              GlowScan áp dụng cơ chế phân tích thành phần tự động. Thử click
              chọn đồng thời cả 2 hoạt chất **BHA** và **Retinol** phía dưới để
              kiểm tra chức năng cảnh báo xung đột của giỏ hàng!
            </p>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Product 1 */}
          <div
            onClick={() => handleProductSelect("centella")}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
              selectedProduct.includes("centella")
                ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                : "border-border/60 hover:border-primary/40"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  Phục hồi da
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  Lựa chọn an toàn
                </span>
              </div>
              <h3 className="font-heading text-foreground text-base font-bold">
                Kem dưỡng làm dịu rau má GlowScan
              </h3>
              <p className="text-muted-foreground text-xs leading-normal">
                Chứa 5% Centella và 2% Niacinamide giúp phục hồi nhanh chóng làn
                da đang bị kích ứng, nhạy cảm.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                  Rau má
                </span>
                <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                  B5
                </span>
              </div>
            </div>
            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
              <span className="text-foreground font-bold">320.000 đ</span>
              <span
                className={`text-xs font-semibold ${selectedProduct.includes("centella") ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {selectedProduct.includes("centella")
                  ? "Đã chọn"
                  : "+ Thêm vào giỏ"}
              </span>
            </div>
          </div>

          {/* Product 2 */}
          <div
            onClick={() => handleProductSelect("bha")}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
              selectedProduct.includes("bha")
                ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                : "border-border/60 hover:border-primary/40"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  Tẩy tế bào chết
                </span>
                <span className="text-xs font-medium text-red-500">
                  Hoạt chất mạnh
                </span>
              </div>
              <h3 className="font-heading text-foreground text-base font-bold">
                Dung dịch tẩy da chết hóa học BHA 2%
              </h3>
              <p className="text-muted-foreground text-xs leading-normal">
                Thấm sâu làm sạch bã nhờn, loại bỏ tế bào sừng gây bít tắc cồi
                mụn ẩn.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                  Salicylic Acid 2%
                </span>
              </div>
            </div>
            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
              <span className="text-foreground font-bold">390.000 đ</span>
              <span
                className={`text-xs font-semibold ${selectedProduct.includes("bha") ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {selectedProduct.includes("bha") ? "Đã chọn" : "+ Thêm vào giỏ"}
              </span>
            </div>
          </div>

          {/* Product 3 */}
          <div
            onClick={() => handleProductSelect("retinol")}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
              selectedProduct.includes("retinol")
                ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                : "border-border/60 hover:border-primary/40"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  Trẻ hóa & Chống lão hóa
                </span>
                <span className="text-xs font-medium text-red-500">
                  Hoạt chất mạnh
                </span>
              </div>
              <h3 className="font-heading text-foreground text-base font-bold">
                Tinh chất Retinol tinh khiết 1%
              </h3>
              <p className="text-muted-foreground text-xs leading-normal">
                Kích thích sản sinh collagen thế hệ mới, mờ nếp nhăn mảnh và
                giúp căng bóng da.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                  Retinol 1%
                </span>
              </div>
            </div>
            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
              <span className="text-foreground font-bold">550.000 đ</span>
              <span
                className={`text-xs font-semibold ${selectedProduct.includes("retinol") ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {selectedProduct.includes("retinol")
                  ? "Đã chọn"
                  : "+ Thêm vào giỏ"}
              </span>
            </div>
          </div>
        </div>

        {/* Conflict Warning banner demo */}
        {hasConflict && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 duration-300">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-yellow-800">
                  Cảnh báo xung đột hoạt chất phát hiện!
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-yellow-700">
                  Bạn đang thêm cả **BHA 2%** và **Retinol 1%** vào routine/giỏ
                  hàng. Việc sử dụng đồng thời cả hai hoạt chất tẩy sừng và tái
                  tạo mạnh mẽ này trong cùng một thời điểm để tránh kích ứng
                  mạnh.
                </p>
                <p className="mt-2 text-[11px] font-semibold text-yellow-900">
                  💡 Khuyên dùng: Sử dụng xen kẽ cách ngày (ví dụ: BHA tối thứ
                  2, 4, 6; Retinol tối thứ 3, 5, 7) và tăng cường cấp ẩm phục
                  hồi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
