import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AiScanDemoSection() {
  return (
    <section id="ai-scan" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Image Slider Column */}
          <div className="flex flex-col items-center lg:col-span-6">
            <div className="border-border group relative aspect-square max-w-md overflow-hidden rounded-3xl border bg-black shadow-xl">
              {/* Simulated Skin Face Frame */}
              <div className="relative h-full w-full">
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                  <svg
                    className="h-3/4 w-3/4 text-white/5 opacity-80"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 20C28 20 20 32 20 48C20 68 35 88 50 92C65 88 80 68 80 48C80 32 72 20 50 20Z"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <circle
                      cx="50"
                      cy="48"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                    {/* Scanning indicators */}
                    <path
                      d="M42 48 H58 M50 40 V56"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>

                {/* Glowing scanner detection point markers */}
                <div className="absolute top-[32%] left-[45%] transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white bg-red-500 shadow" />
                  <div className="absolute -top-2 left-6 rounded-lg border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white shadow-md backdrop-blur">
                    Mụn trứng cá sưng (Nhẹ)
                  </div>
                </div>

                <div className="absolute top-[52%] left-[28%] transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white bg-yellow-500 shadow" />
                  <div className="absolute -top-2 left-6 rounded-lg border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white shadow-md backdrop-blur">
                    Lỗ chân lông nở rộng
                  </div>
                </div>

                <div className="absolute top-[45%] right-[25%] transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white bg-blue-500 shadow" />
                  <div className="absolute -top-2 left-6 rounded-lg border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white shadow-md backdrop-blur">
                    Nếp nhăn trán nông
                  </div>
                </div>

                {/* Scan active laser indicator */}
                <div className="absolute left-0 h-1 w-full animate-bounce bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,1)] duration-[2500ms]" />
              </div>
            </div>
            <span className="text-muted-foreground mt-4 text-center text-xs">
              Mô phỏng: Click vào các thẻ để xem chi tiết mức độ ảnh hưởng của
              da.
            </span>
          </div>

          {/* Description Text Column */}
          <div className="space-y-6 text-left lg:col-span-6">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Bảo vệ quyền lợi khách hàng
            </span>
            <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Công nghệ soi da AI ước lượng tính chất da khách quan
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              GlowScan không chỉ phát hiện vùng khuyết điểm mà còn ước tính chỉ
              số tình trạng mụn, nếp nhăn và đốm nâu theo tỷ lệ phần trăm cụ
              thể. Mọi chỉ số đều được phân tích dựa trên tập dữ liệu da liễu
              đáng tin cậy nhằm hỗ trợ việc ra quyết định chọn sản phẩm chính
              xác hơn.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-primary mt-0.5 h-5 w-5 flex-shrink-0">
                  <CheckCircle2 />
                </div>
                <p className="text-foreground text-sm">
                  <strong>Kho dữ liệu lớn:</strong> Hệ thống so sánh ảnh đối
                  chiếu với hàng chục ngàn ca kiểm nghiệm.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-primary mt-0.5 h-5 w-5 flex-shrink-0">
                  <CheckCircle2 />
                </div>
                <p className="text-foreground text-sm">
                  <strong>Bảo mật hình ảnh:</strong> Ảnh chụp khuôn mặt của
                  khách hàng luôn được mã hóa hai đầu và tự động hủy sau khi có
                  kết quả phân tích nếu người dùng yêu cầu.
                </p>
              </div>
            </div>

            <a href="/login?redirectTo=/scan">
              <Button className="mt-2 rounded-xl font-bold">
                Trải nghiệm máy soi da AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
