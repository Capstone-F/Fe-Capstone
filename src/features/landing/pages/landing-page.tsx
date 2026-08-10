import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { SmartCatalogSection } from "@/features/commerce/components/smart-catalog-section";
import { ExpertNetworkSection } from "@/features/experts/components/expert-network-section";
import { CtaSection } from "@/features/landing/components/cta-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SmartCatalogSection />
      <section id="experts">
        <ExpertNetworkSection />
      </section>
      <CtaSection />
    </>
  );
}
