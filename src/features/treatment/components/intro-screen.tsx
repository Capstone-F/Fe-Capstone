"use client";

import { ArrowLeft, Sparkles, User, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import { useTreatment } from "@/features/treatment/components/treatment-context";

export function IntroScreen() {
  const { setFlowState } = useTreatment();
  const router = useRouter();

  return (
    <div className="animate-in fade-in flex flex-1 flex-col justify-center px-4 py-8 duration-500">
      <div className="mb-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="hover:bg-black/5 h-10 w-10 shrink-0 rounded-full text-[#131336]"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="mx-auto max-w-xl space-y-12 text-center mt-8">
        <div className="space-y-6">
          <h1 className="font-heading text-[2.5rem] leading-tight font-bold tracking-tight text-[#131336] sm:text-5xl">
            Nhận công thức cá nhân hóa từ chuyên gia AI GlowScan
          </h1>
          <p className="mx-auto max-w-md text-lg text-[#131336]/70">
            Đầu tiên, hãy cho chúng tôi biết về tình trạng da của bạn.
          </p>
        </div>

        <div className="pt-8">
          <Button
            onClick={() => setFlowState("survey")}
            className="group relative h-14 w-full rounded-[100px] bg-[#6b5cf6] px-8 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-[#5a4ae5] active:scale-[0.98] sm:w-auto sm:min-w-[300px]"
          >
            <span>Bắt Đầu Khảo Sát</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

