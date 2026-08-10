"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, Activity, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  const [scanY, setScanY] = useState("0%");

  // Cycle the scanning line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanY((prev) => (prev === "0%" ? "100%" : "0%"));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Content */}
          <div className="space-y-6 text-left lg:col-span-7">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>Nền tảng Beauty-Tech tiên phong tích hợp AI</span>
            </div>
            <h1 className="font-heading text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Thấu hiểu làn da.
              <br />
              <span className="text-primary from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-transparent">
                Liệu trình khoa học
              </span>{" "}
              cùng AI.
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
              Không còn thử nghiệm sai lầm. GlowScan kết hợp khảo sát y khoa
              Baumann và phân tích ảnh quét da AI để gợi ý hoạt chất cá nhân
              hóa, đồng hành cùng đội ngũ chuyên gia da liễu hàng đầu.
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <a href="/scan" className="w-full sm:w-auto">
                <Button className="shadow-primary/25 hover:shadow-primary/35 w-full rounded-xl px-8 py-6 text-base font-bold shadow-lg transition-all duration-300">
                  Bắt đầu soi da miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-border/80 hover:bg-secondary/40 w-full rounded-xl px-8 py-6 text-base font-semibold"
                >
                  Khám phá sản phẩm
                </Button>
              </a>
            </div>

            {/* Badges */}
            <div className="border-border/50 grid max-w-md grid-cols-3 gap-4 border-t pt-6">
              <div className="flex flex-col">
                <span className="font-heading text-foreground text-2xl font-bold">
                  16
                </span>
                <span className="text-muted-foreground text-xs">
                  Loại da Baumann
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-foreground text-2xl font-bold">
                  95%
                </span>
                <span className="text-muted-foreground text-xs">
                  Khách hàng hài lòng
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-foreground text-2xl font-bold">
                  50+
                </span>
                <span className="text-muted-foreground text-xs">
                  Đối tác chăm sóc da
                </span>
              </div>
            </div>
          </div>

          {/* Right Graphics (Interactive AI Mockup) */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="bg-primary/10 absolute inset-0 -z-10 rounded-full opacity-50 blur-3xl filter" />

            {/* Main Phone Simulation */}
            <div className="relative flex h-[580px] w-[300px] flex-col overflow-hidden rounded-[40px] border-4 border-neutral-800 bg-neutral-900 p-3 shadow-2xl">
              {/* Speaker/Camera notch */}
              <div className="absolute top-0 left-1/2 z-20 flex h-6 w-32 -translate-x-1/2 items-center justify-center rounded-b-2xl bg-neutral-800">
                <div className="h-1 w-12 rounded-full bg-neutral-900" />
              </div>

              {/* Inner screen content */}
              <div className="bg-background relative flex flex-1 flex-col overflow-hidden rounded-[32px] px-4 pt-8 pb-4">
                {/* Scanning area container */}
                <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-neutral-950 shadow-inner">
                  {/* Simulated Camera Face Silhouette */}
                  <svg
                    className="text-muted-foreground/20 h-full w-full opacity-90"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 25C38 25 32 35 32 45C32 55 35 68 50 78C65 68 68 55 68 45C68 35 62 25 50 25Z"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <path
                      d="M50 15C25 15 20 30 20 45C20 65 35 85 50 90C65 85 80 65 80 45C80 30 75 15 50 15Z"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                    {/* Bounding box mock highlights */}
                    <circle
                      cx="42"
                      cy="40"
                      r="3"
                      fill="#ef4444"
                      className="animate-pulse"
                    />
                    <circle
                      cx="58"
                      cy="48"
                      r="4"
                      fill="#f59e0b"
                      className="animate-pulse"
                    />
                    <circle
                      cx="48"
                      cy="62"
                      r="2.5"
                      fill="#10b981"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Animated Scanning Beam */}
                  <div
                    className="via-primary absolute left-0 h-0.5 w-full bg-gradient-to-r from-transparent to-transparent shadow-[0_0_8px_rgba(var(--primary),0.8)] transition-all duration-[2500ms] ease-in-out"
                    style={{ top: scanY }}
                  />

                  {/* Tag Overlays */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>Mụn viêm nhẹ (92%)</span>
                  </div>
                  <div className="absolute top-16 right-4 flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    <span>Lỗ chân lông vùng T (86%)</span>
                  </div>
                </div>

                {/* Recommendations preview */}
                <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
                  <div>
                    <span className="text-primary text-[10px] font-bold tracking-wider uppercase">
                      Phân tích kết quả
                    </span>
                    <h4 className="text-foreground font-heading mt-0.5 text-sm font-bold">
                      Mã loại da: OSPW (Dầu-Nhạy cảm)
                    </h4>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-normal">
                      Tuyến bã nhờn hoạt động quá mức kết hợp với hiện tượng
                      kích ứng nhẹ đỏ da vùng má.
                    </p>
                  </div>

                  {/* Miniature Skincare Routine recommendation cards */}
                  <div className="space-y-1.5">
                    <div className="bg-secondary/40 border-border/30 flex items-center justify-between rounded-xl border p-2 text-[11px]">
                      <span className="font-semibold">
                        B1: Làm Sạch (Sáng/Tối)
                      </span>
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold">
                        Rau má 2%
                      </span>
                    </div>
                    <div className="bg-secondary/40 border-border/30 flex items-center justify-between rounded-xl border p-2 text-[11px]">
                      <span className="font-semibold">B2: Đặc Trị (Tối)</span>
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold">
                        Niacinamide 10%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Widget 1 */}
            <div className="border-border/50 absolute top-20 -left-10 hidden max-w-[200px] animate-bounce items-center gap-3 rounded-2xl border bg-white/90 p-3 shadow-xl backdrop-blur duration-[3000ms] sm:flex">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">100% Bảo mật</h4>
                <p className="text-muted-foreground text-[10px]">
                  Mã hóa ảnh soi da & hồ sơ sức khỏe
                </p>
              </div>
            </div>

            {/* Floating Widget 2 */}
            <div className="border-border/50 absolute -right-12 bottom-16 hidden max-w-[200px] items-center gap-3 rounded-2xl border bg-white/90 p-3 shadow-xl backdrop-blur sm:flex">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Độ ẩm: 34% (Khô)</h4>
                <p className="text-muted-foreground text-[10px]">
                  Ước tính thông qua khảo sát cá nhân
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
