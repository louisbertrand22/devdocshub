import Link from "next/link";
import { ProsePage } from "@/components/page/prose-page";

export default function PrivacyPage() {
  return (
    <ProsePage
      eyebrow="légal"
      title="Politique de confidentialité"
      description="Comment nous collectons, utilisons et protégeons vos données personnelles"
    >
      <>
        <section>
          <div>
            <h2>1. Collecte des données</h2>
            <p>
              DevDocsHub collecte les données personnelles nécessaires pour fournir nos services. 
              Cela inclut les informations de compte (email, nom d'utilisateur) et les données 
              d'utilisation pour améliorer votre expérience.
            </p>
          </div>

          <div>
            <h2>2. Utilisation des données</h2>
            <p>
              Nous utilisons vos données pour :
            </p>
            <ul>
              <li>Fournir et maintenir nos services</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Améliorer nos fonctionnalités</li>
              <li>Communiquer avec vous concernant les mises à jour du service</li>
            </ul>
          </div>

          <div>
            <h2>3. Protection des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données contre tout accès non autorisé, modification, 
              divulgation ou destruction.
            </p>
          </div>

          <div>
            <h2>4. Partage des données</h2>
            <p>
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos données 
              uniquement avec des prestataires de services tiers qui nous aident à exploiter notre 
              plateforme, sous réserve d'obligations de confidentialité strictes.
            </p>
          </div>

          <div>
            <h2>5. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez de droits sur vos données :
            </p>
            <ul>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
          </div>

          <div>
            <h2>6. Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Pour plus d'informations, 
              consultez notre <Link href="/cookies">politique de cookies</Link>.
            </p>
          </div>

          <div>
            <h2>7. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              contactez-nous à : privacy@devdocshub.com
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
