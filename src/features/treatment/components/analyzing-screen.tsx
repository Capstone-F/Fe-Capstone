"use client";

import { useEffect, useState } from "react";
import { useTreatment } from "../context/treatment-context";
import { Cpu, Sparkles } from "lucide-react";

export function AnalyzingScreen() {
  const { state, setFlowState } = useTreatment();
  const [dots, setDots] = useState("");
  const [subText, setSubText] = useState("Đang xử lý kết quả khảo sát...");

  const isPhotoUploaded =
    state.surveyAnswers.photoUploaded && state.surveyAnswers.photoFile;

  useEffect(() => {
    // Dot animation
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    // Text updates based on whether photo is uploaded or not
    const t1 = setTimeout(() => {
      setSubText(
        isPhotoUploaded
          ? "AI đang định vị các điểm mụn & thâm sạm..."
          : "Thuật toán AI đang quét dữ liệu da Baumann...",
      );
    }, 800);

    const t2 = setTimeout(() => {
      setSubText(
        isPhotoUploaded
          ? "Tính toán kích thước lỗ chân lông bề mặt..."
          : "Thiết lập hoạt chất và nồng độ tối ưu...",
      );
    }, 1600);

    // Flow transition
    const flowTimeout = setTimeout(() => {
      setFlowState("report");
    }, 2800);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(flowTimeout);
    };
  }, [setFlowState, isPhotoUploaded]);

  return (
    <div className="animate-in fade-in flex flex-1 flex-col items-center justify-center px-6 text-center duration-500">
      <div className="w-full max-w-sm space-y-6">
        {/* Dynamic Scan Area */}
        {isPhotoUploaded ? (
          <div className="border-primary relative mx-auto h-40 w-40 overflow-hidden rounded-3xl border-2 bg-black shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.surveyAnswers.photoFile!}
              alt="AI Skin Analysis"
              className="h-full w-full object-cover opacity-80"
            />
            {/* Hologram / Laser Scan Line */}
            <div className="via-primary absolute right-0 left-0 h-1 animate-[scan_2s_infinite] bg-gradient-to-r from-transparent to-transparent shadow-[0_0_8px_oklch(var(--primary))]" />

            {/* Floating scanner effect */}
            <div className="bg-primary/5 pointer-events-none absolute inset-0 animate-pulse" />
            <div className="bg-primary/20 text-primary absolute top-2 right-2 animate-ping rounded-lg p-1">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
        ) : (
          /* Loading Circle & Logo */
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            {/* Animated rings */}
            <div className="border-primary/20 border-t-primary absolute inset-0 animate-spin rounded-full border-4" />
            <div className="border-primary/40 absolute inset-2 animate-spin rounded-full border border-dashed [animation-duration:5s]" />
            {/* Center Icon */}
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
              <Cpu className="h-8 w-8 animate-pulse" />
            </div>
          </div>
        )}

        {/* Text descriptions */}
        <div className="space-y-2">
          <h3 className="font-heading text-foreground text-xl font-extrabold tracking-tight">
            {isPhotoUploaded
              ? "AI Đang Quét & Phân Tích Da"
              : "Đang Phân Tích Da"}
            {dots}
          </h3>
          <p className="text-primary min-h-[16px] text-xs font-semibold transition-all duration-300">
            {subText}
          </p>
          <p className="text-muted-foreground text-[10px] leading-relaxed">
            Hệ thống AI đang tổng hợp các câu trả lời của bạn để xây dựng một
            báo cáo da y khoa và phác đồ điều trị chuyên biệt.
          </p>
        </div>

        {/* Floating status checks */}
        <div className="text-muted-foreground flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/30 p-4 text-left text-[10px] shadow-inner backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            <span>Tải thông tin người dùng từ Keycloak thành công</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            <span>Kết nối ổn định với Docker backend</span>
          </div>
          {isPhotoUploaded && (
            <div className="flex items-center gap-2">
              <div className="bg-primary h-1.5 w-1.5 animate-ping rounded-full" />
              <span>Đang tính toán ma trận độ sâu khuyết điểm da</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic scan keyframes style block */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
      `}</style>
    </div>
  );
}
