"use client";

import { ArrowLeft, CheckCircle2, LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "@/features/treatment/components/treatment-context";

export function SuccessScreen() {
  const { setFlowState } = useTreatment();
  const router = useRouter();

  return (
    <div className="animate-in fade-in zoom-in-95 flex flex-1 flex-col justify-center px-4 text-center duration-500">
      <div className="mb-2 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFlowState("purchase")}
          className="border-border/40 hover:bg-secondary/40 h-8 w-8 shrink-0 rounded-xl border"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Button>
      </div>
      <div className="mx-auto max-w-sm space-y-8 py-8 sm:max-w-md md:max-w-xl">
        {/* Animated Check circle */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 shadow-inner">
          <CheckCircle2 className="h-14 w-14 animate-bounce" />
          <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-emerald-300 [animation-duration:8s]" />
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <h3 className="font-heading text-foreground text-3xl font-extrabold tracking-tight">
            Kích Hoạt Thành Công!
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Quy trình chăm sóc da cá nhân hóa của bạn đã được lưu trữ vào tài
            khoản GlowScan. Bảng điều khiển theo dõi hàng ngày đã sẵn sàng hoạt
            động.
          </p>
        </div>

        {/* Info card box */}
        <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-left text-xs text-emerald-800 shadow-sm backdrop-blur">
          <p className="text-center font-bold">💡 Lưu ý quan trọng:</p>
          <ul className="list-disc space-y-1 pl-4 text-emerald-700/90">
            <li>Hãy nhớ ghi nhận kết quả chăm sóc da Sáng & Tối hàng ngày.</li>
            <li>Sử dụng đúng thứ tự đề xuất để tối ưu hiệu quả hoạt chất.</li>
            <li>
              Chụp ảnh quét lại da sau 2 tuần để AI so sánh tiến độ hồi phục.
            </li>
          </ul>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Button
            onClick={() => router.push("/profile")}
            className="shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/95 group flex w-full items-center justify-center gap-2 rounded-2xl py-6 text-base font-bold text-white shadow-lg transition-all duration-300"
          >
            <LayoutDashboard className="h-5 w-5 transition-transform group-hover:scale-110" />
            Đi Đến Bảng Theo Dõi
          </Button>
        </div>
      </div>
    </div>
  );
}
