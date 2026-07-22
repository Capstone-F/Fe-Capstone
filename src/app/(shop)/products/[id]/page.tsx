import { ProductDetailPage } from "@/features/commerce/pages/product-detail-page";
import { ShopContainer } from "@/shared/components/layout/shop-container";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <ShopContainer>
      <ProductDetailPage {...props} />
    </ShopContainer>
  );
}
