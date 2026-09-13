// Config centrale : SEO + liens.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://diagnostic.le-cloud-ai.com"
).replace(/\/$/, "");

export const SITE_NAME = "Le Cloud AI";

export const SITE_DESCRIPTION =
  "Le diagnostic IA de ton entreprise en 2 minutes : découvre les heures et l'argent que tu perds chaque année, tes 3 employés IA prioritaires et ton plan d'implantation sur 90 jours. Gratuit, au Québec.";

export const SITE_LOCALE = "fr_CA";

export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/sunafilmsmedia/nouvelle-reunion";
