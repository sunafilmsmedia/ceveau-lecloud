// ---------------------------------------------------------------------------
// Moteur de diagnostic IA — logique déterministe, testable, sans dépendance.
// Transforme les réponses du formulaire en un rapport personnalisé riche :
// gains estimés (heures + argent), employés IA prioritaires, plan 90 jours.
// ---------------------------------------------------------------------------

export type DeptId = "ventes" | "csm" | "adjointe" | "cfo" | "cmo";

export interface Department {
  id: DeptId;
  name: string;
  icon: string;
  tagline: string;
  tasks: string[];
  /** Le premier système qu'on installe en 7 jours pour ce département. */
  quickWin: string;
}

export const DEPARTMENTS: Department[] = [
  {
    id: "ventes",
    name: "Directeur des ventes IA",
    icon: "💰",
    tagline: "Il fait avancer chaque opportunité, sans jamais l'oublier.",
    tasks: [
      "Analyse tes appels et note les objections",
      "Écrit tes scripts et tes suivis",
      "Relance automatiquement chaque prospect",
      "Réactive tes clients dormants",
    ],
    quickWin: "Une séquence de relances automatiques branchée sur ton CRM.",
  },
  {
    id: "csm",
    name: "Client Success Manager IA",
    icon: "🤝",
    tagline: "Il garde tes clients heureux — et fidèles.",
    tasks: [
      "Onboarding de tes nouveaux clients",
      "Suivis de satisfaction",
      "Répond aux demandes fréquentes",
      "Détecte les clients à risque de partir",
    ],
    quickWin: "Un assistant qui répond aux questions clients 24/7.",
  },
  {
    id: "adjointe",
    name: "Adjointe de direction IA",
    icon: "📋",
    tagline: "Elle t'enlève tout le poids administratif des épaules.",
    tasks: [
      "Résume ton courriel du matin",
      "Prépare un brief avant chaque rendez-vous",
      "Met ton CRM à jour",
      "Chasse les paiements et documents manquants",
    ],
    quickWin: "Un brief quotidien de tes priorités livré chaque matin.",
  },
  {
    id: "cfo",
    name: "CFO IA",
    icon: "📊",
    tagline: "Il garde l'œil sur tes chiffres à ta place.",
    tasks: [
      "Classe tes factures automatiquement",
      "Suit tes dépenses",
      "Prépare tes rapports financiers",
      "Surveille ta marge et tes KPI",
    ],
    quickWin: "Un rapport hebdomadaire de tes chiffres clés, automatique.",
  },
  {
    id: "cmo",
    name: "CMO complet IA",
    icon: "🎯",
    tagline: "Il alimente ta machine à leads en continu.",
    tasks: [
      "Définit ton client idéal (ICP)",
      "Génère hooks, scripts et contenus",
      "Gère tes publicités Meta",
      "SEO, email marketing et statiques",
    ],
    quickWin: "Un calendrier de contenu généré et programmé pour 30 jours.",
  },
];

export interface TimeSink {
  label: string;
  /** Départements qui répondent à cette perte de temps. */
  depts: DeptId[];
}

export const TIME_SINKS: TimeSink[] = [
  { label: "Suivis & relances", depts: ["ventes", "csm"] },
  { label: "Contenu & marketing", depts: ["cmo"] },
  { label: "Administratif & factures", depts: ["adjointe", "cfo"] },
  { label: "Réponses aux clients", depts: ["csm"] },
  { label: "Rapports & chiffres", depts: ["cfo"] },
  { label: "Prospection", depts: ["cmo", "ventes"] },
  { label: "Prise de rendez-vous", depts: ["adjointe"] },
];

export const TEAM_SIZES = ["Juste moi", "2 à 5", "6 à 15", "16 et +"];
export const AI_LEVELS = [
  "Je débute",
  "Je m'y connais un peu",
  "Je l'utilise déjà beaucoup",
];
export const AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Copilot",
  "Aucune pour l'instant",
  "Autre",
];

export interface DiagnosticInput {
  sector: string;
  teamSize: string;
  departments: DeptId[];
  timeSinks: string[]; // labels
  hoursPerWeek: number; // heures/semaine perdues sur ces tâches, à l'échelle de l'équipe
  hourlyRate: number; // coût horaire moyen ($/h)
  aiLevel: string;
  aiTool: string;
}

export interface PriorityDept extends Department {
  /** Heures/semaine estimées récupérées par ce département. */
  weeklyHours: number;
  /** Économies annuelles attribuées à ce département. */
  annualSavings: number;
}

export interface DiagnosticResult {
  // Gains globaux
  reclaimWeeklyHours: number;
  reclaimAnnualHours: number;
  annualSavings: number;
  // Équivalent temps plein libéré
  fteEquivalent: number;
  // Priorités
  priorities: PriorityDept[];
  // Lecture du résultat
  verdict: string;
  headline: string;
  // Score interne pour le CRM (0-100) + température
  leadScore: number;
  temperature: "chaud" | "tiède" | "froid";
}

// Portion des tâches répétitives réellement automatisable de façon fiable.
const RECLAIM_RATE = 0.6;
// Semaines travaillées par an (hors vacances / fériés).
const WORK_WEEKS = 48;

function round(n: number): number {
  return Math.round(n);
}

/** Classe les départements par pertinence selon les réponses. */
export function rankDepartments(input: DiagnosticInput): DeptId[] {
  const score: Record<DeptId, number> = {
    ventes: 0,
    csm: 0,
    adjointe: 0,
    cfo: 0,
    cmo: 0,
  };

  // +2 si le département est directement choisi.
  for (const d of input.departments) score[d] += 2;

  // +1 par perte de temps sélectionnée qui pointe vers ce département.
  for (const label of input.timeSinks) {
    const ts = TIME_SINKS.find((t) => t.label === label);
    if (ts) for (const d of ts.depts) score[d] += 1;
  }

  const ranked = (Object.keys(score) as DeptId[])
    .filter((d) => score[d] > 0)
    .sort((a, b) => score[b] - score[a]);

  // Complète jusqu'à avoir au moins 3 pistes, dans l'ordre par défaut.
  const fallback: DeptId[] = ["cmo", "ventes", "adjointe", "csm", "cfo"];
  for (const d of fallback) {
    if (ranked.length >= 3) break;
    if (!ranked.includes(d)) ranked.push(d);
  }
  return ranked;
}

export function runDiagnostic(input: DiagnosticInput): DiagnosticResult {
  const hours = Math.max(0, input.hoursPerWeek);
  const rate = Math.max(0, input.hourlyRate);

  const reclaimWeeklyHours = round(hours * RECLAIM_RATE);
  const reclaimAnnualHours = reclaimWeeklyHours * WORK_WEEKS;
  const annualSavings = reclaimAnnualHours * rate;
  const fteEquivalent = Math.round((reclaimWeeklyHours / 40) * 10) / 10;

  // Priorités : top 3, avec répartition des heures/économies.
  const rankedIds = rankDepartments(input).slice(0, 3);
  // Pondération 50 / 30 / 20 des heures récupérées sur les 3 priorités.
  const weights = [0.5, 0.3, 0.2];
  const priorities: PriorityDept[] = rankedIds.map((id, i) => {
    const dept = DEPARTMENTS.find((d) => d.id === id)!;
    const weeklyHours = round(reclaimWeeklyHours * weights[i]);
    return {
      ...dept,
      weeklyHours,
      annualSavings: weeklyHours * WORK_WEEKS * rate,
    };
  });

  // Lecture
  let headline: string;
  let verdict: string;
  if (annualSavings >= 50000) {
    headline = "Ton entreprise laisse énormément sur la table.";
    verdict =
      "À ce rythme, le travail répétitif te coûte l'équivalent d'un poste à temps plein — chaque année. C'est exactement ce qu'un employé IA récupère.";
  } else if (annualSavings >= 20000) {
    headline = "Il y a un vrai gain à aller chercher.";
    verdict =
      "Une bonne partie de ces heures peut être confiée à l'IA dès ce mois-ci. Le retour se mesure en semaines, pas en années.";
  } else if (annualSavings > 0) {
    headline = "De belles heures à te réapproprier.";
    verdict =
      "Même à petite échelle, automatiser les bonnes tâches te redonne du temps pour ce qui fait vraiment croître ton entreprise.";
  } else {
    headline = "Voici où l'IA t'aiderait le plus.";
    verdict =
      "On a identifié tes chantiers prioritaires. Un court appel suffit pour chiffrer le gain réel.";
  }

  // Score interne (pour prioriser les rappels côté CRM).
  let leadScore = 0;
  leadScore += Math.min(40, Math.round(annualSavings / 2000)); // jusqu'à 40 pts sur les $
  leadScore += Math.min(15, hours); // volume de douleur
  leadScore += input.departments.length * 4; // clarté du besoin
  leadScore += input.timeSinks.length * 2;
  if (/beaucoup/i.test(input.aiLevel)) leadScore += 8; // déjà mûr pour l'IA
  if (input.teamSize === "6 à 15" || input.teamSize === "16 et +") leadScore += 12;
  else if (input.teamSize === "2 à 5") leadScore += 6;
  leadScore = Math.max(0, Math.min(100, leadScore));

  const temperature: DiagnosticResult["temperature"] =
    leadScore >= 65 ? "chaud" : leadScore >= 40 ? "tiède" : "froid";

  return {
    reclaimWeeklyHours,
    reclaimAnnualHours,
    annualSavings,
    fteEquivalent,
    priorities,
    verdict,
    headline,
    leadScore,
    temperature,
  };
}

export function fmtInt(n: number): string {
  return new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(n);
}
