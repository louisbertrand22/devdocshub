import { Badge } from "@/components/ui/badge";
import { ProsePage } from "@/components/page/prose-page";

export default function CareersPage() {
  return (
    <ProsePage
      eyebrow="devdocshub"
      title="Carrières"
      description="Rejoignez l'équipe DevDocsHub et aidez-nous à construire l'avenir de la documentation"
    >
      <>
        <section>
          <div>
            <h2>Rejoignez notre équipe</h2>
            <p>
              Vous êtes passionné par le développement et souhaitez avoir un impact réel sur la productivité 
              de milliers de développeurs ? Rejoignez DevDocsHub et participez à la création d'une plateforme 
              qui simplifie la vie des équipes techniques.
            </p>
          </div>

          <div>
            <h2>Pourquoi nous rejoindre ?</h2>
            <ul>
              <li>Travaillez sur des technologies modernes (Next.js, React, TypeScript)</li>
              <li>Environnement de travail flexible (télétravail possible)</li>
              <li>Équipe internationale et collaborative</li>
              <li>Projets stimulants et innovants</li>
              <li>Opportunités de formation continue</li>
              <li>Rémunération compétitive et avantages</li>
            </ul>
          </div>

          <div>
            <h2>Postes ouverts</h2>
            
            <div>
              <div className="card">
                <h3>Développeur Full-Stack Senior</h3>
                <div className="meta">
                  Paris, France • Temps plein • Remote possible
                </div>
                <p>
                  Nous recherchons un développeur full-stack expérimenté pour rejoindre notre équipe core. 
                  Vous travaillerez sur l'architecture de la plateforme, les nouvelles fonctionnalités 
                  et l'optimisation des performances.
                </p>
                <div className="not-prose my-3 flex flex-wrap gap-2">
                  <Badge variant="accent">React</Badge>
                  <Badge variant="accent">Next.js</Badge>
                  <Badge variant="accent">TypeScript</Badge>
                  <Badge variant="accent">Node.js</Badge>
                </div>
                <span className="meta">Bientôt disponible</span>
              </div>

              <div className="card">
                <h3>Designer UI/UX</h3>
                <div className="meta">
                  Remote • Temps plein
                </div>
                <p>
                  Créez des expériences utilisateur exceptionnelles pour notre plateforme. Vous serez 
                  responsable de la conception de nouvelles fonctionnalités, de l'amélioration de l'interface 
                  existante et du design system.
                </p>
                <div className="not-prose my-3 flex flex-wrap gap-2">
                  <Badge variant="neutral">Figma</Badge>
                  <Badge variant="neutral">Design System</Badge>
                  <Badge variant="neutral">Prototypage</Badge>
                </div>
                <span className="meta">Bientôt disponible</span>
              </div>

              <div className="card">
                <h3>Product Manager</h3>
                <div className="meta">
                  Paris, France • Temps plein
                </div>
                <p>
                  Définissez la roadmap produit et travaillez en étroite collaboration avec l'équipe 
                  de développement et les utilisateurs pour créer des fonctionnalités qui ont un impact réel.
                </p>
                <div className="not-prose my-3 flex flex-wrap gap-2">
                  <Badge variant="success">Product Management</Badge>
                  <Badge variant="success">Agile</Badge>
                  <Badge variant="success">Analytics</Badge>
                </div>
                <span className="meta">Bientôt disponible</span>
              </div>
            </div>
          </div>

          <div>
            <h2>Candidature spontanée</h2>
            <p>
              Vous ne trouvez pas le poste qui vous correspond mais vous êtes convaincu que DevDocsHub 
              est fait pour vous ? Envoyez-nous votre candidature spontanée à <strong>jobs@devdocshub.com</strong>. 
              Nous sommes toujours à la recherche de talents passionnés.
            </p>
          </div>

          <div>
            <h2>Processus de recrutement</h2>
            <ol>
              <li>Envoi de votre candidature</li>
              <li>Premier entretien téléphonique (30 minutes)</li>
              <li>Entretien technique avec l'équipe (1-2 heures)</li>
              <li>Rencontre avec le fondateur</li>
              <li>Offre d'emploi</li>
            </ol>
            <p>
              Le processus complet prend généralement 2 à 3 semaines. Nous nous engageons à vous tenir 
              informé à chaque étape.
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
