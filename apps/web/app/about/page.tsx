import { PageWrapper } from "@/components/layout/PageWrapper";

export default function AboutPage() {
  return (
    <PageWrapper
      title="À propos"
      description="Découvrez DevDocsHub et notre mission"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Notre mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevDocsHub est né d'un constat simple : les développeurs passent trop de temps à chercher 
              et organiser leur documentation technique. Notre mission est de centraliser et simplifier 
              l'accès à toutes vos ressources de développement en un seul endroit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Notre vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous imaginons un monde où chaque développeur peut se concentrer sur ce qu'il fait de mieux : 
              créer des applications innovantes. En éliminant les frictions liées à la gestion documentaire, 
              nous permettons aux équipes de gagner en productivité et en efficacité.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Ce que nous offrons</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevDocsHub propose une plateforme complète pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Centraliser votre documentation technique</li>
              <li>Organiser vos notes de développement</li>
              <li>Rechercher rapidement dans vos ressources</li>
              <li>Collaborer efficacement avec votre équipe</li>
              <li>Accéder à vos documents depuis n'importe où</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Notre équipe</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevDocsHub est développé par une équipe passionnée de développeurs qui comprennent 
              les défis quotidiens de la gestion documentaire. Nous utilisons nous-mêmes notre plateforme 
              et l'améliorons continuellement en fonction des besoins de notre communauté.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Nos valeurs</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Simplicité :</strong> Une interface intuitive et facile à utiliser</li>
              <li><strong>Performance :</strong> Un accès rapide à vos documents</li>
              <li><strong>Sécurité :</strong> Protection de vos données et de votre vie privée</li>
              <li><strong>Innovation :</strong> Amélioration continue de nos fonctionnalités</li>
              <li><strong>Communauté :</strong> À l'écoute de nos utilisateurs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Rejoignez-nous</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous partagez notre vision ? Découvrez nos <a href="/careers" className="text-primary hover:underline">opportunités de carrière</a> 
              ou <a href="/contact" className="text-primary hover:underline">contactez-nous</a> pour en savoir plus.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
