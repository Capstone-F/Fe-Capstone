import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { MOCK_EXPERTS } from "../constants/expert-mock";

export function ExpertNetworkSection() {
  return (
    <section id="experts" className="py-20">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <span className="text-primary text-xs font-bold tracking-widest uppercase">
            Mạng lưới tin cậy
          </span>
          <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Hỗ trợ tư vấn hai cấp từ Chuyên gia Da liễu
          </h2>
          <p className="text-muted-foreground text-sm">
            Giao phó làn da cho những người có chuyên môn. Nhân viên hệ thống hỗ
            trợ miễn phí các thắc mắc thông thường, chuyên gia da liễu phụ trách
            chăm sóc các tình trạng da phức tạp.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {MOCK_EXPERTS.map((expert, idx) => (
            <div
              key={idx}
              className="border-border/60 flex flex-col justify-between rounded-3xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-heading text-foreground text-lg font-bold">
                      {expert.name}
                    </h4>
                    <p className="text-primary mt-0.5 text-xs font-semibold">
                      {expert.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2 py-1 text-xs font-bold text-yellow-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{expert.rating}</span>
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <MapPin className="text-muted-foreground/80 h-4 w-4 flex-shrink-0" />
                  <span>{expert.clinic}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(expert.specialties || expert.tags || []).map(
                    (tag: string) => (
                      <span
                        key={tag}
                        className="bg-secondary text-muted-foreground rounded-lg px-2.5 py-1 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase">
                    Phí tư vấn từ
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    {expert.price ||
                      (expert.fee
                        ? `${expert.fee.toLocaleString("vi-VN")} đ`
                        : "")}
                  </span>
                </div>
                <Link href="/experts" passHref>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold"
                  >
                    Đặt lịch hẹn
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
