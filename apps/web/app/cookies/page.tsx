import { ProsePage } from "@/components/page/prose-page";

export default function CookiesPage() {
  return (
    <ProsePage
      eyebrow="légal"
      title="Politique de cookies"
      description="Comment nous utilisons les cookies et technologies similaires"
    >
      <>
        <section>
          <div>
            <h2>Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. 
              Les cookies nous aident à améliorer votre expérience en mémorisant vos préférences et en 
              analysant l'utilisation de notre plateforme.
            </p>
          </div>

          <div>
            <h2>Types de cookies utilisés</h2>
            
            <div>
              <div>
                <h3>Cookies essentiels</h3>
                <p>
                  Ces cookies sont nécessaires au fonctionnement de DevDocsHub. Ils permettent la navigation 
                  et l'utilisation des fonctionnalités de base comme l'authentification et la gestion de session.
                </p>
              </div>

              <div>
                <h3>Cookies de préférences</h3>
                <p>
                  Ces cookies mémorisent vos choix et préférences (langue, thème sombre/clair, etc.) pour 
                  personnaliser votre expérience lors de vos prochaines visites.
                </p>
              </div>

              <div>
                <h3>Cookies analytiques</h3>
                <p>
                  Ces cookies nous aident à comprendre comment vous utilisez DevDocsHub en collectant des 
                  informations anonymes sur les pages visitées et les fonctionnalités utilisées.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2>Gestion des cookies</h2>
            <p>
              Vous pouvez contrôler et gérer les cookies de plusieurs façons :
            </p>
            <ul>
              <li>Paramètres de votre navigateur : la plupart des navigateurs vous permettent de refuser ou d'accepter les cookies</li>
              <li>Suppression des cookies existants : vous pouvez supprimer les cookies déjà stockés sur votre appareil</li>
              <li>Blocage des cookies tiers : empêcher les sites tiers de définir des cookies</li>
            </ul>
            <p>
              <strong>Note :</strong> La désactivation de certains cookies peut affecter le fonctionnement de DevDocsHub 
              et limiter l'accès à certaines fonctionnalités.
            </p>
          </div>

          <div>
            <h2>Cookies tiers</h2>
            <p>
              Nous pouvons utiliser des services tiers qui définissent leurs propres cookies, notamment :
            </p>
            <ul>
              <li>Services d'analyse (analytics)</li>
              <li>Services d'hébergement de contenu</li>
              <li>Services d'authentification</li>
            </ul>
          </div>

          <div>
            <h2>Durée de conservation</h2>
            <p>
              Les cookies ont différentes durées de vie :
            </p>
            <ul>
              <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies persistants :</strong> restent sur votre appareil pendant une durée définie (jusqu'à 12 mois)</li>
            </ul>
          </div>

          <div>
            <h2>Contact</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, contactez-nous à : cookies@devdocshub.com
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="meta">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>
      </>
    </ProsePage>
  );
}
