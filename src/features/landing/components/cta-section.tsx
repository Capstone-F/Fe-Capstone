import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-primary relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading mx-auto max-w-2xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          Sẵn sàng để sở hữu làn da khỏe mạnh, rạng rỡ?
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
          Tham gia khảo sát da Baumann và đăng ký tài khoản GlowScan để nhận
          liệu trình chăm sóc được đề xuất riêng cho bạn bởi AI ngay hôm nay.
        </p>
        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <a href="/scan">
            <Button className="text-primary w-full rounded-xl bg-white px-8 py-6 text-base font-bold shadow-lg shadow-black/10 hover:bg-neutral-100">
              Soi da & Khảo sát ngay
              <ArrowRight className="text-primary ml-2 h-5 w-5" />
            </Button>
          </a>
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full rounded-xl border-white/40 px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
            >
              Đăng nhập tài khoản
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
