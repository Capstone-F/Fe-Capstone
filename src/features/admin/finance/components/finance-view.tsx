"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
} from "@/features/dashboard/components/dashboard-shell";
import { useAdminDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { DashboardRange } from "@/features/dashboard/types/dashboard.types";
import { buildMoneyFlow, reconcileRefunds } from "../lib/flow";
import { filterWithdrawalsByRange } from "../lib/clinic-rollup";
import {
  useAllCancellations,
  useAllClinicWithdrawals,
} from "../hooks/useAdminFinance";
import type { FinanceTab } from "../types/finance.types";
import { ClinicPayoutsTab } from "./clinic-payouts-tab";
import { MoneyFlowSummary } from "./money-flow-summary";
import { PlatformRevenueTab } from "./platform-revenue-tab";
import { RefundOutflowTab } from "./refund-outflow-tab";

const TAB_VALUES: FinanceTab[] = ["clinics", "refunds", "platform"];

function parseTab(value: string | null): FinanceTab {
  return TAB_VALUES.includes(value as FinanceTab)
    ? (value as FinanceTab)
    : "clinics";
}

export function FinanceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const [range, setRange] = React.useState<DashboardRange>("30d");
  const dashboard = useAdminDashboard(range);
  const withdrawals = useAllClinicWithdrawals();
  const cancellations = useAllCancellations();

  const setTab = (next: string) => {
    router.replace(`/dashboard/finance?tab=${next}`, { scroll: false });
  };

  const isPending =
    dashboard.isPending || withdrawals.isPending || cancellations.isPending;
  const isError =
    dashboard.isError || withdrawals.isError || cancellations.isError;

  const data = dashboard.data;
  const withdrawalRows = React.useMemo(
    () => withdrawals.data?.items ?? [],
    [withdrawals.data],
  );
  const cancellationRows = React.useMemo(
    () => cancellations.data?.items ?? [],
    [cancellations.data],
  );

  const withdrawalsInRange = React.useMemo(() => {
    if (!data) return [];
    return filterWithdrawalsByRange(
      withdrawalRows,
      data.period.from,
      data.period.to,
    );
  }, [withdrawalRows, data]);

  const flow = React.useMemo(() => {
    if (!data) return null;
    return buildMoneyFlow(data.metrics, withdrawalsInRange);
  }, [data, withdrawalsInRange]);

  const reconciliation = React.useMemo(() => {
    if (!data) return null;
    return reconcileRefunds(data.metrics.productRefundsVnd, cancellationRows);
  }, [data, cancellationRows]);

  const truncated =
    (withdrawals.data?.truncated ?? false) ||
    (cancellations.data?.truncated ?? false);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Dòng tiền & Đối soát"
        description="Theo dõi tiền vào, tiền ra và số đã chi trả cho từng phòng khám."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {isPending ? (
        <DashboardLoading cards={4} />
      ) : isError || !data || !flow || !reconciliation ? (
        <DashboardError
          retry={() => {
            void dashboard.refetch();
            void withdrawals.refetch();
            void cancellations.refetch();
          }}
        />
      ) : (
        <>
          {truncated ? (
            <Alert>
              <AlertTriangle />
              <AlertTitle>Dữ liệu bị giới hạn</AlertTitle>
              <AlertDescription>
                Chỉ tải được {withdrawals.data?.cap ?? 500} bản ghi gần nhất cho
                mỗi nguồn. Các số tổng bên dưới phản ánh phần đã tải, không phải
                toàn bộ kỳ.
              </AlertDescription>
            </Alert>
          ) : null}

          <MoneyFlowSummary
            flow={flow}
            reconciliation={reconciliation}
            onNavigate={setTab}
          />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="clinics">Phòng khám</TabsTrigger>
              <TabsTrigger value="refunds">Hoàn tiền khách</TabsTrigger>
              <TabsTrigger value="platform">Nền tảng</TabsTrigger>
            </TabsList>

            <TabsContent value="clinics" className="mt-4">
              <ClinicPayoutsTab withdrawals={withdrawalsInRange} />
            </TabsContent>
            <TabsContent value="refunds" className="mt-4">
              <RefundOutflowTab allCancellations={cancellationRows} />
            </TabsContent>
            <TabsContent value="platform" className="mt-4">
              <PlatformRevenueTab data={data} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}
