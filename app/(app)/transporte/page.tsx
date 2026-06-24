import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";

// Ubicación de demostración (sin tiempo real). En producción la posición llega
// del GPS del chofer y el marcador se mueve. Acá usamos un mapa embebido sin
// API key (OpenStreetMap), centrado en el punto; el ícono del transporte va
// superpuesto en el centro. Con Google Maps + Maps JS API se logra lo mismo en
// vivo con un marcador propio (requiere API key).
const LAT = 19.428;
const LNG = -99.17;
const D = 0.012; // medio ancho del recuadro visible
const MAP_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${LNG - D}%2C${LAT - D}%2C${LNG + D}%2C${LAT + D}&layer=mapnik`;

const ROUTE = {
  name: "Ruta 14 — Barrio Norte",
  nextStop: "Av. del Sol 1240",
  eta: "6 min",
  aboard: 12,
  driver: { name: "Raúl Gómez", vehicle: "Mercedes Sprinter", plate: "ABC-123" },
  stops: [
    { time: "07:10", name: "Colegio Las Lomas", state: "done" },
    { time: "07:22", name: "Plaza Central", state: "done" },
    { time: "07:31", name: "Av. del Sol 1240", state: "current" },
    { time: "07:40", name: "Calle Roble 88", state: "next" },
    { time: "07:48", name: "Parque Norte", state: "next" },
  ],
} as const;

export default function TransportePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700 text-ink">Transporte</h1>
          <p className="text-sm font-500 text-ink/55">{ROUTE.name}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-700 text-leaf">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
          </span>
          En viaje
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Mapa */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card">
          <div className="relative h-[460px] w-full lg:h-[560px]">
            <iframe
              title="Ubicación del transporte"
              src={MAP_SRC}
              className="absolute inset-0 h-full w-full grayscale-[0.15]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Marcador del transporte (sobre el centro del mapa) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute -inset-3 animate-ping rounded-full bg-brand/40" />
              <span className="relative grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-brand text-white shadow-pop">
                <Icon name="Bus" className="h-6 w-6" />
              </span>
            </div>
            {/* Badge EN VIVO */}
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-700 text-ink shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cta" /> Posición en vivo
            </span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-600 text-white/90 backdrop-blur">
              Ubicación de demostración
            </span>
          </div>
        </div>

        {/* Panel de ruta */}
        <div className="flex flex-col gap-4">
          {/* Próxima parada */}
          <section className="rounded-[1.75rem] border border-ink/5 bg-gradient-to-br from-navy to-navy-deep p-5 text-white shadow-card">
            <p className="text-xs font-600 uppercase tracking-wide text-white/60">Próxima parada</p>
            <p className="mt-1 font-display text-xl font-700">{ROUTE.nextStop}</p>
            <div className="mt-3 flex items-center gap-4 text-sm font-600">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Clock" className="h-4 w-4 text-cta" /> Llega en {ROUTE.eta}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <Icon name="Users" className="h-4 w-4" /> {ROUTE.aboard} a bordo
              </span>
            </div>
          </section>

          {/* Chofer */}
          <section className="flex items-center gap-3 rounded-[1.75rem] border border-ink/5 bg-white p-4 shadow-card">
            <Avatar name={ROUTE.driver.name} color="transport" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-700 text-ink">{ROUTE.driver.name}</p>
              <p className="truncate text-xs font-600 text-ink/50">
                {ROUTE.driver.vehicle} · {ROUTE.driver.plate}
              </p>
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl bg-brand-wash text-brand transition-colors hover:bg-cloud"
              aria-label="Contactar al chofer"
            >
              <Icon name="MessagesSquare" className="h-5 w-5" />
            </button>
          </section>

          {/* Paradas */}
          <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
            <h2 className="mb-3 font-display text-base font-700 text-ink">Recorrido</h2>
            <ol className="relative ml-1.5 flex flex-col gap-1 border-l-2 border-ink/10 pl-5">
              {ROUTE.stops.map((s) => (
                <li key={s.name} className="relative py-1.5">
                  <span
                    className={`absolute -left-[1.6rem] top-2.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-white ${
                      s.state === "done"
                        ? "bg-leaf text-white"
                        : s.state === "current"
                          ? "bg-brand text-white"
                          : "bg-ink/15"
                    }`}
                  >
                    {s.state === "done" ? <Icon name="Check" className="h-2.5 w-2.5" /> : null}
                    {s.state === "current" ? <Icon name="Bus" className="h-2.5 w-2.5" /> : null}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm ${
                        s.state === "current" ? "font-700 text-ink" : "font-600 text-ink/70"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="shrink-0 text-xs font-600 text-ink/45">{s.time}</span>
                  </div>
                  {s.state === "current" ? (
                    <span className="text-[11px] font-700 text-brand">Llegando ahora</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
