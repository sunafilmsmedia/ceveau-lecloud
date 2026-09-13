"use client";

import { useMemo, useState } from "react";
import { CALENDLY_URL } from "@/lib/site";
import {
  AI_LEVELS,
  AI_TOOLS,
  DEPARTMENTS,
  DeptId,
  DiagnosticInput,
  fmtInt,
  runDiagnostic,
  TEAM_SIZES,
  TIME_SINKS,
} from "@/lib/diagnostic";

type Answers = {
  sector: string;
  teamSize: string;
  departments: DeptId[];
  timeSinks: string[];
  hoursPerWeek: number;
  hourlyRate: number;
  aiLevel: string;
  aiTool: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const empty: Answers = {
  sector: "",
  teamSize: "",
  departments: [],
  timeSinks: [],
  hoursPerWeek: 12,
  hourlyRate: 35,
  aiLevel: "",
  aiTool: "",
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const STEPS = 7;

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

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-mist-soft">{label}</span>
        <span className="font-display text-lg font-700 text-white">
          {value}
          <span className="ml-1 text-sm font-400 text-mist-soft">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-md outline-none
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-fluo-400
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-sm
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-fluo-400"
        style={{
          background: `linear-gradient(90deg, #22ccff ${pct}%, rgba(255,255,255,0.10) ${pct}%)`,
        }}
      />
      {hint && <p className="mt-1.5 text-xs text-mist-soft/70">{hint}</p>}
    </div>
  );
}

export default function DiagnosticForm() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(empty);
  const [status, setStatus] = useState<"form" | "loading" | "done" | "error">("form");
  const [error, setError] = useState("");

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));

  const toggleDept = (id: DeptId) =>
    setA((prev) => ({
      ...prev,
      departments: prev.departments.includes(id)
        ? prev.departments.filter((d) => d !== id)
        : [...prev.departments, id],
    }));

  const toggleSink = (label: string) =>
    setA((prev) => ({
      ...prev,
      timeSinks: prev.timeSinks.includes(label)
        ? prev.timeSinks.filter((d) => d !== label)
        : [...prev.timeSinks, label],
    }));

  // Aperçu en direct des économies (montré à l'étape des heures).
  const preview = useMemo(() => {
    const input: DiagnosticInput = {
      sector: a.sector,
      teamSize: a.teamSize,
      departments: a.departments,
      timeSinks: a.timeSinks,
      hoursPerWeek: a.hoursPerWeek,
      hourlyRate: a.hourlyRate,
      aiLevel: a.aiLevel,
      aiTool: a.aiTool,
    };
    return runDiagnostic(input);
  }, [a]);

  const canNext =
    (step === 0 && a.sector.trim().length > 1) ||
    (step === 1 && Boolean(a.teamSize)) ||
    (step === 2 && a.departments.length > 0) ||
    (step === 3 && a.timeSinks.length > 0) ||
    step === 4 ||
    (step === 5 && Boolean(a.aiLevel) && Boolean(a.aiTool)) ||
    step === 6;

  async function submit() {
    if (!a.name || !a.email || !a.consent) {
      setError("Nom, courriel et consentement requis.");
      return;
    }
    setStatus("loading");
    setError("");

    const deptNames = a.departments
      .map((id) => DEPARTMENTS.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: a.name,
          email: a.email,
          phone: a.phone,
          company: a.sector,
          sector: a.sector,
          teamSize: a.teamSize,
          timeSinks: a.timeSinks.join(", "),
          departments: deptNames,
          hoursPerWeek: a.hoursPerWeek,
          hourlyRate: a.hourlyRate,
          aiLevel: a.aiLevel,
          aiTool: a.aiTool,
          consent: a.consent,
          diagnostic: {
            reclaimWeeklyHours: preview.reclaimWeeklyHours,
            reclaimAnnualHours: preview.reclaimAnnualHours,
            annualSavings: preview.annualSavings,
            fteEquivalent: preview.fteEquivalent,
            leadScore: preview.leadScore,
            temperature: preview.temperature,
            priorities: preview.priorities.map((p) => p.name),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.stored) throw new Error(json.error ?? "Erreur");
      setStatus("done");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  // ------------------------------------------------------------------ RÉSULTAT
  if (status === "done") {
    const r = preview;
    const maxWeekly = Math.max(1, ...r.priorities.map((p) => p.weeklyHours));
    return (
      <div className="rise space-y-6">
        {/* Bandeau chiffres clés */}
        <div className="card overflow-hidden p-6 sm:p-8">
          <div className="text-center">
            <span className="text-xs font-600 uppercase tracking-widest text-fluo-300">
              Ton diagnostic IA{a.sector ? ` · ${a.sector}` : ""}
            </span>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-800 text-white sm:text-3xl">
              {r.headline}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-mist-soft">{r.verdict}</p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-5 text-center">
              <p className="font-display text-3xl font-800 text-white sm:text-4xl">
                {fmtInt(r.reclaimWeeklyHours)}
                <span className="ml-1 text-base font-500 text-mist-soft">h</span>
              </p>
              <p className="mt-1 text-xs text-mist-soft">récupérables / semaine</p>
            </div>
            <div className="rounded-md border border-fluo-400/25 bg-fluo-500/[0.06] p-5 text-center">
              <p className="font-display text-3xl font-800 text-white sm:text-4xl">
                {fmtInt(r.annualSavings)}&nbsp;$
              </p>
              <p className="mt-1 text-xs text-fluo-300">économisés / année</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-5 text-center">
              <p className="font-display text-3xl font-800 text-white sm:text-4xl">
                {fmtInt(r.reclaimAnnualHours)}
                <span className="ml-1 text-base font-500 text-mist-soft">h</span>
              </p>
              <p className="mt-1 text-xs text-mist-soft">soit ≈ {r.fteEquivalent} poste temps plein / an</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-mist-soft/60">
            Estimation basée sur tes réponses (≈ 60 % des tâches répétitives automatisables, 48 semaines/an).
          </p>
        </div>

        {/* Priorités : les 3 employés IA */}
        <div className="card p-6 sm:p-8">
          <h3 className="font-display text-xl font-800 text-white">
            Tes 3 employés IA prioritaires
          </h3>
          <p className="mt-1 text-sm text-mist-soft">
            Classés selon ce qui te fait perdre le plus de temps. On installe le n°1 en premier.
          </p>

          <div className="mt-6 space-y-4">
            {r.priorities.map((p, i) => (
              <div
                key={p.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-fluo-500/15 text-lg">
                      {p.icon}
                    </span>
                    <div>
                      <h4 className="font-display text-lg font-700 text-white">
                        <span className="mr-1.5 text-fluo-300">#{i + 1}</span>
                        {p.name}
                      </h4>
                      <p className="text-sm text-mist-soft">{p.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-700 text-fluo-300">
                      ~{p.weeklyHours}h / sem
                    </p>
                    <p className="text-xs text-mist-soft">
                      ≈ {fmtInt(p.annualSavings)}&nbsp;$ / an
                    </p>
                  </div>
                </div>

                {/* barre de gain */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-fluo-400"
                    style={{
                      width: `${Math.max(8, (p.weeklyHours / maxWeekly) * 100)}%`,
                      animation: "meter 0.9s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  />
                </div>

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.tasks.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none bg-fluo-400" />
                      {t}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 rounded-md border border-fluo-400/20 bg-fluo-500/[0.05] px-4 py-2.5 text-sm text-white/90">
                  <span className="font-600 text-fluo-300">On commence par :</span> {p.quickWin}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan 90 jours */}
        <div className="card p-6 sm:p-8">
          <h3 className="font-display text-xl font-800 text-white">
            Ton plan d&apos;implantation
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "7 jours",
                h: "Le premier employé IA en place",
                d: `On installe ton ${r.priorities[0].name.toLowerCase()} et on branche tes outils actuels.`,
              },
              {
                t: "30 jours",
                h: "La routine tourne toute seule",
                d: "Tes suivis, rapports et réponses partent sans toi. On ajuste sur tes vrais cas.",
              },
              {
                t: "90 jours",
                h: "Une équipe IA complète",
                d: "On empile tes 3 priorités. Le temps récupéré est réinvesti dans la croissance.",
              },
            ].map((ph, i) => (
              <div
                key={ph.t}
                className="relative rounded-lg border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="text-xs font-700 uppercase tracking-widest text-fluo-300">
                  Phase {i + 1} · {ph.t}
                </span>
                <h4 className="mt-2 font-display text-base font-700 text-white">{ph.h}</h4>
                <p className="mt-1.5 text-sm text-mist-soft">{ph.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card p-6 text-center sm:p-10">
          <h3 className="font-display text-2xl font-800 text-white sm:text-3xl">
            On l&apos;installe pour vrai ?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-mist-soft">
            15 minutes pour valider ton diagnostic et te dire exactement par quoi commencer. Sans
            engagement.
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
            On construit tes systèmes prioritaires en 7 jours, directement dans ton entreprise.
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
      {/* progression */}
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
            <p className="mt-1 text-sm text-mist-soft">Ton secteur ou ton type d&apos;entreprise.</p>
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
            <p className="font-display text-xl font-700 text-white">Vous êtes combien ?</p>
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
              Quels employés IA t&apos;intéressent le plus ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">Choisis ceux qui te parlent.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <Chip
                  key={d.id}
                  active={a.departments.includes(d.id)}
                  onClick={() => toggleDept(d.id)}
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
              Qu&apos;est-ce qui te fait perdre le plus de temps ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">Choisis-en autant que tu veux.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TIME_SINKS.map((t) => (
                <Chip
                  key={t.label}
                  active={a.timeSinks.includes(t.label)}
                  onClick={() => toggleSink(t.label)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-7">
            <div>
              <p className="font-display text-xl font-700 text-white">
                Combien de temps ça vous gruge ?
              </p>
              <p className="mt-1 text-sm text-mist-soft">
                Une estimation, à l&apos;échelle de ton équipe. Ça sert à chiffrer ton gain.
              </p>
            </div>
            <Slider
              label="Heures / semaine sur ces tâches répétitives"
              value={a.hoursPerWeek}
              min={2}
              max={60}
              step={1}
              suffix="h"
              onChange={(v) => set({ hoursPerWeek: v })}
            />
            <Slider
              label="Coût horaire moyen de ces heures"
              value={a.hourlyRate}
              min={20}
              max={120}
              step={5}
              suffix="$/h"
              hint="Salaire chargé de la personne qui fait ces tâches (ou le tien)."
              onChange={(v) => set({ hourlyRate: v })}
            />
            <div className="rounded-md border border-fluo-400/20 bg-fluo-500/[0.05] px-4 py-3 text-center text-sm text-mist-soft">
              Ça représente déjà{" "}
              <span className="font-700 text-white">
                {fmtInt(a.hoursPerWeek * a.hourlyRate * 48)} $
              </span>{" "}
              de travail répétitif par année.
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <p className="font-display text-xl font-700 text-white">Ton niveau avec l&apos;IA ?</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_LEVELS.map((l) => (
                  <Chip key={l} active={a.aiLevel === l} onClick={() => set({ aiLevel: l })}>
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="font-display text-xl font-700 text-white">
                Quelle IA tu utilises le plus souvent ?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_TOOLS.map((t) => (
                  <Chip key={t} active={a.aiTool === t} onClick={() => set({ aiTool: t })}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <p className="font-display text-xl font-700 text-white">
              Où on t&apos;envoie ton diagnostic complet ?
            </p>
            <p className="mt-1 text-sm text-mist-soft">
              Tu le vois à l&apos;écran juste après, et on t&apos;en garde une copie.
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
                <span>J&apos;accepte d&apos;être contacté par Le Cloud AI au sujet de mon diagnostic.</span>
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

      {/* navigation */}
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
            {status === "loading" ? "Analyse en cours…" : "Voir mon diagnostic"}
          </button>
        )}
      </div>
    </div>
  );
}
