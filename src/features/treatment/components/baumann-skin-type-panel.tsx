"use client";

import { useState } from "react";
import { Info, Loader2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/core/api/errors";
import { Button } from "@/shared/components/ui/button";
// The Baumann type is stored on /profile/me, so the write stays owned by the
// profile feature even though the screen now lives under /care.
import { useUpdateSkinType } from "@/features/profile/hooks/useProfile";
import {
  BAUMANN_AXES,
  axisLetter,
  buildBaumannCode,
  toAxisScores,
  toSkinTypePayload,
  toStrengthPercent,
  type BaumannAxis,
  type BaumannAxisScores,
} from "../lib/baumann-axes";
import type { UserProfile } from "@/features/profile/types/profile.types";
import {
  BaumannAxisSlider,
  toCentreFill,
  toTrackPercent,
} from "./baumann-axis-slider";

interface BaumannSkinTypePanelProps {
  profile: UserProfile;
}

function formatAssessedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PoleLabels({ axis, letter }: { axis: BaumannAxis; letter: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] font-semibold">
      <span
        className={
          letter === axis.negativeLetter ? "text-emerald-700" : "text-slate-400"
        }
      >
        {axis.negativeLabel}
      </span>
      <span
        className={
          letter === axis.positiveLetter ? "text-emerald-700" : "text-slate-400"
        }
      >
        {axis.positiveLabel}
      </span>
    </div>
  );
}

/** Static version of the axis track, used while the panel is not being edited. */
function AxisReadOnlyTrack({ score }: { score: number }) {
  const fill = toCentreFill(score);

  return (
    <div className="relative h-1.5 w-full rounded-full bg-slate-200">
      <span
        className="absolute inset-y-0 rounded-full bg-emerald-500"
        style={{ left: `${fill.left}%`, width: `${fill.width}%` }}
      />
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-400" />
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-600 bg-white"
        style={{ left: `${toTrackPercent(score)}%` }}
      />
    </div>
  );
}

export function BaumannSkinTypePanel({ profile }: BaumannSkinTypePanelProps) {
  const savedCode = profile.skinType?.code ?? null;
  const savedScores = toAxisScores(profile.skinType, profile.baumannScores);
  const assessedAt = formatAssessedAt(profile.baumannScores?.assessedAt);

  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState<BaumannAxisScores>(() => savedScores);
  const updateSkinType = useUpdateSkinType();

  const shownScores = isEditing ? scores : savedScores;
  const draftCode = buildBaumannCode(scores);
  const isChanged =
    draftCode !== savedCode ||
    BAUMANN_AXES.some((axis) => scores[axis.id] !== savedScores[axis.id]);

  const startEditing = () => {
    // Re-seed from the profile so an edit never starts from a stale draft.
    setScores(savedScores);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateSkinType.mutateAsync(toSkinTypePayload(scores));
      toast.success(`Đã lưu loại da ${draftCode}.`);
      setIsEditing(false);
    } catch (error) {
      // Keep the full error reachable: the Vietnamese copy alone leaves nothing to debug.
      console.error("Failed to save Baumann skin type", error);
      const status = error instanceof ApiError ? error.status : undefined;
      toast.error(
        status
          ? `Không thể lưu loại da (lỗi ${status}). Vui lòng thử lại.`
          : "Không thể lưu loại da. Vui lòng kiểm tra kết nối và thử lại.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div>
          <span className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase">
            {isEditing ? "Loại da đang lưu" : "Loại da của bạn"}
          </span>
          <span className="text-xl font-black tracking-widest text-emerald-700">
            {savedCode ?? "Chưa xác định"}
          </span>
          {profile.skinType?.name && (
            <span className="mt-0.5 block text-xs text-slate-600">
              {profile.skinType.name}
            </span>
          )}
          {assessedAt && (
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Cập nhật lần cuối: {assessedAt}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="text-right">
            <span className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase">
              Lựa chọn mới
            </span>
            <span className="text-xl font-black tracking-widest text-slate-900">
              {draftCode}
            </span>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={startEditing}
            className="rounded-xl border-slate-300 px-5 text-xs font-bold text-slate-700 hover:bg-white"
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            {savedCode ? "Chỉnh sửa" : "Xác định loại da"}
          </Button>
        )}
      </div>

      {/* Completing a survey re-derives the type on the backend and overwrites this. */}
      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
        <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
        Hồ sơ da của bạn có thể thay đổi theo kết quả điều trị và khảo sát.
      </p>

      <div className="flex flex-col gap-4">
        {BAUMANN_AXES.map((axis) => {
          const score = shownScores[axis.id];
          const letter = axisLetter(axis, score);

          return (
            <div
              key={axis.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  {axis.title}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">
                  {letter} · {toStrengthPercent(score)}%
                </span>
              </div>

              {isEditing && (
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {axis.hint}
                </p>
              )}

              {isEditing ? (
                <BaumannAxisSlider
                  value={score}
                  label={axis.title}
                  onChange={(next) =>
                    setScores((prev) => ({ ...prev, [axis.id]: next }))
                  }
                />
              ) : (
                <div className="py-2">
                  <AxisReadOnlyTrack score={score} />
                </div>
              )}

              <PoleLabels axis={axis} letter={letter} />
            </div>
          );
        })}
      </div>

      {isEditing && (
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isChanged || updateSkinType.isPending}
            className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
          >
            {updateSkinType.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Lưu loại da {draftCode}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={updateSkinType.isPending}
            onClick={() => setIsEditing(false)}
            className="rounded-xl px-4 text-xs font-semibold text-slate-500"
          >
            <X className="mr-1.5 h-4 w-4" />
            Huỷ
          </Button>
          {!isChanged && savedCode && (
            <span className="text-[11px] text-slate-500">
              Chưa có thay đổi nào để lưu.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
