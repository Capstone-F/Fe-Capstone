"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { DashboardPeriod, DashboardRange } from "../types/dashboard.types";

const RANGE_LABELS: Record<DashboardRange, string> = {
  "7d": "7 ngày",
  "30d": "30 ngày",
  "90d": "90 ngày",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const compactCurrencyFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});
const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function DashboardPageHeader({
  title,
  description,
  range,
  period,
  onRangeChange,
}: {
  title: string;
  description: string;
  range: DashboardRange;
  period?: DashboardPeriod;
  onRangeChange: (range: DashboardRange) => void;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
          GlowScan Operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          {description}
        </p>
        {period ? (
          <p className="text-muted-foreground mt-2 text-xs">
            {formatDate(period.from)} – {formatDate(period.to)} · Giờ Việt Nam
          </p>
        ) : null}
      </div>
      <Select
        value={range}
        onValueChange={(value) =>
          value && onRangeChange(value as DashboardRange)
        }
      >
        <SelectTrigger aria-label="Chọn kỳ thống kê" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {(Object.keys(RANGE_LABELS) as DashboardRange[]).map((value) => (
            <SelectItem key={value} value={value}>
              {RANGE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  );
}

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const content = (
    <Card className="hover:border-primary/30 h-full transition-colors">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? (
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {hint}
            </p>
          ) : null}
        </div>
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block h-full focus-visible:outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}

export function DashboardLoading({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6" aria-label="Đang tải dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardError({ retry }: { retry: () => void }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="text-destructive size-8" />
        <div>
          <p className="font-medium">Không thể tải dữ liệu tổng quan</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Kiểm tra kết nối tới máy chủ rồi thử lại.
          </p>
        </div>
        <Button variant="outline" onClick={retry}>
          <RefreshCw /> Thử lại
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardEmptyPanel({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        {description}
      </p>
      {href && action ? (
        <Button
          render={<Link href={href} />}
          nativeButton={false}
          variant="outline"
          className="mt-4"
        >
          {action} <ArrowRight />
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardSectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00+07:00`));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatChartDate(value: string): string {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
}
