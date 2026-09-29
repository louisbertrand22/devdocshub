import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Steps } from "@/components/landing/steps";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingRedirect } from "@/components/landing/landing-redirect";

const TITLE = "DevDocsHub — ta documentation technique, au même endroit";
const DESCRIPTION =
  "Rédige tes docs en markdown, annote-les, range-les par techno et retrouve n'importe quoi avec ⌘K. Gratuit.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/landing/hero-dark.png", width: 1440, height: 900 }],
  },
};

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
