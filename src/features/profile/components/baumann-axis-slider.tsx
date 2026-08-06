"use client";

import { Slider } from "@base-ui/react/slider";

import {
  AXIS_SCORE_MAX,
  AXIS_SCORE_MIN,
  AXIS_SCORE_STEP,
} from "../lib/baumann";

/** Position of a score on the track: 0 = far left pole, 100 = far right pole. */
export function toTrackPercent(score: number): number {
  return ((score - AXIS_SCORE_MIN) / (AXIS_SCORE_MAX - AXIS_SCORE_MIN)) * 100;
}

/** The filled segment always grows out of the neutral centre, never the left edge. */
export function toCentreFill(score: number): { left: number; width: number } {
  const percent = toTrackPercent(score);
  return { left: Math.min(50, percent), width: Math.abs(percent - 50) };
}

interface BaumannAxisSliderProps {
  value: number;
  label: string;
  onChange: (value: number) => void;
}

export function BaumannAxisSlider({
  value,
  label,
  onChange,
}: BaumannAxisSliderProps) {
  const fill = toCentreFill(value);

  return (
    <Slider.Root
      value={value}
      min={AXIS_SCORE_MIN}
      max={AXIS_SCORE_MAX}
      step={AXIS_SCORE_STEP}
      onValueChange={(next) =>
        onChange(typeof next === "number" ? next : next[0])
      }
    >
      <Slider.Control className="flex w-full touch-none items-center py-2 select-none">
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-slate-200">
          <span
            className="absolute inset-y-0 rounded-full bg-emerald-500"
            style={{ left: `${fill.left}%`, width: `${fill.width}%` }}
          />
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-400" />
          <Slider.Thumb
            aria-label={label}
            className="size-4 rounded-full border-2 border-emerald-600 bg-white shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-emerald-500/40"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
