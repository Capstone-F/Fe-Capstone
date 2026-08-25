import { ExpertManagementView } from "@/features/admin/components/expert-management-view";

export default async function AdminExpertManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ expertId?: string | string[] }>;
}) {
  const params = await searchParams;
  const focusedExpertId = Array.isArray(params.expertId)
    ? params.expertId[0]
    : params.expertId;

  return <ExpertManagementView focusedExpertId={focusedExpertId} />;
}
