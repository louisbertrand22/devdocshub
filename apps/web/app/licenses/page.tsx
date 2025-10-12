import { PageWrapper } from "@/components/layout/PageWrapper";

export default function LicensesPage() {
  return (
    <PageWrapper
      title="Licences open source"
      description="Attributions et licences des bibliothèques tierces utilisées"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-6">
          <div>
            <p className="text-muted-foreground leading-relaxed">
              DevDocsHub utilise plusieurs bibliothèques et frameworks open source. 
              Nous tenons à remercier les mainteneurs et contributeurs de ces projets.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Frameworks principaux</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Next.js</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Framework React pour la production - MIT License
                </p>
                <a 
                  href="https://github.com/vercel/next.js" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/vercel/next.js
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">React</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Bibliothèque JavaScript pour créer des interfaces utilisateur - MIT License
                </p>
                <a 
                  href="https://github.com/facebook/react" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/facebook/react
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">TypeScript</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Superset typé de JavaScript - Apache License 2.0
                </p>
                <a 
                  href="https://github.com/microsoft/TypeScript" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/microsoft/TypeScript
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Bibliothèques UI</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Radix UI</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Composants UI accessibles et non stylisés - MIT License
                </p>
                <a 
                  href="https://github.com/radix-ui/primitives" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/radix-ui/primitives
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Lucide React</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Icônes SVG élégantes et cohérentes - ISC License
                </p>
                <a 
                  href="https://github.com/lucide-icons/lucide" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/lucide-icons/lucide
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Framer Motion</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Bibliothèque d'animations pour React - MIT License
                </p>
                <a 
                  href="https://github.com/framer/motion" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/framer/motion
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Utilitaires</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Zustand</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Gestion d'état simple et évolutive - MIT License
                </p>
                <a 
                  href="https://github.com/pmndrs/zustand" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/pmndrs/zustand
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">React Markdown</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Composant React pour le rendu Markdown - MIT License
                </p>
                <a 
                  href="https://github.com/remarkjs/react-markdown" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/remarkjs/react-markdown
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">Sonner</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Composant de notification toast pour React - MIT License
                </p>
                <a 
                  href="https://github.com/emilkowalski/sonner" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  https://github.com/emilkowalski/sonner
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Licences complètes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour consulter les textes complets des licences de chaque dépendance, veuillez vous référer 
              au fichier <code className="px-2 py-1 bg-muted rounded">package.json</code> de notre 
              dépôt et aux dépôts GitHub respectifs de chaque bibliothèque.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Licence de DevDocsHub</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le code source de DevDocsHub est disponible sous licence MIT. Vous êtes libre de l'utiliser, 
              le modifier et le distribuer selon les termes de cette licence.
            </p>
            <a 
              href="https://github.com/louisbertrand22/devdocshub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-block mt-2"
            >
              Voir le dépôt GitHub
            </a>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
