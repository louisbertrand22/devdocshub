import { PageWrapper } from "@/components/layout/PageWrapper";

export default function PrivacyPage() {
  return (
    <PageWrapper
      title="Politique de confidentialité"
      description="Comment nous collectons, utilisons et protégeons vos données personnelles"
    >
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Collecte des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevDocsHub collecte les données personnelles nécessaires pour fournir nos services. 
              Cela inclut les informations de compte (email, nom d'utilisateur) et les données 
              d'utilisation pour améliorer votre expérience.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons vos données pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Fournir et maintenir nos services</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Améliorer nos fonctionnalités</li>
              <li>Communiquer avec vous concernant les mises à jour du service</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Protection des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données contre tout accès non autorisé, modification, 
              divulgation ou destruction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Partage des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos données 
              uniquement avec des prestataires de services tiers qui nous aident à exploiter notre 
              plateforme, sous réserve d'obligations de confidentialité strictes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">5. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous disposez de droits sur vos données :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience. Pour plus d'informations, 
              consultez notre <a href="/cookies" className="text-primary hover:underline">politique de cookies</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              contactez-nous à : privacy@devdocshub.com
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
