import type { Metadata } from "next";
import Image from "next/image";
import CerveauForm from "@/components/CerveauForm";
import { CALENDLY_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Construis ton équipe d'employés IA",
  description:
    "Choisis les postes que tu aimerais voir travailler pour toi. On te montre comment on construit ton équipe IA, à quoi elle ressemble — et ce que la même équipe te coûterait en humains.",
  alternates: { canonical: "/cerveau" },
};

export default function CerveauPage() {
  return (
    <>
      <div className="blueprint" aria-hidden />

      <main className="relative z-10">
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

        <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24">
          <div className="aura left-1/2 top-0 h-80 w-[560px] -translate-x-1/2 bg-fluo-600/20" />
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <span className="inline-flex items-center gap-2 rounded-md border border-fluo-400/25 bg-fluo-500/[0.07] px-4 py-1.5 text-xs font-600 uppercase tracking-widest text-fluo-300">
              Construis ton équipe IA · 2 minutes
            </span>
            <h1 className="mx-auto mt-6 font-display text-4xl font-800 leading-[1.08] text-white sm:text-5xl">
              À quoi ressemblerait une <span className="accent">équipe</span> qui travaille
              pour toi 24/7 ?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-mist-soft">
              Choisis les postes que tu voudrais. On te montre comment on les construit, à quoi ton
              équipe IA ressemble — et ce que la même équipe te coûterait en salaires.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 pb-24 sm:pb-32">
          <CerveauForm />
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8 py-8 text-center text-xs text-mist-soft/70">
        © {new Date().getFullYear()} Le Cloud AI · Employés IA installés en 7 jours.
      </footer>
    </>
  );
}
