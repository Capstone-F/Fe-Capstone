import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { AiScanDemoSection } from "@/features/scan/components/ai-scan-demo-section";
import { SmartCatalogSection } from "@/features/commerce/components/smart-catalog-section";
import { QuizWidget } from "@/features/survey/components/quiz-widget";
import { ExpertNetworkSection } from "@/features/experts/components/expert-network-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { UserCheck, TrendingUp } from "lucide-react";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <AiScanDemoSection />
      <SmartCatalogSection />

      {/* Interactive Quick Quiz Widget Section wrapper */}
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

      <ExpertNetworkSection />
      <CtaSection />
    </>
  );
}
