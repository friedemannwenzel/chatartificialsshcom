"use client";

import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { InteractiveDemoSection } from "./InteractiveDemoSection";
import { ModelsSection } from "./ModelsSection";
import { CTASection } from "./CTASection";

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <ModelsSection />
      <CTASection />
    </div>
  );
}

