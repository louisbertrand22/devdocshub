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
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
              <a 
                href="https://www.linkedin.com/in/louis-bertrand222/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
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
