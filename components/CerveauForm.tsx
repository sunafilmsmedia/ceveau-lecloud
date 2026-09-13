"use client";

import { useMemo, useState } from "react";
import { CALENDLY_URL } from "@/lib/site";
import { DEPARTMENTS, DeptId, fmtInt, TEAM_SIZES } from "@/lib/diagnostic";
import { BUILD_STEPS, humanCost, LOADED_FACTOR, TOOLS } from "@/lib/team";

type Answers = {
  sector: string;
  teamSize: string;
  departments: DeptId[];
  tools: string[];
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const empty: Answers = {
  sector: "",
  teamSize: "",
  departments: [],
  tools: [],
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const STEPS = 5;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-600 transition-colors ${
        active
          ? "border-fluo-400 bg-fluo-500/15 text-white"
          : "border-white/15 text-mist-soft hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function CerveauForm() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(empty);
  const [status, setStatus] = useState<"form" | "loading" | "done" | "error">("form");
  const [error, setError] = useState("");

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));

  const toggle = <K extends "departments" | "tools">(
    key: K,
    val: Answers[K][number]
  ) =>
    setA((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(val)
        ? (prev[key] as string[]).filter((x) => x !== val)
        : [...(prev[key] as string[]), val],
    }));

  // Équipe sélectionnée + coût humain équivalent.
  const team = useMemo(
    () => DEPARTMENTS.filter((d) => a.departments.includes(d.id)),
    [a.departments]
  );
  const cost = useMemo(() => humanCost(a.departments), [a.departments]);

  const canNext =
    (step === 0 && a.sector.trim().length > 1) ||
    (step === 1 && Boolean(a.teamSize)) ||
    (step === 2 && a.departments.length > 0) ||
    step === 3 ||
    step === 4;

  async function submit() {
    if (!a.name || !a.email || !a.consent) {
      setError("Nom, courriel et consentement requis.");
      return;
    }
    setStatus("loading");
    setError("");

    const teamNames = team.map((d) => d.name);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: "cerveau-ia",
          name: a.name,
          email: a.email,
          phone: a.phone,
          company: a.sector,
          sector: a.sector,
          teamSize: a.teamSize,
          departments: teamNames.join(", "),
          tools: a.tools.join(", "),
          consent: a.consent,
          diagnostic: {
            teamRoster: teamNames,
            humanCostAnnual: cost.totalLoaded,
            humanCostMonthly: cost.monthlyLoaded,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.stored) throw new Error(json.error ?? "Erreur");
      setStatus("done");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  // ------------------------------------------------------------------ RÉSULTAT
  if (status === "done") {
    return (
      <div className="rise space-y-6">
        {/* Comment on construit l'équipe */}
        <div className="card p-6 sm:p-8">
          <span className="text-xs font-600 uppercase tracking-widest text-fluo-300">
            Étape par étape
          </span>
          <h2 className="mt-3 font-display text-2xl font-800 text-white sm:text-3xl">
            Comment on construit ton équipe
          </h2>
          <div className="mt-6 space-y-3">
            {BUILD_STEPS.map((s) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-fluo-500/15 font-display font-800 text-fluo-300">
                  {s.n}
                </span>
                <div>
                  <h4 className="font-display text-base font-700 text-white">{s.title}</h4>
                  <p className="mt-1 text-sm text-mist-soft">
                    {s.body({ tools: a.tools, sector: a.sector })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* L'équipe finale */}
        <div className="card p-6 sm:p-8">
          <div className="text-center">
            <span className="text-xs font-600 uppercase tracking-widest text-fluo-300">
              Le résultat
            </span>
            <h2 className="mt-3 font-display text-2xl font-800 text-white sm:text-3xl">
              Voici l&apos;équipe qui travaillerait pour toi.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-mist-soft">
              {team.length} employé{team.length > 1 ? "s" : ""} IA, disponibles 24/7, qui ne prennent
              jamais de vacances et ne démissionnent jamais.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {team.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-fluo-500/15 text-xl">
                    {d.icon}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-700 text-white">{d.name}</h4>
                    <p className="flex items-center gap-1.5 text-xs text-fluo-300">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-fluo-400" />
                      En poste · 24/7
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-mist-soft">{d.tagline}</p>
                <ul className="mt-3 space-y-1.5">
                  {d.tasks.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none bg-fluo-400" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coût de l'équivalent humain */}
        <div className="card overflow-hidden p-6 sm:p-8">
          <div className="text-center">
            <span className="text-xs font-600 uppercase tracking-widest text-fluo-300">
              La même équipe, en humains
            </span>
            <h2 className="mt-3 font-display text-2xl font-800 text-white sm:text-3xl">
              Embaucher cette équipe te coûterait
            </h2>
          </div>

          <div className="mx-auto mt-6 max-w-md divide-y divide-white/8">
            {cost.lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-white/90">{l.humanTitle}</span>
                <span className="font-display text-sm font-700 text-white">
                  {fmtInt(l.loaded)}&nbsp;$ / an
                </span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-md rounded-md border border-fluo-400/25 bg-fluo-500/[0.06] p-6 text-center">
            <p className="text-sm uppercase tracking-widest text-fluo-300">Équipe humaine</p>
            <p className="mt-2 font-display text-4xl font-800 text-white sm:text-5xl">
              {fmtInt(cost.totalLoaded)}&nbsp;$
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              par année · soit ~{fmtInt(cost.monthlyLoaded)}&nbsp;$/mois, chaque mois
            </p>
            <p className="mt-2 text-xs text-mist-soft/60">
              Salaires de base + charges &amp; avantages (~{Math.round((LOADED_FACTOR - 1) * 100)} %).
            </p>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-center text-mist-soft">
            Ton équipe IA fait le même travail pour un{" "}
            <span className="font-700 text-white">seul paiement</span> — aucun salaire récurrent,
            aucune charge sociale, aucun départ à remplacer.
          </p>
        </div>

        {/* CTA */}
        <div className="card p-6 text-center sm:p-10">
          <h3 className="font-display text-2xl font-800 text-white sm:text-3xl">
            On construit ton équipe ?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-mist-soft">
            15 minutes pour te montrer exactement à quoi ressembleraient tes employés IA et par
            lequel commencer. Sans engagement.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-fluo-500 px-8 py-4 font-display font-800 text-ink-950 transition-colors hover:bg-fluo-400 glow-fluo"
          >
            Réserver mon appel gratuit
          </a>
          <p className="mt-3 text-xs text-mist-soft/70">
            Ton équipe IA installée et testée en 7 jours, directement dans ton entreprise.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------- FORMULAIRE
  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-mist-soft/60 outline-none transition-colors focus:border-fluo-400/60 focus:bg-white/[0.05]";

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-2 flex items-center justify-between text-xs text-mist-soft">
        <span>
          Étape {step + 1} / {STEPS}
        </span>
        <span>{Math.round(((step + 1) / STEPS) * 100)} %</span>
      </div>
      <div className="mb-6 flex items-center gap-1.5">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-fluo-400" : "bg-white/12"
            }`}
          />
        ))}
      </div>

      <div key={step} className="rise">
        {step === 0 && (
          <div>
            <p className="font-display text-xl font-700 text-white">Tu fais quoi, au juste ?</p>
            <p className="mt-1 text-sm text-mist-soft">
              Ton secteur — pour bâtir une équipe qui te ressemble.
            </p>
            <input
              autoFocus
              value={a.sector}
              onChange={(e) => set({ sector: e.target.value })}
              placeholder="Ex. courtier immobilier, agence, clinique, e-commerce…"
              className={`${inputCls} mt-4`}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="font-display text-xl font-700 text-white">Vous êtes combien aujourd&apos;hui ?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TEAM_SIZES.map((s) => (
                <Chip key={s} active={a.teamSize === s} onClick={() => set({ teamSize: s })}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Qui aimerais-tu avoir dans ton équipe IA ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              Choisis les postes que tu aimerais voir travailler pour toi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <Chip
                  key={d.id}
                  active={a.departments.includes(d.id)}
                  onClick={() => toggle("departments", d.id)}
                >
                  {d.icon} {d.name.replace(" IA", "")}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Ton équipe travaille avec quoi ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              Les outils qu&apos;on va brancher à tes employés IA. (Facultatif)
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOOLS.map((t) => (
                <Chip key={t} active={a.tools.includes(t)} onClick={() => toggle("tools", t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Où on t&apos;envoie ton équipe IA ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              Tu la vois à l&apos;écran juste après, avec le coût de l&apos;équivalent humain.
            </p>
            <div className="mt-4 grid gap-3">
              <input
                value={a.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Nom complet"
                className={inputCls}
              />
              <input
                type="email"
                value={a.email}
                onChange={(e) => set({ email: e.target.value })}
                placeholder="toi@entreprise.com"
                className={inputCls}
              />
              <input
                type="tel"
                value={a.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="Téléphone (facultatif)"
                className={inputCls}
              />
              <label className="flex items-start gap-3 text-sm text-mist-soft">
                <input
                  type="checkbox"
                  checked={a.consent}
                  onChange={(e) => set({ consent: e.target.checked })}
                  className="mt-0.5 h-4 w-4 flex-none accent-fluo-500"
                />
                <span>J&apos;accepte d&apos;être contacté par Le Cloud AI au sujet de mon équipe IA.</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-sm font-600 text-mist-soft transition-colors hover:text-white"
          >
            ← Retour
          </button>
        ) : (
          <span />
        )}

        {step < STEPS - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-fluo-500 px-6 py-3 font-display font-700 text-ink-950 transition-colors hover:bg-fluo-400 disabled:opacity-40"
          >
            Continuer
          </button>
        ) : (
          <button
            type="button"
            disabled={status === "loading"}
            onClick={submit}
            className="rounded-full bg-fluo-500 px-6 py-3 font-display font-800 text-ink-950 transition-colors hover:bg-fluo-400 disabled:opacity-60 glow-fluo"
          >
            {status === "loading" ? "Construction…" : "Voir mon équipe IA"}
          </button>
        )}
      </div>
    </div>
  );
}
