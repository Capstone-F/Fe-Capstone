import { SessionGuard } from "@/features/auth/components/session-guard";
import { ExpertsPage } from "@/features/experts/pages/experts-page";

export default function Page() {
  return (
    <SessionGuard>
      <ExpertsPage />
    </SessionGuard>
  );
}
