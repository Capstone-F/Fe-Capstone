import { ClinicDetailPage } from "@/features/clinics/pages/clinic-detail-page";

export const metadata = {
  title: "Chi tiết Phòng khám | GlowScan",
  description:
    "Thông tin chi tiết và vị trí bản đồ của phòng khám đối tác GlowScan.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClinicDetailPage clinicId={id} />;
}
