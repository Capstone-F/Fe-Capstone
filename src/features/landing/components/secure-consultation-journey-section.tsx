"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UserRoundSearch,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";

const JOURNEY_STEPS = [
  {
    icon: LockKeyhole,
    number: "01",
    title: "Đăng nhập bảo mật",
    description:
      "Xác thực tài khoản trước khi truy cập mạng lưới chuyên gia và thông tin phòng khám.",
  },
  {
    icon: UserRoundSearch,
    number: "02",
    title: "Chọn nơi tư vấn",
    description:
      "So sánh chuyên môn, phòng khám, lịch trống và mức phí phù hợp với nhu cầu của bạn.",
  },
  {
    icon: CalendarCheck2,
    number: "03",
    title: "Đặt lịch và nhận phác đồ",
    description:
      "Tư vấn trực tuyến cùng chuyên gia, sau đó theo dõi phác đồ cá nhân ngay trên GlowScan.",
  },
] as const;

export function SecureConsultationJourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-8% 0px", threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="secure-consultation"
      className="relative isolate overflow-hidden border-y border-emerald-950/10 bg-[#10271f] py-24 text-white"
    >
      <div className="pointer-events-none absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/8 px-4 py-2 text-xs font-bold tracking-widest text-emerald-100 uppercase backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Không gian tư vấn riêng tư
          </span>
          <h2 className="font-heading mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            Kết nối đúng chuyên gia trong 3 bước
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/75 sm:text-base">
            Thông tin chuyên gia và phòng khám chỉ dành cho thành viên đã xác
            thực, giúp hành trình đặt lịch rõ ràng và dữ liệu tư vấn được bảo
            vệ.
          </p>
        </div>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-3">
          <div
            aria-hidden="true"
            className={`absolute top-1/2 right-[15%] left-[15%] hidden h-px origin-left bg-gradient-to-r from-emerald-300/20 via-emerald-200/80 to-cyan-200/20 transition-transform duration-1000 motion-reduce:scale-x-100 motion-reduce:transition-none lg:block ${
              isVisible ? "scale-x-100" : "scale-x-0"
            }`}
          />

          {JOURNEY_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.number}
                className={`relative rounded-3xl border border-white/12 bg-white/8 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl transition-[opacity,transform] duration-700 hover:-translate-y-1 hover:border-emerald-200/35 hover:bg-white/12 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${120 + index * 140}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-300/12 text-emerald-100 shadow-lg shadow-emerald-950/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-black text-white/10">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading mt-8 text-xl font-bold">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50/70">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 transition-[opacity,transform] delay-500 duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:flex-row ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Link href="/login?redirectTo=%2Fexperts">
            <Button className="h-12 rounded-2xl bg-emerald-300 px-6 font-bold text-emerald-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-200">
              Đăng nhập để chọn chuyên gia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-50/60">
            <Stethoscope className="h-4 w-4" />
            Chuyên gia · Phòng khám · Phác đồ cá nhân
          </div>
        </div>
      </div>
    </section>
  );
}
