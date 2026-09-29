import { CtaButtons } from "./cta-buttons";

export function FinalCta() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:px-8">
        <h2 className="text-3xl tracking-tight">Commence ta base de docs maintenant.</h2>
        <p className="mt-3 text-fg-muted">Gratuit, sans carte bancaire. Thème sombre ou clair.</p>
        <CtaButtons className="mt-8 justify-center" />
      </div>
    </section>
  );
}
