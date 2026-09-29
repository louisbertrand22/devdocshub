const STEPS = [
  { n: "01", title: "Écris", text: "Crée un doc en markdown et donne-lui une techno." },
  { n: "02", title: "Annote", text: "Ajoute des notes au fil de l'eau et épingle celles qui comptent." },
  { n: "03", title: "Retrouve", text: "⌘K, trois lettres, Entrée." },
];

export function Steps() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <p className="font-mono text-xs text-fg-muted">~/comment-ça-marche</p>
        <h2 className="mt-2 text-3xl tracking-tight">Trois gestes, c'est tout</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="font-mono text-xs text-accent">{s.n}</span>
              <h3 className="mt-2 text-[15px]">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
