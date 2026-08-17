"use client";

import * as React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DashboardEmptyPanel,
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
  DashboardSectionCard,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { useAdminDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { DashboardRange } from "@/features/dashboard/types/dashboard.types";
import { activityMetaFor } from "../lib/activity-meta";

// `en-CA` yields YYYY-MM-DD, so this is an ISO-shaped day key in Vietnam time
// rather than UTC. Grouping must agree with formatDateTime, which renders in
// Asia/Ho_Chi_Minh — slicing the raw UTC string puts late-evening events under
// the previous day's heading.
const VN_DAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function vnDayKey(occurredAt: string): string {
  return VN_DAY_KEY_FORMATTER.format(new Date(occurredAt));
}

export function ActivityLogView() {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const [type, setType] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");

  const query = useAdminDashboard(range);
  const data = query.data;
  const activities = React.useMemo(() => data?.recentActivity ?? [], [data]);

  // Options come from the data actually present, so the filter never offers
  // a choice that yields nothing.
  const typeItems = React.useMemo(() => {
    const items: Record<string, string> = { ALL: "Tất cả loại" };
    for (const activity of activities) {
      // First occurrence wins: overwriting per-activity made the label depend on
      // iteration order and shift as new activity arrived.
      if (!(activity.type in items)) {
        items[activity.type] = activity.title;
      }
    }
    return items;
  }, [activities]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.filter((activity) => {
      if (type !== "ALL" && activity.type !== type) return false;
      if (!term) return true;
      return `${activity.title} ${activity.description ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [activities, type, search]);

  const grouped = React.useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const activity of filtered) {
      const day = vnDayKey(activity.occurredAt);
      groups.set(day, [...(groups.get(day) ?? []), activity]);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardPageHeader
        title="Nhật ký hoạt động"
        description="Các thay đổi gần nhất trên toàn hệ thống."
        range={range}
        period={data?.period}
        onRangeChange={setRange}
      />

      <Alert>
        <Info />
        <AlertDescription>
          Hiển thị 10 hoạt động gần nhất trong kỳ. Nhật ký đầy đủ cần endpoint
          phân trang (chưa có).
        </AlertDescription>
      </Alert>

      {query.isPending ? (
        <DashboardLoading cards={3} />
      ) : query.isError || !data ? (
        <DashboardError retry={() => void query.refetch()} />
      ) : (
        <DashboardSectionCard title="Sự kiện" description="Nhóm theo ngày">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Select
              value={type}
              items={typeItems}
              onValueChange={(value) => setType(value || "ALL")}
            >
              <SelectTrigger aria-label="Lọc theo loại hoạt động">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tìm trong tiêu đề, mô tả..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {grouped.length === 0 ? (
            <DashboardEmptyPanel
              title="Không có hoạt động"
              description="Không có sự kiện nào khớp bộ lọc trong kỳ này."
            />
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map(([day, rows]) => (
                <div key={day}>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {formatDate(day)}
                  </p>
                  <div className="flex flex-col gap-2">
                    {rows.map((activity) => {
                      const meta = activityMetaFor(activity.type);
                      const Icon = meta.icon;

                      const row = (
                        <div className="hover:border-primary/30 flex items-start gap-3 rounded-xl border p-3 transition-colors">
                          <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{activity.title}</Badge>
                              {activity.amountVnd == null ? null : (
                                <span className="text-sm font-semibold">
                                  {formatCurrency(activity.amountVnd)}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {activity.description || "—"}
                            </p>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {formatDateTime(activity.occurredAt)}
                          </span>
                        </div>
                      );

                      return meta.href ? (
                        <Link
                          key={`${activity.type}-${activity.id}`}
                          href={meta.href}
                          className="block"
                        >
                          {row}
                        </Link>
                      ) : (
                        <div key={`${activity.type}-${activity.id}`}>{row}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSectionCard>
      )}
    </main>
  );
}
