"use client";

import { Suspense } from "react";
import { TreatmentProvider } from "@/features/treatment/components/treatment-context";
import { TreatmentFlow } from "@/features/treatment/components/treatment-flow";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function TreatmentPage() {
  return (
    <TreatmentProvider>
      <div className="from-background via-secondary/10 to-background flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b p-4 sm:p-6">
        {/* Decorative Background Elements */}
        <div className="bg-primary/5 pointer-events-none absolute top-10 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 rounded-full opacity-40 blur-3xl filter" />

        {/* Header */}
        <div className="mb-6 flex w-full max-w-md items-center justify-between px-2 sm:max-w-lg md:max-w-2xl">
          <Link
            href="/"
            className="group flex items-center gap-1.5 select-none"
          >
            <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-md transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading text-foreground text-base font-bold tracking-tight">
              Glow<span className="text-primary">Scan</span>
            </span>
          </Link>
          <span className="text-muted-foreground bg-secondary/60 border-border/40 rounded border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
            Phác đồ điều trị
          </span>
        </div>

        {/* Main frame */}
        <main className="surface-glass relative flex min-h-[580px] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-2 shadow-2xl backdrop-blur-md sm:max-w-lg md:max-w-5xl">
          <Suspense
            fallback={
              <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                Đang chuẩn bị khảo sát...
              </div>
            }
          >
            <TreatmentFlow />
          </Suspense>
        </main>

        {/* Disclaimer */}
        <footer className="text-muted-foreground/80 mt-6 w-full max-w-xs px-4 text-center text-[10px] leading-relaxed">
          * Khảo sát & quy trình chăm sóc da này được tự động hóa bởi thuật toán
          AI GlowScan dựa trên lý thuyết Baumann. Vui lòng tham khảo ý kiến
          chuyên gia da liễu trước khi bắt đầu bất kỳ quy trình chăm sóc da
          chuyên sâu nào.
        </footer>
      </div>
    </TreatmentProvider>
  );
}
