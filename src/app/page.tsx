"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Star,
  Activity,
  UserCheck,
  Zap,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { QuizWidget } from "@/components/landing/quiz-widget";

export default function HomePage() {
  const [scanY, setScanY] = useState("0%");
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [hasConflict, setHasConflict] = useState(false);

  // Cycle the scanning line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanY((prev) => (prev === "0%" ? "100%" : "0%"));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Conflict warning system based on products in mock cart
  const handleProductSelect = (id: string) => {
    let nextList = [...selectedProduct];
    if (nextList.includes(id)) {
      nextList = nextList.filter((item) => item !== id);
    } else {
      nextList.push(id);
    }
    setSelectedProduct(nextList);

    // Conflict rules: BHA and Retinol should not be selected together
    const hasBha = nextList.includes("bha");
    const hasRetinol = nextList.includes("retinol");
    setHasConflict(hasBha && hasRetinol);
  };

  const mockExperts = [
    {
      name: "ThS. BS. Nguyễn Mai Anh",
      title: "Chuyên khoa I - Da liễu thẩm mỹ",
      clinic: "Seoul Skincare Clinic (Cầu Giấy, HN)",
      rating: 4.9,
      reviews: 142,
      price: "250.000 đ",
      tags: ["Trị mụn", "Phục hồi da", "Sẹo rỗ"],
    },
    {
      name: "BS. Lê Hoàng Long",
      title: "Bác sĩ nội trú Da liễu",
      clinic: "GlowScan Partner Clinic (Quận 3, HCM)",
      rating: 4.8,
      reviews: 98,
      price: "200.000 đ",
      tags: ["Chống lão hóa", "Nám & Tàn nhang", "Peel da"],
    },
  ];

  return (
    <div className="bg-background relative min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
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
                <a href="/login?redirectTo=/scan" className="w-full sm:w-auto">
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
                    Phòng khám đối tác
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
                        <span className="font-semibold">
                          B2: Điều Trị (Tối)
                        </span>
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

      {/* How it works Section */}
      <section
        id="how-it-works"
        className="bg-secondary/20 border-border/30 border-y py-20"
      >
        <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl space-y-3">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Quy trình vận hành
            </span>
            <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Hành trình 4 bước nâng cấp làn da
            </h2>
            <p className="text-muted-foreground text-sm">
              Giải pháp tích hợp giúp bạn dễ dàng theo dõi từ chẩn đoán ban đầu
              tới khi đạt được làn da như ý muốn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
                01
              </div>
              <h3 className="font-heading text-foreground mb-2 text-base font-bold">
                Khảo Sát Đa Khía Cạnh
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Đánh giá sơ bộ thói quen sinh hoạt, khí hậu vùng miền và dị ứng
                thành phần để xác định 16 phân loại da Baumann.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
                02
              </div>
              <h3 className="font-heading text-foreground mb-2 text-base font-bold">
                Soi Da AI Bằng Ảnh
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Chụp ảnh tự sướng để công cụ AI nhận diện chính xác các tổn
                thương mụn, nếp nhăn, thâm sạm và lỗ chân lông.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
                03
              </div>
              <h3 className="font-heading text-foreground mb-2 text-base font-bold">
                Xây Dựng Liệu Trình
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Hệ thống Rec Engine tự động lựa chọn hoạt chất phù hợp và phân
                bổ sản phẩm theo chu kỳ sử dụng và lượng bôi.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
                04
              </div>
              <h3 className="font-heading text-foreground mb-2 text-base font-bold">
                Theo Dõi & Đồng Hành
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Theo dõi tiến trình trước/sau điều trị, nhắc lịch bôi kem và kết
                nối chuyên gia y tế khi có kích ứng bất thường.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Scan Visual Demo Section */}
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
                GlowScan không chỉ phát hiện vùng khuyết điểm mà còn ước tính
                chỉ số tình trạng mụn, nếp nhăn và đốm nâu theo tỷ lệ phần trăm
                cụ thể. Mọi chỉ số đều được phân tích dựa trên tập dữ liệu da
                liễu đáng tin cậy nhằm hỗ trợ việc ra quyết định chọn sản phẩm
                chính xác hơn.
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
                    khách hàng luôn được mã hóa hai đầu và tự động hủy sau khi
                    có kết quả phân tích nếu người dùng yêu cầu.
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

      {/* Smart Catalog & Conflict Warning Preview Section */}
      <section
        id="products"
        className="bg-secondary/10 border-border/30 border-t py-20"
      >
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl space-y-3 text-left">
              <span className="text-primary text-xs font-bold tracking-widest uppercase">
                Cửa hàng thông minh
              </span>
              <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Cảnh báo thông minh chống xung đột hoạt chất
              </h2>
              <p className="text-muted-foreground text-sm">
                GlowScan áp dụng cơ chế phân tích thành phần tự động. Thử click
                chọn đồng thời cả 2 hoạt chất **BHA** và **Retinol** phía dưới
                để kiểm tra chức năng cảnh báo xung đột của giỏ hàng!
              </p>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Product 1 */}
            <div
              onClick={() => handleProductSelect("centella")}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                selectedProduct.includes("centella")
                  ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                  : "border-border/60 hover:border-primary/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
                    Phục hồi da
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    Lựa chọn an toàn
                  </span>
                </div>
                <h3 className="font-heading text-foreground text-base font-bold">
                  Kem dưỡng làm dịu rau má GlowScan
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  Chứa 5% Centella và 2% Niacinamide giúp phục hồi nhanh chóng
                  làn da đang bị kích ứng, nhạy cảm.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                    Rau má
                  </span>
                  <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                    B5
                  </span>
                </div>
              </div>
              <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                <span className="text-foreground font-bold">320.000 đ</span>
                <span
                  className={`text-xs font-semibold ${selectedProduct.includes("centella") ? "text-primary font-bold" : "text-muted-foreground"}`}
                >
                  {selectedProduct.includes("centella")
                    ? "Đã chọn"
                    : "+ Thêm vào giỏ"}
                </span>
              </div>
            </div>

            {/* Product 2 */}
            <div
              onClick={() => handleProductSelect("bha")}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                selectedProduct.includes("bha")
                  ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                  : "border-border/60 hover:border-primary/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    Tẩy tế bào chết
                  </span>
                  <span className="text-xs font-medium text-red-500">
                    Hoạt chất mạnh
                  </span>
                </div>
                <h3 className="font-heading text-foreground text-base font-bold">
                  Dung dịch tẩy da chết hóa học BHA 2%
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  Thấm sâu làm sạch bã nhờn, loại bỏ tế bào sừng gây bít tắc cồi
                  mụn ẩn.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                    Salicylic Acid 2%
                  </span>
                </div>
              </div>
              <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                <span className="text-foreground font-bold">390.000 đ</span>
                <span
                  className={`text-xs font-semibold ${selectedProduct.includes("bha") ? "text-primary font-bold" : "text-muted-foreground"}`}
                >
                  {selectedProduct.includes("bha")
                    ? "Đã chọn"
                    : "+ Thêm vào giỏ"}
                </span>
              </div>
            </div>

            {/* Product 3 */}
            <div
              onClick={() => handleProductSelect("retinol")}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                selectedProduct.includes("retinol")
                  ? "border-primary ring-primary/20 scale-[1.02] ring-2"
                  : "border-border/60 hover:border-primary/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    Trẻ hóa & Chống lão hóa
                  </span>
                  <span className="text-xs font-medium text-red-500">
                    Hoạt chất mạnh
                  </span>
                </div>
                <h3 className="font-heading text-foreground text-base font-bold">
                  Tinh chất Retinol tinh khiết 1%
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  Kích thích sản sinh collagen thế hệ mới, mờ nếp nhăn mảnh và
                  giúp căng bóng da.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                    Retinol 1%
                  </span>
                </div>
              </div>
              <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                <span className="text-foreground font-bold">550.000 đ</span>
                <span
                  className={`text-xs font-semibold ${selectedProduct.includes("retinol") ? "text-primary font-bold" : "text-muted-foreground"}`}
                >
                  {selectedProduct.includes("retinol")
                    ? "Đã chọn"
                    : "+ Thêm vào giỏ"}
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Warning banner demo */}
          {hasConflict && (
            <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 duration-300">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-yellow-800">
                    Cảnh báo xung đột hoạt chất phát hiện!
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-yellow-700">
                    Bạn đang thêm cả **BHA 2%** và **Retinol 1%** vào
                    routine/giỏ hàng. Việc sử dụng đồng thời cả hai hoạt chất
                    tẩy sừng và tái tạo mạnh mẽ này trong cùng một thời điểm để
                    tránh kích ứng mạnh.
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-yellow-900">
                    💡 Khuyên dùng: Sử dụng xen kẽ cách ngày (ví dụ: BHA tối thứ
                    2, 4, 6; Retinol tối thứ 3, 5, 7) và tăng cường cấp ẩm phục
                    hồi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Quick Quiz Widget Section */}
      <section className="relative py-20">
        <div className="bg-primary/5 absolute inset-0 -z-10 skew-y-3" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left intro text */}
            <div className="space-y-6 text-left lg:col-span-6">
              <span className="text-primary text-xs font-bold tracking-widest uppercase">
                Trải nghiệm tương tác
              </span>
              <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Khám phá loại da của bạn trong nháy mắt
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Chúng tôi cung cấp một bộ công cụ kiểm tra sơ bộ dựa trên các
                tiêu chí khoa học của bảng phân loại Baumann nổi tiếng. Chỉ mất
                chưa đầy 30 giây để tìm hiểu cơ chế hoạt động của làn da bạn.
              </p>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="border-border/40 flex items-center gap-2 rounded-xl border bg-white p-3 shadow-sm">
                  <UserCheck className="text-primary h-5 w-5" />
                  <span className="text-xs font-bold">100% Khách quan</span>
                </div>
                <div className="border-border/40 flex items-center gap-2 rounded-xl border bg-white p-3 shadow-sm">
                  <TrendingUp className="text-primary h-5 w-5" />
                  <span className="text-xs font-bold">
                    Tìm hoạt chất chuẩn xác
                  </span>
                </div>
              </div>
            </div>

            {/* Right Widget */}
            <div className="lg:col-span-6">
              <QuizWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Expert & Clinic Network Section */}
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
              Giao phó làn da cho những người có chuyên môn. Nhân viên hệ thống
              hỗ trợ miễn phí các thắc mắc thông thường, bác sĩ chuyên khoa phụ
              trách điều trị các ca bệnh lý phức tạp.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {mockExperts.map((expert, idx) => (
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
                    {expert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-muted-foreground rounded-lg px-2.5 py-1 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-6">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-bold uppercase">
                      Phí tư vấn từ
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      {expert.price}
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

      {/* Call to action final section */}
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
            <a href="/login?redirectTo=/scan">
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

      <Footer />
    </div>
  );
}
