import { ProsePage } from "@/components/page/prose-page";

export default function BlogPage() {
  return (
    <ProsePage
      eyebrow="devdocshub"
      title="Blog"
      description="Actualités, tutoriels et conseils pour optimiser votre documentation"
    >
      <>
        <section>
          <div>
            <p className="text-[17px]">
              Bienvenue sur notre blog ! Découvrez nos derniers articles, tutoriels et conseils 
              pour tirer le meilleur parti de DevDocsHub et améliorer votre gestion documentaire.
            </p>
          </div>

          <div>
            <h2>
              10 astuces pour organiser efficacement votre documentation
            </h2>
            <div className="meta">15 janvier 2025</div>
            <p>
              Découvrez nos meilleures pratiques pour structurer vos documents et gagner en productivité. 
              De l'utilisation des collections aux systèmes de tags, apprenez à créer une organisation 
              qui correspond à votre flux de travail.
            </p>
            <span className="meta">Bientôt disponible</span>
          </div>

          <div>
            <h2>
              Nouveautés : Collaboration en temps réel
            </h2>
            <div className="meta">8 janvier 2025</div>
            <p>
              Nous sommes ravis d'annoncer le lancement de notre nouvelle fonctionnalité de collaboration 
              en temps réel. Travaillez avec votre équipe sur vos documents simultanément et voyez les 
              modifications en direct.
            </p>
            <span className="meta">Bientôt disponible</span>
          </div>

          <div>
            <h2>
              Guide complet : Recherche avancée dans DevDocsHub
            </h2>
            <div className="meta">22 décembre 2024</div>
            <p>
              Maîtrisez les opérateurs de recherche avancée pour retrouver instantanément n'importe quel 
              document. Ce guide détaillé vous montre comment utiliser les filtres, les expressions régulières 
              et les recherches par métadonnées.
            </p>
            <span className="meta">Bientôt disponible</span>
          </div>

          <div>
            <h2>
              Intégrations : Connectez vos outils favoris
            </h2>
            <div className="meta">10 décembre 2024</div>
            <p>
              DevDocsHub s'intègre désormais avec vos outils de développement préférés : GitHub, GitLab, 
              Notion, Confluence et bien d'autres. Synchronisez automatiquement votre documentation 
              existante et restez à jour.
            </p>
            <span className="meta">Bientôt disponible</span>
          </div>

          <div>
            <h2>
              Bienvenue sur DevDocsHub !
            </h2>
            <div className="meta">1 décembre 2024</div>
            <p>
              Nous sommes heureux de vous accueillir sur notre plateforme de gestion documentaire. 
              Découvrez comment DevDocsHub peut transformer votre façon de gérer et d'accéder à 
              votre documentation technique.
            </p>
            <span className="meta">Bientôt disponible</span>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-center text-fg-muted">
              Plus d'articles arrivent bientôt. Suivez-nous sur nos réseaux sociaux pour ne rien manquer !
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
