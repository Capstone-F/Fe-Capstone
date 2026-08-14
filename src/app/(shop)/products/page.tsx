import { ProductsPage } from "@/features/commerce/pages/products-page";
import { Suspense } from "react";

export const metadata = {
  title: "Cửa hàng sản phẩm | GlowScan",
  description:
    "Khám phá danh sách các sản phẩm chăm sóc da y khoa chính hãng được GlowScan phân phối.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
        <Suspense
          fallback={
            <div className="animate-pulse py-20 text-center font-medium text-slate-500">
              Đang tải sản phẩm...
            </div>
          }
        >
          <ProductsPage />
        </Suspense>
      </div>
    </div>
  );
}
