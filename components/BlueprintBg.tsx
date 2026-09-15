"use client";

import { useEffect, useRef } from "react";

/**
 * Fond animé « plans en construction » :
 * une grille discrète + des traceurs qui dessinent des chemins à angle droit
 * (comme un plan qui se construit tout seul) et des nœuds qui pulsent.
 */
export default function BlueprintBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const g = ctx;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GRID = 44;
    let w = 0;
    let h = 0;
    let raf = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    type Node = { x: number; y: number; t: number };
    type Walker = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      dx: number;
      dy: number;
      trail: { x: number; y: number }[];
      steps: number;
      maxSteps: number;
    };

    const rand = (n: number) => Math.floor(Math.random() * n);
    const snap = (v: number) => Math.round(v / GRID) * GRID;

    function spawn(): Walker {
      const x = snap(rand(w));
      const y = snap(rand(h));
      const horiz = Math.random() < 0.5;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const dx = horiz ? dir : 0;
      const dy = horiz ? 0 : dir;
      return {
        x,
        y,
        tx: x + dx * GRID,
        ty: y + dy * GRID,
        dx,
        dy,
        trail: [{ x, y }],
        steps: 0,
        maxSteps: 14 + rand(20),
      };
    }

    const COUNT = Math.max(4, Math.min(9, Math.round(w / 220)));
    let walkers: Walker[] = Array.from({ length: COUNT }, spawn);
    let nodes: Node[] = [];
    const speed = 2.2;

    function retarget(wk: Walker) {
      // au nœud : tout droit le plus souvent, sinon tourne à 90°
      const turn = Math.random() < 0.4;
      if (turn) {
        const left = Math.random() < 0.5;
        const ndx = left ? wk.dy : -wk.dy;
        const ndy = left ? -wk.dx : wk.dx;
        wk.dx = ndx;
        wk.dy = ndy;
      }
      wk.tx = wk.x + wk.dx * GRID;
      wk.ty = wk.y + wk.dy * GRID;
      if (Math.random() < 0.5) nodes.push({ x: wk.x, y: wk.y, t: 0 });
    }

    function step() {
      g.clearRect(0, 0, w, h);

      // grille : petits points
      g.fillStyle = "rgba(30,111,217,0.05)";
      for (let x = 0; x <= w; x += GRID) {
        for (let y = 0; y <= h; y += GRID) {
          g.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      // traceurs
      for (let i = 0; i < walkers.length; i++) {
        const wk = walkers[i];
        const ddx = wk.tx - wk.x;
        const ddy = wk.ty - wk.y;
        const dist = Math.hypot(ddx, ddy);

        if (dist <= speed) {
          wk.x = wk.tx;
          wk.y = wk.ty;
          wk.trail.push({ x: wk.x, y: wk.y });
          wk.steps++;
          // hors écran ou trop long -> renaître
          if (
            wk.steps > wk.maxSteps ||
            wk.x < -GRID ||
            wk.x > w + GRID ||
            wk.y < -GRID ||
            wk.y > h + GRID
          ) {
            walkers[i] = spawn();
            continue;
          }
          retarget(wk);
        } else {
          wk.x += (ddx / dist) * speed;
          wk.y += (ddy / dist) * speed;
        }

        // dessin de la traînée avec dégradé d'opacité
        const pts = wk.trail;
        for (let j = 1; j < pts.length; j++) {
          const a = (j / pts.length) * 0.5;
          g.strokeStyle = `rgba(30,111,217,${a})`;
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(pts[j - 1].x, pts[j - 1].y);
          g.lineTo(pts[j].x, pts[j].y);
          g.stroke();
        }
        // segment vivant vers la tête
        const last = pts[pts.length - 1];
        g.strokeStyle = "rgba(47,136,255,0.65)";
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(last.x, last.y);
        g.lineTo(wk.x, wk.y);
        g.stroke();

        // tête : petit + qui construit
        g.strokeStyle = "rgba(47,136,255,0.9)";
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(wk.x - 4, wk.y);
        g.lineTo(wk.x + 4, wk.y);
        g.moveTo(wk.x, wk.y - 4);
        g.lineTo(wk.x, wk.y + 4);
        g.stroke();

        if (pts.length > 26) pts.shift();
      }

      // nœuds qui pulsent
      nodes = nodes.filter((n) => n.t < 1);
      for (const n of nodes) {
        n.t += 0.015;
        const r = 2 + n.t * 10;
        g.strokeStyle = `rgba(47,136,255,${(1 - n.t) * 0.5})`;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(n.x, n.y, r, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = `rgba(30,111,217,${(1 - n.t) * 0.6})`;
        g.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
      }

      raf = requestAnimationFrame(step);
    }

    if (reduce) {
      // version statique : juste la grille
      g.fillStyle = "rgba(30,111,217,0.06)";
      for (let x = 0; x <= w; x += GRID)
        for (let y = 0; y <= h; y += GRID) g.fillRect(x - 0.5, y - 0.5, 1, 1);
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="blueprint-bg" aria-hidden="true" />;
}
