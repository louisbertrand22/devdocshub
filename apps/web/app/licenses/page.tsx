import { ProsePage } from "@/components/page/prose-page";

export default function LicensesPage() {
  return (
    <ProsePage
      eyebrow="légal"
      title="Licences open source"
      description="Attributions et licences des bibliothèques tierces utilisées"
    >
      <>
        <section>
          <div>
            <p>
              DevDocsHub utilise plusieurs bibliothèques et frameworks open source. 
              Nous tenons à remercier les mainteneurs et contributeurs de ces projets.
            </p>
          </div>

          <div>
            <h2>Frameworks principaux</h2>
            
            <div>
              <div className="card">
                <h3>Next.js</h3>
                <p className="meta">
                  Framework React pour la production - MIT License
                </p>
                <a 
                  href="https://github.com/vercel/next.js" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/vercel/next.js
                </a>
              </div>

              <div className="card">
                <h3>React</h3>
                <p className="meta">
                  Bibliothèque JavaScript pour créer des interfaces utilisateur - MIT License
                </p>
                <a 
                  href="https://github.com/facebook/react" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/facebook/react
                </a>
              </div>

              <div className="card">
                <h3>TypeScript</h3>
                <p className="meta">
                  Superset typé de JavaScript - Apache License 2.0
                </p>
                <a 
                  href="https://github.com/microsoft/TypeScript" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/microsoft/TypeScript
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2>Bibliothèques UI</h2>
            
            <div>
              <div className="card">
                <h3>Radix UI</h3>
                <p className="meta">
                  Composants UI accessibles et non stylisés - MIT License
                </p>
                <a 
                  href="https://github.com/radix-ui/primitives" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/radix-ui/primitives
                </a>
              </div>

              <div className="card">
                <h3>Lucide React</h3>
                <p className="meta">
                  Icônes SVG élégantes et cohérentes - ISC License
                </p>
                <a 
                  href="https://github.com/lucide-icons/lucide" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/lucide-icons/lucide
                </a>
              </div>

              <div className="card">
                <h3>Tailwind CSS</h3>
                <p className="meta">
                  Framework CSS utilitaire - MIT License
                </p>
                <a 
                  href="https://github.com/tailwindlabs/tailwindcss" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/tailwindlabs/tailwindcss
                </a>
              </div>

              <div className="card">
                <h3>remark-gfm</h3>
                <p className="meta">
                  Tableaux et extensions GitHub pour le markdown - MIT License
                </p>
                <a 
                  href="https://github.com/remarkjs/remark-gfm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/remarkjs/remark-gfm
                </a>
              </div>

              <div className="card">
                <h3>Geist</h3>
                <p className="meta">
                  Polices Geist et Geist Mono - SIL Open Font License 1.1
                </p>
                <a 
                  href="https://github.com/vercel/geist-font" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/vercel/geist-font
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2>Utilitaires</h2>
            
            <div>
              <div className="card">
                <h3>Zustand</h3>
                <p className="meta">
                  Gestion d'état simple et évolutive - MIT License
                </p>
                <a 
                  href="https://github.com/pmndrs/zustand" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/pmndrs/zustand
                </a>
              </div>

              <div className="card">
                <h3>React Markdown</h3>
                <p className="meta">
                  Composant React pour le rendu Markdown - MIT License
                </p>
                <a 
                  href="https://github.com/remarkjs/react-markdown" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/remarkjs/react-markdown
                </a>
              </div>

              <div className="card">
                <h3>Sonner</h3>
                <p className="meta">
                  Composant de notification toast pour React - MIT License
                </p>
                <a 
                  href="https://github.com/emilkowalski/sonner" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  https://github.com/emilkowalski/sonner
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2>Licences complètes</h2>
            <p>
              Pour consulter les textes complets des licences de chaque dépendance, veuillez vous référer 
              au fichier <code>package.json</code> de notre 
              dépôt et aux dépôts GitHub respectifs de chaque bibliothèque.
            </p>
          </div>

          <div>
            <h2>Licence de DevDocsHub</h2>
            <p>
              Le code source de DevDocsHub est disponible sous licence MIT. Vous êtes libre de l'utiliser, 
              le modifier et le distribuer selon les termes de cette licence.
            </p>
            <a 
              href="https://github.com/louisbertrand22/devdocshub" 
              target="_blank" 
              rel="noopener noreferrer"
             
            >
              Voir le dépôt GitHub
            </a>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="meta">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
