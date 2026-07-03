"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "../locale-context";

/**
 * Celebración "¡Todo al día!" GLOBAL (vive en el shell, no en una pantalla).
 * Se dispara SOLO en la transición a "todo en cero" (avisos + tareas + mensajes),
 * en el instante en que dejás lo último —desde cualquier pantalla—, guardando el
 * último estado en localStorage para no repetir en cada carga. Confetti liviano y
 * autocontenido (sin librerías); se cancela tocando la pantalla, se auto-cierra, y
 * respeta "reducir movimiento".
 */
export function AllClearCelebration({ allClear }: { allClear: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const KEY = "cq_allclear";
    let prev: string | null = null;
    try {
      prev = localStorage.getItem(KEY);
    } catch {}
    if (allClear && prev === "0") {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) setShow(true);
    }
    try {
      localStorage.setItem(KEY, allClear ? "1" : "0");
    } catch {}
  }, [allClear]);

  if (!show) return null;
  return <Confetti onDone={() => setShow(false)} />;
}

function Confetti({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const colors = ["#f8a13a", "#f57c00", "#3a9ec5", "#5bb96a", "#ffd166"];
    const parts = Array.from({ length: 130 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.4,
      r: 4 + Math.random() * 7,
      c: colors[Math.floor(Math.random() * colors.length)],
      vy: 2.2 + Math.random() * 3.2,
      vx: -1.3 + Math.random() * 2.6,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
    }));
    const start = performance.now();
    let raf = 0;
    function frame(now: number) {
      ctx!.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.c;
        ctx!.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx!.restore();
      }
      if (now - start < 2600) raf = requestAnimationFrame(frame);
      else onDone();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onDone}
      role="button"
      aria-label={t("home.allClear")}
    >
      <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="animate-rise rounded-[1.5rem] bg-white/95 px-6 py-4 text-center shadow-pop ring-1 ring-ink/5 backdrop-blur">
        <p className="font-display text-lg font-700 text-ink">{t("home.allClear")}</p>
        <p className="mt-0.5 text-xs font-600 text-ink/50">{t("home.allClear.tap")}</p>
      </div>
    </div>
  );
}
