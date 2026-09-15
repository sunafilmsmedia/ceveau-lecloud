"use client";

export type BrainDept = {
  short: string;
  icon: string;
  tasks: string[];
};

const W = 1000;
const H = 720;
const CX = W / 2;
const CY = H / 2;
const R1 = 158; // rayon des nœuds « département »
const R2 = 312; // rayon des tâches

const deg = (d: number) => (d * Math.PI) / 180;

/**
 * Le « cerveau IA » qui se construit tout seul : le cœur apparaît, puis chaque
 * département se branche, puis chaque tâche s'accroche — en cascade.
 * Chaque point est une tâche que l'équipe IA va exécuter.
 */
export default function BrainBuild({ depts }: { depts: BrainDept[] }) {
  const list = depts.length ? depts : [];
  const n = list.length || 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ton cerveau IA">
      {/* halo central */}
      <circle cx={CX} cy={CY} r={70} fill="rgba(34,204,255,0.10)" className="b-fade" />

      {list.map((dept, i) => {
        const A = -90 + (360 / n) * i;
        const px = CX + R1 * Math.cos(deg(A));
        const py = CY + R1 * Math.sin(deg(A));
        const tasks = dept.tasks.slice(0, 4);
        const spread = 15;
        const base = 0.45 + i * 0.55; // départ de ce département (s)

        return (
          <g key={dept.short}>
            {/* branche cœur → département */}
            <line
              x1={CX}
              y1={CY}
              x2={px}
              y2={py}
              stroke="rgba(34,204,255,0.45)"
              strokeWidth={1.6}
              className="b-line"
              pathLength={1}
              style={{ animationDelay: `${base}s` }}
            />

            {tasks.map((t, j) => {
              const B = A + (j - (tasks.length - 1) / 2) * spread;
              const tx = CX + R2 * Math.cos(deg(B));
              const ty = CY + R2 * Math.sin(deg(B));
              const anchor = tx < CX - 12 ? "end" : tx > CX + 12 ? "start" : "middle";
              const td = base + 0.5 + j * 0.12;
              return (
                <g key={t}>
                  <line
                    x1={px}
                    y1={py}
                    x2={tx}
                    y2={ty}
                    stroke="rgba(34,204,255,0.18)"
                    strokeWidth={1}
                    className="b-line"
                    pathLength={1}
                    style={{ animationDelay: `${td}s` }}
                  />
                  <circle
                    cx={tx}
                    cy={ty}
                    r={3.6}
                    fill="#22ccff"
                    className="b-pop"
                    style={{ animationDelay: `${td + 0.15}s` }}
                  />
                  <text
                    x={anchor === "end" ? tx - 9 : anchor === "start" ? tx + 9 : tx}
                    y={ty + 4}
                    textAnchor={anchor}
                    fontSize={13.5}
                    fill="#c3ccda"
                    className="b-fade"
                    style={{ animationDelay: `${td + 0.2}s` }}
                  >
                    {t}
                  </text>
                </g>
              );
            })}

            {/* nœud du département */}
            <circle
              cx={px}
              cy={py}
              r={9}
              fill="#22ccff"
              className="b-pop"
              style={{ animationDelay: `${base + 0.28}s` }}
            />
            <text
              x={px}
              y={py - 17}
              textAnchor="middle"
              fontSize={16}
              fontWeight={800}
              fill="#fff"
              className="b-fade"
              style={{ animationDelay: `${base + 0.34}s` }}
            >
              {dept.icon} {dept.short}
            </text>
          </g>
        );
      })}

      {/* cœur du cerveau */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className="b-pop">
        <circle cx={CX} cy={CY} r={48} fill="none" stroke="rgba(34,204,255,0.20)" />
        <circle
          cx={CX}
          cy={CY}
          r={36}
          fill="rgba(34,204,255,0.14)"
          stroke="rgba(34,204,255,0.6)"
          strokeWidth={1.6}
          style={{ animation: "brain-core 2.8s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
        />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#22ccff">
          CERVEAU IA
        </text>
      </g>
    </svg>
  );
}
