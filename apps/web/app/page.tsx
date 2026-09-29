import { landingMetadata } from "@/lib/landing-metadata";
import { Footer } from "@/components/layout/footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Steps } from "@/components/landing/steps";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingRedirect } from "@/components/landing/landing-redirect";

export const metadata = landingMetadata(process.env.NEXT_PUBLIC_SITE_URL || undefined);

export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <div data-landing className="flex min-h-screen flex-col">
        <LandingNav />
        <main className="flex-1 overflow-x-clip">
          <Hero />
          <Features />
          <Steps />
          <FinalCta />
        </main>
        <Footer year={new Date().getFullYear()} />
      </div>
    </>
  );
}
