import { ConsultationWorkspace } from "@/features/consultations/components/consultation-workspace";

export default async function CustomerConsultationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <ConsultationWorkspace bookingId={bookingId} perspective="customer" />;
}
