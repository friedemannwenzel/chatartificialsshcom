"use client";

import { HeroSection } from "./HeroSection";
import { PoweredBySection } from "./PoweredBySection";
import { InteractiveDemoSection } from "./InteractiveDemoSection";
import { ModelsSection } from "./ModelsSection";
import { CTASection } from "./CTASection";

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PoweredBySection />
      <InteractiveDemoSection />
      <ModelsSection />
      <CTASection />
    </div>
  );
}

