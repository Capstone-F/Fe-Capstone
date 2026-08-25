"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  RefreshCw,
  ShieldAlert,
  UserRoundX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { AdminClinic } from "@/features/admin/api/admin-clinics.api";
import type {
  ExpertCancellationStatItem,
  ExpertCancellationStatsResponse,
} from "../types/expert-cancellation-report.types";

export const cancellationWindowItems = {
  POLICY: "Theo chính sách hiện hành",
  "7": "7 ngày gần nhất",
  "14": "14 ngày gần nhất",
  "30": "30 ngày gần nhất",
  "90": "90 ngày gần nhất",
};

interface ExpertCancellationReportProps {
  scope: "admin" | "clinic";
  data?: ExpertCancellationStatsResponse;
  isLoading: boolean;
  isFetching: boolean;
  error?: Error | null;
  onRetry: () => void;
  windowValue: string;
  onWindowChange: (value: string) => void;
  clinics?: AdminClinic[];
  clinicId?: string;
  onClinicChange?: (value: string) => void;
  onExpertSelect: (expertId: string) => void;
  unboundClinicMessage?: boolean;
}

export function ExpertCancellationReport({
  scope,
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
  windowValue,
  onWindowChange,
  clinics = [],
  clinicId = "ALL",
  onClinicChange,
  onExpertSelect,
  unboundClinicMessage = false,
}: ExpertCancellationReportProps) {
  const showClinic = scope === "admin";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-rose-200 bg-rose-50 text-rose-700"
          >
            <ShieldAlert /> Giám sát chất lượng dịch vụ
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Cảnh báo Expert hủy lịch
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Theo dõi ca hủy, hủy sát giờ và vắng mặt để hỗ trợ quyết định vận
            hành. Việc khóa Expert luôn cần Admin hoặc Clinic Manager xác nhận.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
          <Select
            value={windowValue}
            items={cancellationWindowItems}
            onValueChange={(value) => onWindowChange(value ?? "POLICY")}
          >
            <SelectTrigger aria-label="Khoảng thời gian báo cáo">
              <CalendarClock />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(cancellationWindowItems).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showClinic && onClinicChange ? (
            <Select
              value={clinicId}
              items={{
                ALL: "Tất cả phòng khám",
                ...Object.fromEntries(
                  clinics.map((clinic) => [clinic.id, clinic.name]),
                ),
              }}
              onValueChange={(value) => onClinicChange(value ?? "ALL")}
            >
              <SelectTrigger aria-label="Lọc theo phòng khám">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả phòng khám</SelectItem>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <ReportSkeleton />
      ) : error ? (
        <Alert
          variant="destructive"
          className="items-start rounded-2xl border-rose-200 p-4"
        >
          <AlertTriangle />
          <AlertTitle>
            {unboundClinicMessage
              ? "Tài khoản chưa được gắn với phòng khám"
              : "Không thể tải báo cáo hủy lịch"}
          </AlertTitle>
          <AlertDescription>
            {unboundClinicMessage
              ? "Vui lòng liên hệ Admin để gắn tài khoản Clinic Manager với đúng phòng khám trước khi xem báo cáo."
              : error.message}
          </AlertDescription>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 w-fit"
            onClick={onRetry}
          >
            <RefreshCw /> Thử lại
          </Button>
        </Alert>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Expert bị gắn cờ"
              value={`${data.flaggedCount}/${data.totalExperts}`}
              description={`Trong ${data.windowDays} ngày gần nhất`}
              danger={data.flaggedCount > 0}
            />
            <MetricCard
              label="Ngưỡng cảnh báo"
              value={`${data.cancelLimit} điểm`}
              description="Đạt hoặc vượt ngưỡng sẽ được tô đỏ"
            />
            <MetricCard
              label="Trọng số vi phạm nặng"
              value={`×${data.noShowWeight}`}
              description="Áp dụng cho hủy sát giờ và vắng mặt"
            />
          </div>

          <Alert className="rounded-2xl border-slate-200 bg-slate-50/70 p-4">
            <ShieldAlert />
            <AlertTitle>Công thức điểm vi phạm</AlertTitle>
            <AlertDescription>
              Hủy thường × 1; hủy sát giờ và vắng mặt × {data.noShowWeight}.
              Expert bị gắn cờ khi tổng điểm đạt {data.cancelLimit}.
            </AlertDescription>
          </Alert>

          <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="flex-row items-center justify-between border-b bg-slate-50/60">
              <CardTitle className="text-base">Chi tiết theo Expert</CardTitle>
              {isFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
              ) : null}
            </CardHeader>
            <CardContent className="p-0">
              {data.items.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                  <UserRoundX className="h-9 w-9 text-slate-300" />
                  <p className="font-semibold text-slate-800">
                    Chưa có dữ liệu Expert trong kỳ này
                  </p>
                  <p className="text-sm text-slate-500">
                    Hãy đổi khoảng thời gian hoặc bộ lọc phòng khám.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <CancellationTable
                      items={data.items}
                      showClinic={showClinic}
                      onExpertSelect={onExpertSelect}
                    />
                  </div>
                  <div className="space-y-3 p-4 md:hidden">
                    {data.items.map((item) => (
                      <CancellationMobileCard
                        key={item.expertId}
                        item={item}
                        showClinic={showClinic}
                        onSelect={() => onExpertSelect(item.expertId)}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  danger = false,
}: {
  label: string;
  value: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <Card
      className={cn("rounded-2xl", danger && "border-rose-200 bg-rose-50/50")}
    >
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={cn("mt-2 text-3xl font-bold", danger && "text-rose-700")}>
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function CancellationTable({
  items,
  showClinic,
  onExpertSelect,
}: {
  items: ExpertCancellationStatItem[];
  showClinic: boolean;
  onExpertSelect: (expertId: string) => void;
}) {
  return (
    <Table className="min-w-[980px] text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>Expert</TableHead>
          {showClinic ? <TableHead>Phòng khám</TableHead> : null}
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Ca được giao</TableHead>
          <TableHead className="text-right">Expert hủy</TableHead>
          <TableHead className="text-right">Hủy sát giờ</TableHead>
          <TableHead className="text-right">Vắng mặt</TableHead>
          <TableHead className="text-right">Điểm</TableHead>
          <TableHead className="text-right">Tỷ lệ hủy</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.expertId}
            tabIndex={0}
            className={cn(
              "cursor-pointer",
              item.exceedsLimit &&
                "bg-rose-50/80 hover:bg-rose-100/80 focus:bg-rose-100/80",
            )}
            onClick={() => onExpertSelect(item.expertId)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onExpertSelect(item.expertId);
              }
            }}
          >
            <TableCell className="font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1">
                {item.expertName || `Expert #${item.expertId.slice(0, 8)}`}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </TableCell>
            {showClinic ? (
              <TableCell>{item.clinicName || "Chưa gắn"}</TableCell>
            ) : null}
            <TableCell>
              <Badge variant={item.isActive ? "outline" : "secondary"}>
                {item.isActive ? "Đang hoạt động" : "Đã tạm khóa"}
              </Badge>
            </TableCell>
            <NumberCell value={item.assignedCount} />
            <NumberCell value={item.expertCancelCount} />
            <NumberCell value={item.lateCancelCount} />
            <NumberCell value={item.noShowCount} />
            <NumberCell
              value={item.violationScore}
              strong={item.exceedsLimit}
            />
            <TableCell className="text-right">
              <CancelRate value={item.cancelRate} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NumberCell({
  value,
  strong = false,
}: {
  value: number;
  strong?: boolean;
}) {
  return (
    <TableCell
      className={cn(
        "text-right tabular-nums",
        strong && "font-bold text-rose-700",
      )}
    >
      {value}
    </TableCell>
  );
}

function CancelRate({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400">—</span>;
  const label = `${(value * 100).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  })}%`;
  if (value <= 1) return <span className="tabular-nums">{label}</span>;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex cursor-help items-center gap-1 font-semibold text-rose-700" />
        }
      >
        {label} <AlertTriangle className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-center">
        Tỷ lệ có thể vượt 100% vì số ca Expert hủy trong kỳ được so với số ca
        được giao mới trong cùng kỳ.
      </TooltipContent>
    </Tooltip>
  );
}

function CancellationMobileCard({
  item,
  showClinic,
  onSelect,
}: {
  item: ExpertCancellationStatItem;
  showClinic: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-4 text-left",
        item.exceedsLimit
          ? "border-rose-200 bg-rose-50/70"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">
            {item.expertName || `Expert #${item.expertId.slice(0, 8)}`}
          </p>
          {showClinic ? (
            <p className="mt-0.5 text-xs text-slate-500">
              {item.clinicName || "Chưa gắn phòng khám"}
            </p>
          ) : null}
        </div>
        {item.exceedsLimit ? (
          <Badge variant="destructive">Vượt ngưỡng</Badge>
        ) : (
          <Badge variant="outline">Bình thường</Badge>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <MobileMetric label="Ca được giao" value={item.assignedCount} />
        <MobileMetric label="Expert hủy" value={item.expertCancelCount} />
        <MobileMetric label="Hủy sát giờ" value={item.lateCancelCount} />
        <MobileMetric label="Vắng mặt" value={item.noShowCount} />
        <MobileMetric label="Điểm vi phạm" value={item.violationScore} />
        <div>
          <dt className="text-slate-500">Tỷ lệ hủy</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            <CancelRate value={item.cancelRate} />
          </dd>
        </div>
      </dl>
    </button>
  );
}

function MobileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4" aria-label="Đang tải báo cáo">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  );
}
