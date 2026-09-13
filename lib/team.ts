// ---------------------------------------------------------------------------
// Angle « cerveau » : au lieu de montrer les économies, on montre l'ÉQUIPE
// qu'on construit + ce que coûterait la même équipe en humains (salaires).
// ---------------------------------------------------------------------------

import { DeptId } from "./diagnostic";

export interface RoleCost {
  /** Titre humain équivalent (sans le « IA »). */
  humanTitle: string;
  /** Salaire annuel de base au Québec (CAD, ordre de grandeur marché). */
  base: number;
}

// Salaires annuels de base indicatifs (marché québécois, PME).
export const ROLE_COST: Record<DeptId, RoleCost> = {
  ventes: { humanTitle: "Directeur des ventes", base: 90000 },
  csm: { humanTitle: "Client Success Manager", base: 62000 },
  adjointe: { humanTitle: "Adjoint·e de direction", base: 55000 },
  cfo: { humanTitle: "Directeur financier", base: 110000 },
  cmo: { humanTitle: "Directeur marketing", base: 105000 },
};

// Charges de l'employeur + avantages (RRQ, RQAP, AE, FSS, CNESST, vacances,
// assurances…). ~20 % au-dessus du salaire de base, prudent.
export const LOADED_FACTOR = 1.2;

export interface HumanLine {
  id: DeptId;
  humanTitle: string;
  base: number;
  loaded: number;
}

export interface HumanCost {
  lines: HumanLine[];
  totalBase: number;
  totalLoaded: number;
  /** Coût mensuel arrondi de l'équipe humaine chargée. */
  monthlyLoaded: number;
}

/** Coût d'une équipe humaine équivalente aux employés IA choisis. */
export function humanCost(depts: DeptId[]): HumanCost {
  const lines: HumanLine[] = depts.map((id) => {
    const c = ROLE_COST[id];
    const loaded = Math.round(c.base * LOADED_FACTOR);
    return { id, humanTitle: c.humanTitle, base: c.base, loaded };
  });
  const totalBase = lines.reduce((s, l) => s + l.base, 0);
  const totalLoaded = lines.reduce((s, l) => s + l.loaded, 0);
  return {
    lines,
    totalBase,
    totalLoaded,
    monthlyLoaded: Math.round(totalLoaded / 12),
  };
}

// Les 4 étapes de construction (personnalisées avec les outils du prospect).
export interface BuildStep {
  n: number;
  title: string;
  body: (ctx: { tools: string[]; sector: string }) => string;
}

export const BUILD_STEPS: BuildStep[] = [
  {
    n: 1,
    title: "On assemble ton équipe",
    body: ({ sector }) =>
      `On part de ta réalité${
        sector ? ` (${sector})` : ""
      } et on choisit les employés IA qui vont réellement te faire avancer — pas un chatbot générique.`,
  },
  {
    n: 2,
    title: "On les branche à tes outils",
    body: ({ tools }) =>
      tools.length
        ? `Ils travaillent directement dans ${listFr(
            tools
          )} — là où ton entreprise vit déjà.`
        : "Ils se branchent à tes outils actuels — CRM, courriel, calendrier, compta — sans que tu changes quoi que ce soit.",
  },
  {
    n: 3,
    title: "On les entraîne sur ton business",
    body: () =>
      "Tes offres, ton ton, tes façons de faire. Ils répondent comme un membre de ton équipe qui te connaît, pas comme un robot.",
  },
  {
    n: 4,
    title: "Livrés et testés en 7 jours",
    body: () =>
      "On teste sur de vrais cas, on ajuste, et ton équipe IA est au travail. Un seul paiement — aucun salaire à recommencer chaque mois.",
  },
];

export const TOOLS = [
  "CRM",
  "Courriel",
  "Calendrier",
  "Comptabilité",
  "Réseaux sociaux",
  "Site web",
  "WhatsApp / SMS",
  "Excel / Sheets",
];

function listFr(items: string[]): string {
  const lower = items.map((t) => t.toLowerCase());
  if (lower.length === 1) return lower[0];
  if (lower.length === 2) return `${lower[0]} et ${lower[1]}`;
  return `${lower.slice(0, -1).join(", ")} et ${lower[lower.length - 1]}`;
}
