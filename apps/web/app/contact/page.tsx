import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProsePage } from "@/components/page/prose-page";

export default function ContactPage() {
  return (
    <ProsePage
      eyebrow="devdocshub"
      title="Contact"
      description="Nous sommes là pour vous aider. N'hésitez pas à nous contacter"
    >
      <>
        <section>
          <div>
            <h2>Contactez-nous</h2>
            <p>
              Une question, une suggestion ou besoin d'aide ? Notre équipe est à votre écoute. 
              Choisissez le canal qui vous convient le mieux pour nous joindre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="card">
              <div className="mb-2 text-2xl">💬</div>
              <h3>Support général</h3>
              <p>
                Pour toute question concernant l'utilisation de la plateforme
              </p>
              <a href="mailto:support@devdocshub.com">
                support@devdocshub.com
              </a>
            </div>

            <div className="card">
              <div className="mb-2 text-2xl">🔧</div>
              <h3>Support technique</h3>
              <p>
                Besoin d'aide technique ou vous rencontrez un problème ?
              </p>
              <a href="mailto:tech@devdocshub.com">
                tech@devdocshub.com
              </a>
            </div>

            <div className="card">
              <div className="mb-2 text-2xl">💼</div>
              <h3>Ventes et partenariats</h3>
              <p>
                Intéressé par nos offres entreprise ou une collaboration ?
              </p>
              <a href="mailto:sales@devdocshub.com">
                sales@devdocshub.com
              </a>
            </div>

            <div className="card">
              <div className="mb-2 text-2xl">📰</div>
              <h3>Presse et médias</h3>
              <p>
                Demandes presse et relations médias
              </p>
              <a href="mailto:press@devdocshub.com">
                press@devdocshub.com
              </a>
            </div>
          </div>

          <div>
            <h2>Nos bureaux</h2>
            <div className="card">
              <h3>Siège social</h3>
              <p>
                DevDocsHub SAS<br />
                42 Avenue de la Tech<br />
                75008 Paris, France
              </p>
            </div>
          </div>

          <div>
            <h2>Rejoignez notre communauté</h2>
            <p>
              Suivez-nous sur nos réseaux sociaux pour rester informé de nos dernières actualités, 
              fonctionnalités et conseils :
            </p>
            <div className="not-prose flex flex-wrap gap-2">
              <a 
                href="https://github.com/louisbertrand22" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}
              >
                GitHub
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}
              >
                Twitter
              </a>
              <a 
                href="https://www.linkedin.com/in/louis-bertrand222/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h2>Temps de réponse</h2>
            <p>
              Nous nous efforçons de répondre à toutes les demandes dans les plus brefs délais :
            </p>
            <ul>
              <li>Support technique : 24-48 heures</li>
              <li>Support général : 48-72 heures</li>
              <li>Demandes commerciales : 2-3 jours ouvrés</li>
            </ul>
            <p>
              Pour les urgences critiques affectant votre production, merci d'ajouter [URGENT] 
              dans l'objet de votre email.
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
