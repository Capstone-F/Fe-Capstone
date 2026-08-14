import { WalletCallbackPage } from "@/features/wallet/pages/wallet-callback-page";
import { ShopContainer } from "@/shared/components/layout/shop-container";

export const metadata = {
  title: "Kết quả nạp ví | GlowScan",
  description: "Trạng thái giao dịch nạp tiền vào ví GlowScan.",
};

export default function Page() {
  return (
    <ShopContainer>
      <WalletCallbackPage />
    </ShopContainer>
  );
}
