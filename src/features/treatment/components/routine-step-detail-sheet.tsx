"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Package,
  Shield,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
export interface RoutineStepDetailInfo {
  id: string;
  routineId: string;
  order: number;
  period: "MORNING" | "EVENING" | "BOTH";
  stepName: string;
  productName?: string;
  brandName?: string;
  productImageUrl?: string | null;
  usageInstructions?: string;
  activeIngredients?: string[];
  productId?: string | null;
}

interface RoutineStepDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  step: RoutineStepDetailInfo | null;
}

export function RoutineStepDetailSheet({
  isOpen,
  onClose,
  step,
}: RoutineStepDetailSheetProps) {
  if (!step) return null;

  const isMorning = step.period === "MORNING" || step.period === "BOTH";
  const isEvening = step.period === "EVENING" || step.period === "BOTH";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Bước {step.order}
            </span>
            <div className="flex items-center gap-1">
              {isMorning && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                  <Sun className="h-3 w-3" /> Buổi sáng
                </span>
              )}
              {isEvening && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600">
                  <Moon className="h-3 w-3" /> Buổi tối
                </span>
              )}
            </div>
          </div>
          <SheetTitle className="text-lg font-bold text-slate-900">
            {step.stepName}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Hướng dẫn chi tiết sử dụng chuẩn y khoa theo phác đồ Bác sĩ.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-5">
          {/* Product card overview */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-2 shadow-2xs">
              {step.productImageUrl ? (
                <Image
                  src={step.productImageUrl}
                  alt={step.productName || step.stepName}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Package className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Sản phẩm chỉ định
              </span>
              <span className="text-sm font-bold text-slate-900">
                {step.productName || "Sản phẩm skincare theo phác đồ"}
              </span>
              {step.brandName && (
                <span className="text-xs font-semibold text-slate-500">
                  Thương hiệu: {step.brandName}
                </span>
              )}
            </div>
          </div>

          {/* Guidelines & Dosage */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase">
              <Droplet className="h-4 w-4 text-amber-500" />
              Liều lượng & Cách thoa
            </h4>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs text-slate-700">
              {step.usageInstructions ||
                "Thoa một lượng nhỏ bằng hạt đậu ván đều khắp mặt. Vỗ nhẹ để dưỡng chất thẩm thấu hoàn toàn."}
            </div>
          </div>

          {/* Active Ingredients if available */}
          {step.activeIngredients && step.activeIngredients.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Thành phần hoạt chất nổi bật
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {step.activeIngredients.map((ing: string) => (
                  <span
                    key={ing}
                    className="rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety Warning & Notes */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase">
              <Shield className="h-4 w-4 text-emerald-500" />
              Lưu ý an toàn từ Bác sĩ
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Rửa sạch và lau khô da mặt trước khi thực hiện bước này.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>Nên chờ 2-3 phút giữa các bước để da kịp hấp thụ.</span>
              </div>
              {isMorning && (
                <div className="flex items-start gap-2 text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    Bắt buộc sử dụng kem chống nắng phổ rộng SPF 30+ trở lên vào
                    buổi sáng.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          {step.productId && (
            <div className="pt-2">
              <Link href={`/products/${step.productId}`} className="w-full">
                <Button className="w-full rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600">
                  Đặt Mua Thêm Sản Phẩm Này
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
