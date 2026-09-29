import Link from "next/link";
import { ProsePage } from "@/components/page/prose-page";

export default function AboutPage() {
  return (
    <ProsePage
      eyebrow="devdocshub"
      title="À propos"
      description="Découvrez DevDocsHub et notre mission"
    >
      <>
        <section>
          <div>
            <h2>Notre mission</h2>
            <p>
              DevDocsHub est né d'un constat simple : les développeurs passent trop de temps à chercher 
              et organiser leur documentation technique. Notre mission est de centraliser et simplifier 
              l'accès à toutes vos ressources de développement en un seul endroit.
            </p>
          </div>

          <div>
            <h2>Notre vision</h2>
            <p>
              Nous imaginons un monde où chaque développeur peut se concentrer sur ce qu'il fait de mieux : 
              créer des applications innovantes. En éliminant les frictions liées à la gestion documentaire, 
              nous permettons aux équipes de gagner en productivité et en efficacité.
            </p>
          </div>

          <div>
            <h2>Ce que nous offrons</h2>
            <p>
              DevDocsHub propose une plateforme complète pour :
            </p>
            <ul>
              <li>Centraliser votre documentation technique</li>
              <li>Organiser vos notes de développement</li>
              <li>Rechercher rapidement dans vos ressources</li>
              <li>Collaborer efficacement avec votre équipe</li>
              <li>Accéder à vos documents depuis n'importe où</li>
            </ul>
          </div>

          <div>
            <h2>Notre équipe</h2>
            <p>
              DevDocsHub est développé par une équipe passionnée de développeurs qui comprennent 
              les défis quotidiens de la gestion documentaire. Nous utilisons nous-mêmes notre plateforme 
              et l'améliorons continuellement en fonction des besoins de notre communauté.
            </p>
          </div>

          <div>
            <h2>Nos valeurs</h2>
            <ul>
              <li><strong>Simplicité :</strong> Une interface intuitive et facile à utiliser</li>
              <li><strong>Performance :</strong> Un accès rapide à vos documents</li>
              <li><strong>Sécurité :</strong> Protection de vos données et de votre vie privée</li>
              <li><strong>Innovation :</strong> Amélioration continue de nos fonctionnalités</li>
              <li><strong>Communauté :</strong> À l'écoute de nos utilisateurs</li>
            </ul>
          </div>

          <div>
            <h2>Rejoignez-nous</h2>
            <p>
              Vous partagez notre vision ? Découvrez nos <Link href="/careers">opportunités de carrière</Link> 
              ou <Link href="/contact">contactez-nous</Link> pour en savoir plus.
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
