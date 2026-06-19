"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MSGS = [
  { src: "/msg-1.webp", w: 888, h: 204 },
  { src: "/msg-2.webp", w: 900, h: 178 },
  { src: "/msg-3.webp", w: 788, h: 194 },
];

/** Tarjetas de mensajes que rotan (fade + leve slide) sobre la foto del hero. */
export function HeroMessages({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % MSGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      {/* Reserva de alto para que el contenedor no colapse (cards absolutas) */}
      <div className="relative h-20">
        {MSGS.map((m, idx) => (
          <div
            key={m.src}
            className={`absolute bottom-0 left-0 w-full overflow-hidden rounded-2xl bg-white shadow-pop ring-1 ring-ink/5 transition-all duration-700 ease-out ${
              idx === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <Image src={m.src} alt="" width={m.w} height={m.h} className="h-auto w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
