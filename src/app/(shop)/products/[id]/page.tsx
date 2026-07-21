import { ProductDetailPage } from "@/features/commerce/pages/product-detail-page";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <ProductDetailPage {...props} />;
}
