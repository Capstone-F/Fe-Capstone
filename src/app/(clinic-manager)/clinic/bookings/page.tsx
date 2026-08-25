import { ClinicBookingsView } from "@/features/clinic-manager/components/clinic-bookings-view";

export default async function ClinicBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ expertId?: string | string[] }>;
}) {
  const params = await searchParams;
  const expertId = Array.isArray(params.expertId)
    ? params.expertId[0]
    : params.expertId;

  return <ClinicBookingsView initialExpertId={expertId} />;
}
