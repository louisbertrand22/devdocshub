import { PageWrapper } from "@/components/layout/PageWrapper";

export default function CareersPage() {
  return (
    <PageWrapper
      title="Carrières"
      description="Rejoignez l'équipe DevDocsHub et aidez-nous à construire l'avenir de la documentation"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Rejoignez notre équipe</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous êtes passionné par le développement et souhaitez avoir un impact réel sur la productivité 
              de milliers de développeurs ? Rejoignez DevDocsHub et participez à la création d'une plateforme 
              qui simplifie la vie des équipes techniques.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Pourquoi nous rejoindre ?</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Travaillez sur des technologies modernes (Next.js, React, TypeScript)</li>
              <li>Environnement de travail flexible (télétravail possible)</li>
              <li>Équipe internationale et collaborative</li>
              <li>Projets stimulants et innovants</li>
              <li>Opportunités de formation continue</li>
              <li>Rémunération compétitive et avantages</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Postes ouverts</h2>
            
            <div className="space-y-6 mt-6">
              <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-semibold mb-2">Développeur Full-Stack Senior</h3>
                <div className="text-sm text-muted-foreground mb-3">
                  Paris, France • Temps plein • Remote possible
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous recherchons un développeur full-stack expérimenté pour rejoindre notre équipe core. 
                  Vous travaillerez sur l'architecture de la plateforme, les nouvelles fonctionnalités 
                  et l'optimisation des performances.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    React
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    Next.js
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    Node.js
                  </span>
                </div>
                <a href="#" className="text-primary hover:underline font-medium">
                  Voir les détails et postuler →
                </a>
              </div>

              <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-semibold mb-2">Designer UI/UX</h3>
                <div className="text-sm text-muted-foreground mb-3">
                  Remote • Temps plein
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Créez des expériences utilisateur exceptionnelles pour notre plateforme. Vous serez 
                  responsable de la conception de nouvelles fonctionnalités, de l'amélioration de l'interface 
                  existante et du design system.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    Figma
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    Design System
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    Prototypage
                  </span>
                </div>
                <a href="#" className="text-primary hover:underline font-medium">
                  Voir les détails et postuler →
                </a>
              </div>

              <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-semibold mb-2">Product Manager</h3>
                <div className="text-sm text-muted-foreground mb-3">
                  Paris, France • Temps plein
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Définissez la roadmap produit et travaillez en étroite collaboration avec l'équipe 
                  de développement et les utilisateurs pour créer des fonctionnalités qui ont un impact réel.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                    Product Management
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                    Agile
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                    Analytics
                  </span>
                </div>
                <a href="#" className="text-primary hover:underline font-medium">
                  Voir les détails et postuler →
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Candidature spontanée</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous ne trouvez pas le poste qui vous correspond mais vous êtes convaincu que DevDocsHub 
              est fait pour vous ? Envoyez-nous votre candidature spontanée à <strong>jobs@devdocshub.com</strong>. 
              Nous sommes toujours à la recherche de talents passionnés.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Processus de recrutement</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>Envoi de votre candidature</li>
              <li>Premier entretien téléphonique (30 minutes)</li>
              <li>Entretien technique avec l'équipe (1-2 heures)</li>
              <li>Rencontre avec le fondateur</li>
              <li>Offre d'emploi</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Le processus complet prend généralement 2 à 3 semaines. Nous nous engageons à vous tenir 
              informé à chaque étape.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
