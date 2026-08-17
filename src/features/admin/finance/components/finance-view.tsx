"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { buildMoneyFlow } from "../lib/flow";
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

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const isPending = dashboard.isPending;
  const isError = dashboard.isError;

  const data = dashboard.data;

  const flow = React.useMemo(() => {
    if (!data) return null;
    return buildMoneyFlow(data.metrics);
  }, [data]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Dòng tiền & Đối soát"
        description="Theo dõi tiền vào, tiền ra và số dư của từng phòng khám."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      {isPending ? (
        <DashboardLoading cards={4} />
      ) : isError || !data || !flow ? (
        <DashboardError retry={() => void dashboard.refetch()} />
      ) : (
        <>
          <MoneyFlowSummary flow={flow} onNavigate={setTab} />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="clinics">Phòng khám</TabsTrigger>
              <TabsTrigger value="refunds">Hoàn tiền khách</TabsTrigger>
              <TabsTrigger value="platform">Nền tảng</TabsTrigger>
            </TabsList>

            <TabsContent value="clinics" className="mt-4">
              <ClinicPayoutsTab from={data.period.from} to={data.period.to} />
            </TabsContent>
            <TabsContent value="refunds" className="mt-4">
              <RefundOutflowTab flow={flow} />
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
