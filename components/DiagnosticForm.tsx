"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS, DeptId, TIME_SINKS } from "@/lib/diagnostic";
import BrainBuild from "./BrainBuild";
import BookingWidget from "./BookingWidget";

type Answers = {
  sector: string;
  departments: DeptId[];
  timeSinks: string[];
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const empty: Answers = {
  sector: "",
  departments: [],
  timeSinks: [],
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const STEPS = 4;

const LOADING_LINES = [
  "Lecture de ton entreprise…",
  "Assemblage de tes employés IA…",
  "Connexion de tes tâches au cerveau…",
];

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

export default function DiagnosticForm() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(empty);
  const [status, setStatus] = useState<
    "form" | "loading" | "building" | "done" | "error"
  >("form");
  const [error, setError] = useState("");

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));

  const toggle = (key: "departments" | "timeSinks", val: string) =>
    setA((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });

  const team = useMemo(
    () => DEPARTMENTS.filter((d) => a.departments.includes(d.id)),
    [a.departments]
  );
  const totalTasks = useMemo(
    () => team.reduce((s, d) => s + Math.min(4, d.tasks.length), 0),
    [team]
  );

  const canNext =
    (step === 0 && a.sector.trim().length > 1) ||
    (step === 1 && a.departments.length > 0) ||
    (step === 2 && a.timeSinks.length >= 2) ||
    step === 3;

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
          interest: "workforce-ia",
          name: a.name,
          email: a.email,
          phone: a.phone,
          company: a.sector,
          sector: a.sector,
          departments: teamNames.join(", "),
          timeSinks: a.timeSinks.join(", "),
          consent: a.consent,
          diagnostic: {
            teamRoster: teamNames,
            tasksAutomated: totalTasks,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.stored) throw new Error(json.error ?? "Erreur");
      setStatus("building");
      window.setTimeout(() => {
        setStatus("done");
        if (typeof window !== "undefined")
          window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1900);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  // ---------------------------------------------------------------- CONSTRUCTION
  if (status === "building") {
    return (
      <div className="card flex flex-col items-center gap-6 py-16 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-fluo-400" />
        <div className="space-y-2">
          {LOADING_LINES.map((l, i) => (
            <p
              key={l}
              className="animate-pulse text-sm text-mist-soft"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ RÉSULTAT
  if (status === "done") {
    return (
      <div className="rise space-y-6">
        {/* Le cerveau */}
        <div className="card p-5 sm:p-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-md border border-fluo-400/25 bg-fluo-500/[0.07] px-4 py-1.5 text-xs font-600 uppercase tracking-widest text-fluo-300">
              Ton cerveau IA{a.sector ? ` · ${a.sector}` : ""}
            </span>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-800 text-white sm:text-3xl">
              Voici l&apos;équipe qu&apos;on va construire pour toi.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-mist-soft">
              {team.length} employé{team.length > 1 ? "s" : ""} IA · {totalTasks} tâches prêtes à être
              exécutées 24/7. Chaque point est une tâche qu&apos;ils prennent en charge.
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-ink-900/40">
            <BrainBuild depts={team.map((d) => ({ short: d.short, icon: d.icon, tasks: d.tasks }))} />
          </div>
        </div>

        {/* Détail des tâches par employé */}
        <div className="card p-6 sm:p-8">
          <h3 className="font-display text-xl font-800 text-white">
            Tout ce que ton équipe IA va faire
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {team.map((d) => (
              <div key={d.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-fluo-500/15 text-xl">
                    {d.icon}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-700 text-white">{d.short}</h4>
                    <p className="text-xs text-fluo-300">{d.name}</p>
                  </div>
                </div>
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

        {/* CTA + calendrier */}
        <div className="card p-6 sm:p-8">
          <div className="text-center">
            <h3 className="font-display text-2xl font-800 text-white sm:text-3xl">
              On la construit ?
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-mist-soft">
              On la construit pour toi, clé en main. Choisis un moment ci-dessous : 15 minutes pour
              valider ton cerveau IA et te dire par quel employé on commence. Sans engagement.
            </p>
          </div>
          <div className="mt-6">
            <BookingWidget />
          </div>
          <p className="mt-3 text-center text-xs text-mist-soft/70">
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
              Ton secteur — pour bâtir un cerveau IA qui te ressemble.
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
            <p className="font-display text-xl font-700 text-white">
              Quels employés IA veux-tu ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">Choisis ceux qui te parlent.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <Chip
                  key={d.id}
                  active={a.departments.includes(d.id)}
                  onClick={() => toggle("departments", d.id)}
                >
                  {d.icon} {d.short}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Qu&apos;est-ce qui te fait perdre le plus de temps ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">Choisis-en au moins 2.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TIME_SINKS.map((t) => (
                <Chip
                  key={t.label}
                  active={a.timeSinks.includes(t.label)}
                  onClick={() => toggle("timeSinks", t.label)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
            {a.timeSinks.length === 1 && (
              <p className="mt-3 text-xs text-fluo-300/80">Encore un pour continuer.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Laisse ton courriel — on te montre ton cerveau IA.
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              Il apparaît à l&apos;écran juste après, et on t&apos;en garde une copie.
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
            {status === "loading" ? "Construction…" : "Construire mon cerveau IA"}
          </button>
        )}
      </div>
    </div>
  );
}
