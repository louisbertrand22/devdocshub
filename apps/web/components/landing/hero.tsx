import Image from "next/image";
import { CtaButtons } from "./cta-buttons";

const ALT = "DevDocsHub : un guide Nginx avec son sommaire, ses blocs de code et la barre latérale des docs rangées par techno";

export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-[1fr_1.25fr] lg:py-24 lg:pr-0">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-accent-border bg-accent-subtle px-2.5 py-0.5 font-mono text-xs text-accent">
            docs · notes · collections
          </span>
          <h1 className="mt-5 text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            Ta documentation technique, <span className="text-accent">enfin au même endroit.</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-fg-muted">
            Rédige tes docs en markdown, annote-les, range-les par techno et retrouve n'importe quoi en une touche.
          </p>
          <CtaButtons className="mt-8" />
          <p className="mt-3 font-mono text-[11px] text-fg-muted">gratuit · sans carte bancaire</p>
        </div>

        {/* La capture déborde jusqu'au bord droit de la fenêtre sur grand écran */}
        <div className="lg:mr-[min(0px,calc((72rem-100vw)/2))]">
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[0_24px_80px_-24px_var(--accent-border)] lg:rounded-r-none lg:border-r-0">
            <div className="flex gap-1.5 border-b border-border px-3 py-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2.5 rounded-full bg-surface-2" />
              ))}
            </div>
            <Image
              data-hero
              src="/landing/hero-dark.png"
              alt={ALT}
              width={1440}
              height={900}
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="hidden w-full dark:block"
            />
            <Image
              data-hero
              src="/landing/hero-light.png"
              alt={ALT}
              width={1440}
              height={900}
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="block w-full dark:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
