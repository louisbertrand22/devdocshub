import type { Metadata } from "next";

export const LANDING_TITLE = "DevDocsHub — ta documentation technique, au même endroit";
export const LANDING_DESCRIPTION =
  "Rédige tes docs en markdown, annote-les, range-les par techno et retrouve n'importe quel doc en une touche avec ⌘K. Gratuit.";

const HERO_IMAGE = { url: "/landing/hero-dark.png", width: 1440, height: 900 };

/**
 * Métadonnées de la landing. Sans URL publique (NEXT_PUBLIC_SITE_URL), aucune image
 * absolue : `/` est statique, une URL localhost serait figée dans les aperçus de liens.
 */
export function landingMetadata(siteUrl: string | undefined): Metadata {
  const base: Metadata = {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    openGraph: { type: "website", locale: "fr_FR", title: LANDING_TITLE, description: LANDING_DESCRIPTION },
    twitter: { card: "summary", title: LANDING_TITLE, description: LANDING_DESCRIPTION },
  };
  if (!siteUrl) return base;
  return {
    ...base,
    metadataBase: new URL(siteUrl),
    openGraph: { ...base.openGraph, images: [HERO_IMAGE] },
    twitter: { ...base.twitter, card: "summary_large_image", images: [HERO_IMAGE.url] },
  };
}
