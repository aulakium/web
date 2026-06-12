import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { ACCENT_ON, type AccentColor } from "@/components/colors";

const FEATURES: {
  icon: string;
  color: AccentColor;
  title: string;
  text: string;
}[] = [
  { icon: "Megaphone", color: "news", title: "Novedades", text: "Avisos del colegio con foto, likes y comentarios, segmentados por curso." },
  { icon: "CalendarDays", color: "brand", title: "Calendario", text: "Exámenes, eventos y vacaciones en un calendario claro y compartido." },
  { icon: "MessagesSquare", color: "sky", title: "Mensajes", text: "Conversaciones entre familias y docentes, siempre dentro de cada salón." },
  { icon: "ClipboardList", color: "requests", title: "Trámites", text: "Inasistencias, autorizaciones y comprobantes, sin papeles." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Wordmark />
          <Link
            href="/login"
            className="rounded-2xl bg-ink px-5 py-2.5 text-sm font-800 text-white shadow-card transition-colors hover:bg-navy-deep"
          >
            Ingresar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-700 text-ink/70 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-news" />
            Comunicación escolar para LatAm y Brasil
          </span>
          <h1 className="mt-6 font-display text-4xl font-800 leading-[1.1] text-ink sm:text-5xl">
            La comunidad escolar,{" "}
            <span className="text-brand">conectada</span> en un solo lugar.
          </h1>
          <p className="mt-5 max-w-lg text-lg font-500 leading-relaxed text-ink/65">
            Colequium reúne avisos, calendario, mensajes y trámites entre el
            colegio, las familias y los docentes. Claro, ordenado y en el idioma
            de cada país.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-2xl bg-cta px-7 py-4 text-base font-800 text-white shadow-soft transition-colors hover:bg-cta-deep"
            >
              Ingresar
              <Icon name="ArrowRight" className="h-5 w-5" />
            </Link>
            <a
              href="#funciones"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-7 py-4 text-base font-800 text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              Conocé más
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://loremflickr.com/800/600/classroom,students?lock=51"
              alt="Comunidad escolar"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-3xl border border-ink/5 bg-white p-4 shadow-card sm:flex">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-news text-white">
              <Icon name="Megaphone" className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-800 text-ink">
                +120 familias
              </span>
              <span className="block text-xs font-600 text-ink/55">
                conectadas cada día
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-800 text-ink">
          Todo lo del colegio, en una sola app
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[1.75rem] border border-ink/5 bg-white p-6 shadow-card"
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${ACCENT_ON[f.color]}`}
              >
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-800 text-ink">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm font-500 leading-relaxed text-ink/60">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-navy-deep p-10 text-center text-white shadow-pop sm:p-14">
          <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(45deg,rgba(255,255,255,.6)_0_12px,transparent_12px_26px)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-800">
              ¿Tu colegio quiere usar Colequium?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Escribinos y coordinamos una demo. El acceso de familias y
              docentes es por invitación del colegio.
            </p>
            <a
              href="#"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cta px-7 py-4 text-base font-800 text-white shadow-soft transition-colors hover:bg-cta-deep"
            >
              Solicitar una demo
              <Icon name="ArrowRight" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
          <Wordmark />
          <p className="text-sm font-500 text-ink/45">
            © 2026 Colequium · Comunicación escolar
          </p>
        </div>
      </footer>
    </div>
  );
}
