import { PageWrapper } from "@/components/layout/PageWrapper";

export default function BlogPage() {
  return (
    <PageWrapper
      title="Blog"
      description="Actualités, tutoriels et conseils pour optimiser votre documentation"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-8">
          <div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Bienvenue sur notre blog ! Découvrez nos derniers articles, tutoriels et conseils 
              pour tirer le meilleur parti de DevDocsHub et améliorer votre gestion documentaire.
            </p>
          </div>

          <div className="border-b pb-8">
            <div className="text-sm text-muted-foreground mb-2">15 janvier 2025</div>
            <h2 className="text-2xl font-semibold mb-3">
              10 astuces pour organiser efficacement votre documentation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Découvrez nos meilleures pratiques pour structurer vos documents et gagner en productivité. 
              De l'utilisation des collections aux systèmes de tags, apprenez à créer une organisation 
              qui correspond à votre flux de travail.
            </p>
            <a href="#" className="text-primary hover:underline font-medium">
              Lire l'article →
            </a>
          </div>

          <div className="border-b pb-8">
            <div className="text-sm text-muted-foreground mb-2">8 janvier 2025</div>
            <h2 className="text-2xl font-semibold mb-3">
              Nouveautés : Collaboration en temps réel
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Nous sommes ravis d'annoncer le lancement de notre nouvelle fonctionnalité de collaboration 
              en temps réel. Travaillez avec votre équipe sur vos documents simultanément et voyez les 
              modifications en direct.
            </p>
            <a href="#" className="text-primary hover:underline font-medium">
              Lire l'article →
            </a>
          </div>

          <div className="border-b pb-8">
            <div className="text-sm text-muted-foreground mb-2">22 décembre 2024</div>
            <h2 className="text-2xl font-semibold mb-3">
              Guide complet : Recherche avancée dans DevDocsHub
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Maîtrisez les opérateurs de recherche avancée pour retrouver instantanément n'importe quel 
              document. Ce guide détaillé vous montre comment utiliser les filtres, les expressions régulières 
              et les recherches par métadonnées.
            </p>
            <a href="#" className="text-primary hover:underline font-medium">
              Lire l'article →
            </a>
          </div>

          <div className="border-b pb-8">
            <div className="text-sm text-muted-foreground mb-2">10 décembre 2024</div>
            <h2 className="text-2xl font-semibold mb-3">
              Intégrations : Connectez vos outils favoris
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              DevDocsHub s'intègre désormais avec vos outils de développement préférés : GitHub, GitLab, 
              Notion, Confluence et bien d'autres. Synchronisez automatiquement votre documentation 
              existante et restez à jour.
            </p>
            <a href="#" className="text-primary hover:underline font-medium">
              Lire l'article →
            </a>
          </div>

          <div className="pb-8">
            <div className="text-sm text-muted-foreground mb-2">1 décembre 2024</div>
            <h2 className="text-2xl font-semibold mb-3">
              Bienvenue sur DevDocsHub !
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Nous sommes heureux de vous accueillir sur notre plateforme de gestion documentaire. 
              Découvrez comment DevDocsHub peut transformer votre façon de gérer et d'accéder à 
              votre documentation technique.
            </p>
            <a href="#" className="text-primary hover:underline font-medium">
              Lire l'article →
            </a>
          </div>

          <div className="pt-6 border-t">
            <p className="text-center text-muted-foreground">
              Plus d'articles arrivent bientôt. Suivez-nous sur nos réseaux sociaux pour ne rien manquer !
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
