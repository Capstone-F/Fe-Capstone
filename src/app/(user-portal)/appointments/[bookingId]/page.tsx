import { CustomerBookingDetailPage } from "@/features/booking/pages/customer-booking-detail-page";

export default async function CustomerBookingDetailRoute({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <CustomerBookingDetailPage bookingId={bookingId} />;
}
