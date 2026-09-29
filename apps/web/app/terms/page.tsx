import { ProsePage } from "@/components/page/prose-page";

export default function TermsPage() {
  return (
    <ProsePage
      eyebrow="légal"
      title="Conditions d'utilisation"
      description="Les règles et conditions régissant l'utilisation de DevDocsHub"
    >
      <>
        <section>
          <div>
            <h2>1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant DevDocsHub, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </div>

          <div>
            <h2>2. Description du service</h2>
            <p>
              DevDocsHub est une plateforme de centralisation de documentation technique et de notes de développement. 
              Nous fournissons des outils pour organiser, rechercher et collaborer sur la documentation.
            </p>
          </div>

          <div>
            <h2>3. Compte utilisateur</h2>
            <p>
              Pour utiliser certaines fonctionnalités, vous devez créer un compte :
            </p>
            <ul>
              <li>Vous devez fournir des informations exactes et à jour</li>
              <li>Vous êtes responsable de la sécurité de votre compte</li>
              <li>Vous devez nous informer immédiatement de toute utilisation non autorisée</li>
              <li>Vous devez avoir au moins 16 ans pour créer un compte</li>
            </ul>
          </div>

          <div>
            <h2>4. Utilisation acceptable</h2>
            <p>
              Vous acceptez de ne pas utiliser DevDocsHub pour :
            </p>
            <ul>
              <li>Enfreindre des lois ou réglementations</li>
              <li>Diffuser du contenu illégal, nuisible ou offensant</li>
              <li>Violer les droits de propriété intellectuelle d'autrui</li>
              <li>Interférer avec le fonctionnement du service</li>
              <li>Tenter d'accéder à des systèmes non autorisés</li>
              <li>Utiliser des robots ou scripts automatisés sans autorisation</li>
            </ul>
          </div>

          <div>
            <h2>5. Propriété intellectuelle</h2>
            <p>
              Le contenu, les fonctionnalités et le code de DevDocsHub sont protégés par les lois sur la propriété 
              intellectuelle. Vous conservez vos droits sur le contenu que vous créez, mais nous accordez une 
              licence pour l'héberger et l'afficher dans le cadre du service.
            </p>
          </div>

          <div>
            <h2>6. Contenu utilisateur</h2>
            <p>
              Vous êtes responsable du contenu que vous publiez sur DevDocsHub :
            </p>
            <ul>
              <li>Vous garantissez avoir les droits nécessaires sur votre contenu</li>
              <li>Vous accordez à DevDocsHub une licence pour stocker et afficher votre contenu</li>
              <li>Nous nous réservons le droit de supprimer du contenu inapproprié</li>
            </ul>
          </div>

          <div>
            <h2>7. Disponibilité du service</h2>
            <p>
              Nous nous efforçons de maintenir DevDocsHub disponible 24/7, mais nous ne garantissons pas un accès 
              ininterrompu. Nous pouvons suspendre le service pour maintenance ou mises à jour.
            </p>
          </div>

          <div>
            <h2>8. Modifications des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes 
              seront notifiées aux utilisateurs. Votre utilisation continue du service après les modifications 
              constitue votre acceptation des nouvelles conditions.
            </p>
          </div>

          <div>
            <h2>9. Résiliation</h2>
            <p>
              Nous pouvons suspendre ou résilier votre compte si vous violez ces conditions. Vous pouvez également 
              supprimer votre compte à tout moment depuis les paramètres de votre profil.
            </p>
          </div>

          <div>
            <h2>10. Limitation de responsabilité</h2>
            <p>
              DevDocsHub est fourni "tel quel" sans garanties. Nous ne sommes pas responsables des dommages 
              indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
            </p>
          </div>

          <div>
            <h2>11. Droit applicable</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents français.
            </p>
          </div>

          <div>
            <h2>12. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : legal@devdocshub.com
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
