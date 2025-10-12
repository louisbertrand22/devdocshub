import { PageWrapper } from "@/components/layout/PageWrapper";

export default function ContactPage() {
  return (
    <PageWrapper
      title="Contact"
      description="Nous sommes là pour vous aider. N'hésitez pas à nous contacter"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contactez-nous</h2>
            <p className="text-muted-foreground leading-relaxed">
              Une question, une suggestion ou besoin d'aide ? Notre équipe est à votre écoute. 
              Choisissez le canal qui vous convient le mieux pour nous joindre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-xl font-semibold mb-2">Support général</h3>
              <p className="text-muted-foreground mb-4">
                Pour toute question concernant l'utilisation de la plateforme
              </p>
              <a href="mailto:support@devdocshub.com" className="text-primary hover:underline font-medium">
                support@devdocshub.com
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Support technique</h3>
              <p className="text-muted-foreground mb-4">
                Besoin d'aide technique ou vous rencontrez un problème ?
              </p>
              <a href="mailto:tech@devdocshub.com" className="text-primary hover:underline font-medium">
                tech@devdocshub.com
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-xl font-semibold mb-2">Ventes et partenariats</h3>
              <p className="text-muted-foreground mb-4">
                Intéressé par nos offres entreprise ou une collaboration ?
              </p>
              <a href="mailto:sales@devdocshub.com" className="text-primary hover:underline font-medium">
                sales@devdocshub.com
              </a>
            </div>

            <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="text-xl font-semibold mb-2">Presse et médias</h3>
              <p className="text-muted-foreground mb-4">
                Demandes presse et relations médias
              </p>
              <a href="mailto:press@devdocshub.com" className="text-primary hover:underline font-medium">
                press@devdocshub.com
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Nos bureaux</h2>
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2">Siège social</h3>
              <p className="text-muted-foreground">
                DevDocsHub SAS<br />
                42 Avenue de la Tech<br />
                75008 Paris, France
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Rejoignez notre communauté</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Suivez-nous sur nos réseaux sociaux pour rester informé de nos dernières actualités, 
              fonctionnalités et conseils :
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://github.com/louisbertrand22" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://www.linkedin.com/in/louis-bertrand222/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Temps de réponse</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous efforçons de répondre à toutes les demandes dans les plus brefs délais :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
              <li>Support technique : 24-48 heures</li>
              <li>Support général : 48-72 heures</li>
              <li>Demandes commerciales : 2-3 jours ouvrés</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Pour les urgences critiques affectant votre production, merci d'ajouter [URGENT] 
              dans l'objet de votre email.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
