import Image from "next/image";
import DiagnosticForm from "@/components/DiagnosticForm";
import BlueprintBg from "@/components/BlueprintBg";
import { CALENDLY_URL } from "@/lib/site";

export default function Home() {
  return (
    <>
      <div className="vsl-bg" aria-hidden />
      <BlueprintBg />

      <main className="relative z-10">
        {/* En-tête */}
        <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-round.png" alt="Le Cloud AI" width={34} height={34} priority />
            <span className="font-display text-sm font-700 tracking-tight text-white">
              Le Cloud <span className="accent">AI</span>
            </span>
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-600 text-mist-soft transition-colors hover:border-white/30 hover:text-white"
          >
            Parler à un humain
          </a>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden pt-14 pb-8 sm:pt-20">
          <div className="aura left-1/2 top-0 h-80 w-[560px] -translate-x-1/2 bg-fluo-600/20" />
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <span className="inline-flex items-center gap-2 rounded-md border border-fluo-400/25 bg-fluo-500/[0.07] px-4 py-1.5 text-xs font-600 uppercase tracking-widest text-fluo-300">
              Construis ton cerveau IA · 2 minutes
            </span>
            <h1 className="mx-auto mt-6 font-display text-4xl font-800 leading-[1.08] text-white sm:text-5xl">
              Construis une équipe IA qui <span className="accent">t&apos;appartient</span> vraiment.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-mist-soft">
              Plus de 14 000 entreprises ont déjà cartographié la leur. En médiane, elles ont trouvé{" "}
              <span className="font-700 text-white">100 000 $ par année</span> de travail à confier à
              des agents. Laisse ton courriel et choisis comment on construit la tienne : par nous, ou
              avec nous.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-mist-soft">
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-fluo-400" /> Gratuit, sans
                engagement
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-fluo-400" /> Ton cerveau IA
                en direct
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-fluo-400" /> Fait au Québec
              </span>
            </div>
          </div>
        </section>

        {/* Formulaire */}
        <section className="mx-auto max-w-2xl px-5 pb-24 sm:pb-32">
          <DiagnosticForm />
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8 py-8 text-center text-xs text-mist-soft/70">
        © {new Date().getFullYear()} Le Cloud AI · Employés IA installés en 7 jours.
      </footer>
    </>
  );
}
