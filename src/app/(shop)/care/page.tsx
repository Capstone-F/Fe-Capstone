import { CareHubPage } from "@/features/treatment/pages/care-hub-page";
import { ShopContainer } from "@/shared/components/layout/shop-container";

export const metadata = {
  title: "Chăm Sóc & Lộ Trình Routine | GlowScan",
  description:
    "Trung tâm quản lý nhật ký chăm sóc da cá nhân hóa cùng AI & Bác sĩ Da liễu.",
};

export default function Page() {
  return (
    <ShopContainer>
      <CareHubPage />
    </ShopContainer>
  );
}
