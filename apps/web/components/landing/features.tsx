import type { ReactNode } from "react";

function Viz({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden className="min-h-24 rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-fg-muted">
      {children}
    </div>
  );
}

const FEATURES: { title: string; text: string; viz: ReactNode }[] = [
  {
    title: "Markdown avec sommaire",
    text: "Titres ancrés, sommaire qui suit ta lecture, blocs de code copiables en un clic, tableaux.",
    viz: (
      <Viz>
        <div className="text-fg">## Installation</div>
        <div className="flex justify-between">
          <span>```bash</span>
          <span className="text-accent">Copier</span>
        </div>
        <div>sudo certbot --nginx -d app.example.com</div>
        <div>```</div>
      </Viz>
    ),
  },
  {
    title: "Tout retrouver avec ⌘K",
    text: "Une palette de commandes pour sauter vers n'importe quel doc ou page, sans quitter le clavier.",
    viz: (
      <Viz>
        <div>
          <span className="text-accent">⌘K</span> <span className="text-fg">nginx tls</span>
        </div>
        <div>── Docs ──────────</div>
        <div className="text-fg">Reverse proxy et TLS avec Let's Encrypt</div>
        <div>↑↓ naviguer · ⏎ ouvrir</div>
      </Viz>
    ),
  },
  {
    title: "Rangé par techno",
    text: "Chaque doc a sa techno ; la barre latérale les regroupe automatiquement.",
    viz: (
      <Viz>
        <div>~/docker</div>
        <div className="border-l-2 border-accent pl-2 text-accent">Docker Compose en pratique</div>
        <div>~/nginx</div>
        <div className="pl-2.5">Reverse proxy et TLS</div>
      </Viz>
    ),
  },
  {
    title: "Notes et collections",
    text: "Annote un doc, épingle l'essentiel, regroupe les docs d'un projet dans une collection.",
    viz: (
      <Viz>
        <div>
          <span className="text-warning">★ épinglée</span> · Docker Compose en pratique
        </div>
        <div className="text-fg">Penser au --build après un changement de Dockerfile.</div>
        <div className="mt-1">collection · Infra · 3 docs</div>
      </Viz>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <p className="font-mono text-xs text-fg-muted">~/fonctionnalités</p>
        <h2 className="mt-2 text-3xl tracking-tight">Pensé pour la doc que tu écris vraiment</h2>
        <p className="mt-3 max-w-xl text-fg-muted">Pas de wiki à configurer : des docs, des notes, et une recherche rapide.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
              {f.viz}
              <div>
                <h3 className="text-[15px]">{f.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
