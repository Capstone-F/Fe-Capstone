import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  return (
    <section className="border-border/60 bg-background border-b py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Khảo sát chăm sóc da cá nhân hóa
        </div>
        <h1 className="font-heading text-foreground mt-6 text-4xl font-bold tracking-normal sm:text-5xl">
          Hiểu làn da của bạn,
          <br />
          bắt đầu từ khảo sát phù hợp.
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
          Trả lời câu hỏi về tình trạng da, nhận gợi ý hoạt chất và sản phẩm phù
          hợp, rồi theo dõi lộ trình chăm sóc của bạn tại một nơi.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/scan">
            <Button size="lg" className="h-12 px-6 text-sm font-semibold">
              Bắt đầu phân tích da
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#experts">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-sm font-semibold"
            >
              Tìm chuyên gia
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
