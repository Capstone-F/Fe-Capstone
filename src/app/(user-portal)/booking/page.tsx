import { redirect } from "next/navigation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function LegacyBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ expertId?: string | string[] }>;
}) {
  const params = await searchParams;
  const expertId = Array.isArray(params.expertId)
    ? params.expertId[0]
    : params.expertId;

  if (expertId && UUID_PATTERN.test(expertId)) {
    redirect(`/booking/${expertId}`);
  }

  redirect("/experts");
}
