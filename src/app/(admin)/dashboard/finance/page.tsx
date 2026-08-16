import { Suspense } from "react";
import { FinanceView } from "@/features/admin/finance/components/finance-view";
import { DashboardLoading } from "@/features/dashboard/components/dashboard-shell";

export const metadata = {
  title: "Dòng tiền & Đối soát",
};

export default function FinancePage() {
  return (
    <Suspense fallback={<DashboardLoading cards={4} />}>
      <FinanceView />
    </Suspense>
  );
}
