"use client";

import { Award } from "lucide-react";
import type { BaumannResultView } from "../types/skin-quiz.types";

interface BaumannResultCardProps {
  result: BaumannResultView;
}

function formatAssessedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function BaumannResultCard({ result }: BaumannResultCardProps) {
  const assessedAt = formatAssessedAt(result.assessedAt);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Award className="h-7 w-7" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
            Loại da Baumann của bạn
          </span>
          <span className="text-2xl font-black text-emerald-700">
            {result.code}
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {result.name}
          </span>
          {result.description && (
            <p className="text-xs leading-relaxed text-slate-600">
              {result.description}
            </p>
          )}
          {assessedAt && (
            <span className="text-[11px] text-slate-500">
              Đánh giá ngày {assessedAt}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {result.axes.map((axis) => (
          <div key={axis.id} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-800">{axis.title}</h3>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span
                className={
                  axis.activeLetter === axis.leftLetter
                    ? "text-emerald-700"
                    : "text-slate-400"
                }
              >
                {axis.leftLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {axis.strength}
              </span>
              <span
                className={
                  axis.activeLetter === axis.rightLetter
                    ? "text-emerald-700"
                    : "text-slate-400"
                }
              >
                {axis.rightLabel}
              </span>
            </div>

            <div className="relative h-2 rounded-full bg-slate-100">
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-600 shadow"
                style={{ left: `${axis.position}%` }}
              />
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              {axis.activeDescription}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
