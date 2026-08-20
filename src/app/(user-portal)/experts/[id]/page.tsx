import { SessionGuard } from "@/features/auth/components/session-guard";
import { ExpertDetailPage } from "@/features/experts/pages/expert-detail-page";

export default function Page() {
  return (
    <SessionGuard>
      <ExpertDetailPage />
    </SessionGuard>
  );
}
