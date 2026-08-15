import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { FabricLabSection } from "@/components/landing/FabricLabSection";
import { DyeLibrarySection } from "@/components/landing/DyeLibrarySection";
import { DesignStudioSection } from "@/components/landing/DesignStudioSection";
import { PatternSection } from "@/components/landing/PatternSection";
import { DyeOptimizerSection } from "@/components/landing/DyeOptimizerSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { CollectionsSection } from "@/components/landing/CollectionsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CheckoutSection } from "@/components/landing/CheckoutSection";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <LandingHero />
        <FabricLabSection />
        <DyeLibrarySection />
        <DesignStudioSection />
        <PatternSection />
        <DyeOptimizerSection />
        <BeforeAfterSection />
        <CollectionsSection />
        <HowItWorksSection />
        <CheckoutSection />
        <ImpactSection />
        <LandingFooter />
      </main>
      <ChatWidget />
    </div>
  );
}
