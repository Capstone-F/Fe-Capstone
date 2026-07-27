"use client";

import {
  Calendar,
  Clock,
  Construction,
  CalendarDays,
  Bell,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// Mock visual slots — chờ BE bổ sung endpoint /experts/me/schedule
const MOCK_VISUAL: Record<
  string,
  Record<string, "booked" | "available" | "off">
> = {
  T2: {
    "08:00": "booked",
    "09:00": "booked",
    "10:00": "available",
    "14:00": "available",
    "15:00": "booked",
  },
  T3: {
    "08:00": "available",
    "09:00": "booked",
    "15:00": "available",
    "16:00": "available",
  },
  T4: { "10:00": "booked", "11:00": "booked", "14:00": "available" },
  T5: {
    "08:00": "available",
    "09:00": "available",
    "10:00": "booked",
    "15:00": "available",
  },
  T6: {
    "14:00": "booked",
    "15:00": "booked",
    "16:00": "available",
    "17:00": "available",
  },
  T7: {},
  CN: {},
};

export default function ExpertSchedulePage() {
  const today = new Date();
  const weekLabel = `Tuần ${today.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Lịch Khám & Slot Tư Vấn
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Xem toàn bộ lịch hẹn và slot rảnh trong tuần của bạn.
          </p>
        </div>

        {/* Coming Soon Banner */}
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 self-start rounded-xl border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
        >
          <Construction className="h-3.5 w-3.5" />
          Chờ Backend cập nhật endpoint
        </Badge>
      </div>

      {/* Notice Card */}
      <Card className="border-amber-100 bg-amber-50/60 shadow-xs">
        <CardContent className="flex items-start gap-3 p-4">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-amber-800">
              Tính năng đang hoàn thiện
            </p>
            <p className="text-xs text-amber-700">
              Màn hình này đang chờ endpoint{" "}
              <code className="rounded bg-amber-100 px-1 font-mono">
                GET /experts/me/schedule
              </code>{" "}
              từ Backend. Dữ liệu hiển thị bên dưới chỉ là minh hoạ giao diện.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-600">Chú thích:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
          Slot trống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-slate-300" />
          Đã đặt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-slate-200 bg-slate-100" />
          Nghỉ / Không có lịch
        </span>
      </div>

      {/* Week label */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Calendar className="h-4 w-4 text-slate-400" />
        {weekLabel}
        <span className="font-normal text-slate-400">— Lịch minh hoạ</span>
      </div>

      {/* Grid Calendar */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-20 p-3 text-left font-semibold text-slate-500">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                Giờ
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="p-3 text-center font-semibold text-slate-700"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour, hi) => (
              <tr
                key={hour}
                className={hi % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="border-b border-slate-100 p-3 font-mono font-semibold text-slate-500">
                  {hour}
                </td>
                {DAYS.map((d) => {
                  const slotState = MOCK_VISUAL[d]?.[hour];
                  return (
                    <td
                      key={d}
                      className="border-b border-slate-100 p-2 text-center"
                    >
                      {slotState === "available" ? (
                        <span className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          Trống
                        </span>
                      ) : slotState === "booked" ? (
                        <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                          Đã đặt
                        </span>
                      ) : (
                        <span className="text-slate-200">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Slot trống tuần này",
            value: "12",
            color: "text-emerald-700 bg-emerald-50 border-emerald-100",
          },
          {
            label: "Đã đặt",
            value: "8",
            color: "text-slate-700 bg-slate-50 border-slate-200",
          },
          {
            label: "Hoàn thành",
            value: "3",
            color: "text-blue-700 bg-blue-50 border-blue-100",
          },
          {
            label: "Đã hủy",
            value: "1",
            color: "text-rose-700 bg-rose-50 border-rose-100",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
