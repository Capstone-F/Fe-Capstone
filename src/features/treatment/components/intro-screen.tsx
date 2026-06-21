"use client";

import { Sparkles, User, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTreatment } from "../context/treatment-context";

export function IntroScreen() {
  const { setFlowState } = useTreatment();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col justify-center px-4 duration-500">
      <div className="space-y-6 py-6 text-center">
        {/* Brand Icon */}
        <div className="bg-primary/10 text-primary relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
          <Sparkles className="h-8 w-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 animate-ping rounded-full bg-emerald-500" />
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
        </div>

        {/* Text info */}
        <div className="space-y-2">
          <h2 className="font-heading text-foreground text-2xl font-extrabold tracking-tight">
            Khảo Sát Liệu Trình Mới
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
            Hệ thống AI GlowScan sẽ cá nhân hóa chu trình dựa trên loại da
            Baumann và hồ sơ sức khỏe cá nhân của bạn.
          </p>
        </div>

        {/* Base Profile Confirmation Card (Premium Design) */}
        <div className="relative mx-auto w-full max-w-sm space-y-4 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 text-left shadow-sm backdrop-blur-md">
          <div className="bg-primary/5 pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-xl" />

          <div className="border-border/40 flex items-center gap-2 border-b pb-2.5">
            <User className="text-primary h-4.5 w-4.5" />
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Hồ Sơ Cá Nhân Cơ Bản (Base Profile)
            </h4>
          </div>

          <div className="text-muted-foreground space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">Họ và tên:</span>
              <span className="text-foreground font-bold">
                Đặng Nguyễn Gia Bảo
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Độ tuổi & Giới tính:</span>
              <span className="text-foreground font-bold">28 tuổi • Nam</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="shrink-0 font-medium">Khu vực sinh sống:</span>
              <span className="text-foreground flex items-center gap-1 text-right font-bold">
                <MapPin className="inline h-3 w-3 text-red-500" />
                TP. Hồ Chí Minh{" "}
                <span className="text-muted-foreground text-[10px] font-normal">
                  (Nhiệt đới ẩm)
                </span>
              </span>
            </div>

            <div className="bg-border/40 my-1 h-[1px]" />

            <div className="flex items-center justify-between">
              <span className="font-medium">Dị ứng đã biết:</span>
              <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                Không có
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Nhạy cảm với cồn:</span>
              <span className="rounded border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                Nhạy cảm nhẹ
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="shrink-0 font-medium">Kích ứng trước đó:</span>
              <span className="text-destructive bg-destructive/5 border-destructive/10 rounded border px-2 py-0.5 text-right text-[10px] font-bold">
                Tretinoin (bong tróc nhẹ)
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-[10px] leading-relaxed text-blue-700">
            <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-blue-500" />
            <span>
              Hãy xác nhận thông tin trên là chính xác. Hệ thống AI sẽ tích hợp
              các dữ liệu lâm sàng này vào chẩn đoán da.
            </span>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Button
            onClick={() => setFlowState("survey")}
            className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 group flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
          >
            <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
            Xác Nhận & Bắt Đầu Khảo Sát
          </Button>
        </div>
      </div>
    </div>
  );
}
