"use client";

import { useMemo, useState } from "react";
import { Calendar, Flame, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  DAY_STATUS_DOT_CLASS,
  DAY_STATUS_LABELS,
} from "../constants/routine-tracking";
import { useRoutineHistory } from "../hooks/useRoutineTracking";
import { buildCalendarWeeks, buildRangeEndingAt } from "../lib/routine-history";
import type { DayHistoryStatus } from "../types/routine-tracking.types";
import { HistoryDayDialog } from "./history-day-dialog";

const HISTORY_WINDOW_DAYS = 30;
const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const LEGEND_STATUSES: DayHistoryStatus[] = [
  "COMPLETED",
  "PARTIAL",
  "MISSED",
  "NOT_STARTED",
];

interface RoutineHistoryPanelProps {
  routineId: string;
  /** Server VN calendar date from GET /routines/me/today. */
  today: string;
}

export function RoutineHistoryPanel({
  routineId,
  today,
}: RoutineHistoryPanelProps) {
  const range = useMemo(
    () => buildRangeEndingAt(today, HISTORY_WINDOW_DAYS),
    [today],
  );
  const { data, isLoading, isError } = useRoutineHistory(routineId, range);
  const weeks = useMemo(
    () => buildCalendarWeeks(data?.days ?? []),
    [data?.days],
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <Card className="border-slate-200 shadow-2xs">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Calendar className="h-4.5 w-4.5 text-[#6b5cf6]" />
          Lịch Sử Tuân Thủ 30 Ngày
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {isError && (
          <p className="py-4 text-center text-xs text-slate-500">
            Không tải được lịch sử chăm sóc. Vui lòng thử lại.
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <Flame className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {data.summary.currentStreak}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    Ngày liên tiếp hoàn thành
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {data.summary.averageCompletionRate}%
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    Tỷ lệ hoàn thành trung bình
                  </div>
                </div>
              </div>
            </div>

            {weeks.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                Chưa có dữ liệu tuân thủ trong 30 ngày gần đây.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="text-center text-[10px] font-bold text-slate-400"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                {weeks.map((week, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className="grid grid-cols-7 gap-1.5"
                  >
                    {week.map((day, dayIndex) =>
                      day ? (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedDate(day.date)}
                          title={`${day.date} — ${DAY_STATUS_LABELS[day.status]} (${day.completionRate}%)`}
                          className={`flex h-9 items-center justify-center rounded-lg text-[11px] font-bold transition-opacity hover:opacity-80 ${DAY_STATUS_DOT_CLASS[day.status]}`}
                        >
                          {Number(day.date.slice(8, 10))}
                        </button>
                      ) : (
                        <div
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="h-9 rounded-lg bg-transparent"
                        />
                      ),
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-3">
              {LEGEND_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span
                    className={`h-3 w-3 rounded ${DAY_STATUS_DOT_CLASS[status]}`}
                  />
                  <span className="text-[10px] font-semibold text-slate-500">
                    {DAY_STATUS_LABELS[status]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <HistoryDayDialog
          routineId={routineId}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      </CardContent>
    </Card>
  );
}
