import { OrdersPage } from "@/features/commerce/pages/orders-page";
import { ShopContainer } from "@/shared/components/layout/shop-container";

export default function Page() {
  return (
    <ShopContainer>
      <OrdersPage />
    </ShopContainer>
  );
}
