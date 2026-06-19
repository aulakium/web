"use client";

import { useEffect, useState } from "react";

// Cada mensaje aparece en una esquina distinta. Alto FIJO + ancho automático:
// un mensaje más largo se ve más ancho, no más chico. Mismo alto para todas.
const MSGS = [
  { src: "/msg-1.webp", pos: "top-6 -left-5 sm:-left-7" },
  { src: "/msg-2.webp", pos: "bottom-10 -right-5 sm:-right-7" },
  { src: "/msg-3.webp", pos: "bottom-6 -left-5 sm:-left-7" },
];

/** Tarjetas de mensajes que rotan por las esquinas de la foto del hero. */
export function HeroMessages() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % MSGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {MSGS.map((m, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={m.src}
          src={m.src}
          alt=""
          className={`absolute ${m.pos} h-12 w-auto max-w-none rounded-2xl bg-white shadow-pop ring-1 ring-ink/5 transition-all duration-700 ease-out sm:h-[3.5rem] ${
            idx === i ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
