import { VnpayReturnPage } from "@/features/commerce/pages/vnpay-return-page";
import { ShopContainer } from "@/shared/components/layout/shop-container";
import { Suspense } from "react";

export const metadata = {
  title: "Kết quả thanh toán | GlowScan",
  description: "Trạng thái giao dịch thanh toán đơn hàng tại GlowScan.",
};

export default function Page() {
  return (
    <ShopContainer>
      <Suspense
        fallback={
          <div className="animate-pulse py-20 text-center font-medium text-slate-500">
            Đang xử lý kết quả thanh toán...
          </div>
        }
      >
        <VnpayReturnPage />
      </Suspense>
    </ShopContainer>
  );
}
