"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import {
  DashboardEmptyPanel,
  DashboardError,
  DashboardLoading,
  DashboardSectionCard,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { useAdminActivity } from "../hooks/useAdminActivity";
import {
  ACTIVITY_TYPE_LABELS,
  activityMetaFor,
  activityTypeLabel,
} from "../lib/activity-meta";
import type {
  AdminActivityItem,
  AdminActivityType,
  ListAdminActivityQuery,
} from "../types/activity.types";

const PAGE_SIZE = 20;

const TYPE_ITEMS: Record<string, string> = {
  ALL: "Tất cả loại",
  ...ACTIVITY_TYPE_LABELS,
};

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
  const [type, setType] = React.useState<string>("ALL");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const query = React.useMemo<ListAdminActivityQuery>(
    () => ({
      type: type === "ALL" ? undefined : [type as AdminActivityType],
      from: from || undefined,
      to: to || undefined,
    }),
    [type, from, to],
  );

  // Any filter change invalidates the current page number. `query` is
  // memoized above, so its reference only changes when the filters actually
  // do — adjusting state during render here avoids the extra effect-driven
  // render pass that `setPage` inside a `useEffect` would cause.
  const [prevQuery, setPrevQuery] = React.useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setPage(1);
  }

  const activity = useAdminActivity({ ...query, page, limit: PAGE_SIZE });
  const data = activity.data;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const grouped = React.useMemo(() => {
    const groups = new Map<string, AdminActivityItem[]>();
    for (const item of data?.items ?? []) {
      const day = vnDayKey(item.occurredAt);
      groups.set(day, [...(groups.get(day) ?? []), item]);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <header>
        <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
          GlowScan Operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Nhật ký hoạt động
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Các thay đổi gần nhất trên toàn hệ thống.
        </p>
      </header>

      <DashboardSectionCard
        title="Sự kiện"
        description={`${total.toLocaleString("vi-VN")} sự kiện khớp bộ lọc`}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Loại hoạt động</Label>
            <Select
              value={type}
              items={TYPE_ITEMS}
              onValueChange={(value) => setType(value || "ALL")}
            >
              <SelectTrigger aria-label="Lọc theo loại hoạt động">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activity-from" className="text-xs">
              Từ ngày
            </Label>
            <Input
              id="activity-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activity-to" className="text-xs">
              Đến ngày
            </Label>
            <Input
              id="activity-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>

        {activity.isPending ? (
          <DashboardLoading cards={3} />
        ) : activity.isError || !data ? (
          <DashboardError retry={() => void activity.refetch()} />
        ) : grouped.length === 0 ? (
          <DashboardEmptyPanel
            title="Không có hoạt động"
            description="Không có sự kiện nào khớp bộ lọc hiện tại."
          />
        ) : (
          <>
            <div className="flex flex-col gap-5">
              {grouped.map(([day, rows]) => (
                <div key={day}>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {formatDate(day)}
                  </p>
                  <div className="flex flex-col gap-2">
                    {rows.map((item) => {
                      const meta = activityMetaFor(item.type);
                      const Icon = meta.icon;

                      const row = (
                        <div className="hover:border-primary/30 flex items-start gap-3 rounded-xl border p-3 transition-colors">
                          <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {activityTypeLabel(item.type)}
                              </Badge>
                              {item.amountVnd == null ? null : (
                                <span className="text-sm font-semibold">
                                  {formatCurrency(item.amountVnd)}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm">{item.title}</p>
                            {item.description ? (
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {item.description}
                              </p>
                            ) : null}
                            {item.actorName ? (
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                bởi {item.actorName}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {formatDateTime(item.occurredAt)}
                          </span>
                        </div>
                      );

                      return meta.href ? (
                        <Link key={item.id} href={meta.href} className="block">
                          {row}
                        </Link>
                      ) : (
                        <div key={item.id}>{row}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              className="mt-4"
            />
          </>
        )}
      </DashboardSectionCard>
    </main>
  );
}
