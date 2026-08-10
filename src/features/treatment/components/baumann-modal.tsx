"use client";

import { useState, useMemo } from "react";
import { Dna, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  parseBaumannCode,
  type BaumannAxisKey,
  type BaumannCodeLetter,
} from "../lib/baumann";

interface BaumannModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string | null;
  scores?: {
    oilyDryScore?: number | null;
    sensitiveResistantScore?: number | null;
    pigmentedNonPigmentedScore?: number | null;
    wrinkledTightScore?: number | null;
  } | null;
  onSave?: (newCode: string) => void;
}

export function BaumannModal({
  isOpen,
  onClose,
  currentCode,
  scores,
  onSave,
}: BaumannModalProps) {
  const initialProfile = useMemo(
    () => parseBaumannCode(currentCode, scores),
    [currentCode, scores],
  );

  const [localLetters, setLocalLetters] = useState<{
    oil: BaumannCodeLetter;
    sensitivity: BaumannCodeLetter;
    pigment: BaumannCodeLetter;
    aging: BaumannCodeLetter;
  }>(() => ({
    oil: initialProfile.axes.oil.letter,
    sensitivity: initialProfile.axes.sensitivity.letter,
    pigment: initialProfile.axes.pigment.letter,
    aging: initialProfile.axes.aging.letter,
  }));

  const builtCode = `${localLetters.oil}${localLetters.sensitivity}${localLetters.pigment}${localLetters.aging}`;
  const parsedLocal = parseBaumannCode(builtCode, scores);

  const handleToggle = (key: BaumannAxisKey, val: BaumannCodeLetter) => {
    setLocalLetters((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(builtCode);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[32px] border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6b5cf6]/10 text-[#6b5cf6]">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-[#131336]">
                Chi Tiết Phân Loại Baumann (4 Trục)
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Lý thuyết Baumann 16 loại da chuẩn y khoa
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Current Code Banner */}
          <div className="rounded-3xl border border-[#6b5cf6]/20 bg-[#f6f4ff] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#6b5cf6] uppercase">
                  MÃ DA HIỆN TẠI
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-[#6b5cf6]">
                  {builtCode}
                </h3>
              </div>
              <div className="rounded-2xl bg-white px-4 py-2 font-bold text-[#131336] shadow-xs">
                {parsedLocal.title}
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {parsedLocal.description}
            </p>
          </div>

          {/* 4 Axis Interactive Selection */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              4 Trục Đặc Tính Da (Score Scale)
            </h4>

            {/* Axis 1: Oil vs Dry */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  1. Độ Tiết Dầu / Khô (O vs D)
                </span>
                <span className="text-[#6b5cf6]">
                  Điểm Backend:{" "}
                  {parsedLocal.axes.oil.score > 0
                    ? `+${parsedLocal.axes.oil.score}`
                    : parsedLocal.axes.oil.score}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggle("oil", "O")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.oil === "O"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Da Dầu (O)</span>
                  {localLetters.oil === "O" && <Check className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("oil", "D")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.oil === "D"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Da Khô (D)</span>
                  {localLetters.oil === "D" && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Axis 2: Sensitive vs Resistant */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  2. Nhạy Cảm / Bền (S vs R)
                </span>
                <span className="text-[#6b5cf6]">
                  Điểm Backend:{" "}
                  {parsedLocal.axes.sensitivity.score > 0
                    ? `+${parsedLocal.axes.sensitivity.score}`
                    : parsedLocal.axes.sensitivity.score}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggle("sensitivity", "S")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.sensitivity === "S"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Nhạy Cảm (S)</span>
                  {localLetters.sensitivity === "S" && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("sensitivity", "R")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.sensitivity === "R"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Da Bền/Khỏe (R)</span>
                  {localLetters.sensitivity === "R" && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Axis 3: Pigmented vs Non-pigmented */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">3. Sắc Tố Da (P vs N)</span>
                <span className="text-[#6b5cf6]">
                  Điểm Backend:{" "}
                  {parsedLocal.axes.pigment.score > 0
                    ? `+${parsedLocal.axes.pigment.score}`
                    : parsedLocal.axes.pigment.score}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggle("pigment", "P")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.pigment === "P"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Tăng Sắc Tố (P)</span>
                  {localLetters.pigment === "P" && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("pigment", "N")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.pigment === "N"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Đều Màu (N)</span>
                  {localLetters.pigment === "N" && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Axis 4: Wrinkled vs Tight */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">4. Lão Hóa (W vs T)</span>
                <span className="text-[#6b5cf6]">
                  Điểm Backend:{" "}
                  {parsedLocal.axes.aging.score > 0
                    ? `+${parsedLocal.axes.aging.score}`
                    : parsedLocal.axes.aging.score}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggle("aging", "W")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.aging === "W"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Có Nếp Nhăn (W)</span>
                  {localLetters.aging === "W" && <Check className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("aging", "T")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    localLetters.aging === "T"
                      ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>Căng Mịn (T)</span>
                  {localLetters.aging === "T" && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Đóng
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-[#6b5cf6] text-white hover:bg-[#5a4ae5]"
          >
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
