import { Icon } from "@/components/icons";
import { Reveal } from "@/components/landing/Reveal";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PillCTA } from "@/components/landing/PillCTA";

export const metadata = {
  title: "¿Por qué Aulakium?",
  description:
    "Aulakium reúne toda la comunicación del colegio en una app fácil de usar: reemplaza los grupos de chat, los papeles y los mails perdidos. Menos ruido, más claridad.",
};

/* Los 3 reemplazos: de → a. */
const REPLACEMENTS = [
  { from: "Grupos de WhatsApp", to: "Un canal oficial y ordenado" },
  { from: "Circulares en papel", to: "Solicitudes con un toque" },
  { from: "Mails perdidos", to: "Todo en un solo lugar" },
];

/* Las 8 ventajas (de la guía comercial), en clave beneficio para el cliente. */
const ADVANTAGES: { icon: string; title: string; text: string }[] = [
  {
    icon: "MessagesSquare",
    title: "Comunicación clara para toda la comunidad",
    text: "Un único canal oficial entre el colegio y las familias, y también puertas adentro. Avisos con foto, reacciones y comentarios, segmentados por curso. Reemplaza los grupos de chat y los mails perdidos: menos ruido, más claridad.",
  },
  {
    icon: "ClipboardList",
    title: "Solicitudes y autorizaciones sin papeles",
    text: "Autorizaciones de salidas, información sanitaria, inasistencias y comprobantes se resuelven en segundos desde el teléfono, y todo queda registrado. Lo que antes era una circular que nunca volvía firmada, ahora se responde con un toque.",
  },
  {
    icon: "CalendarDays",
    title: "Calendario escolar claro y compartido",
    text: "Exámenes, actos, salidas y las fechas clave de cada ciclo, con sus horarios. Una sola fuente de verdad para todas las fechas: se acaba el “¿cuándo era el acto?”.",
  },
  {
    icon: "ShieldCheck",
    title: "Seguridad en la salida del colegio",
    text: "Autorización digital para que un tercero —distinto de quien retira habitualmente— pueda retirar al alumno, con registro de quién lo autorizó y cuándo. Nadie retira a un niño sin un permiso trazable.",
  },
  {
    icon: "Bus",
    title: "Transporte escolar en tiempo real",
    text: "Seguimiento del transporte en el mapa, con avisos de subida y bajada de cada alumno. Las familias dejan de esperar sin saber por dónde viene.",
  },
  {
    icon: "FolderClosed",
    title: "Documentos e información a un clic",
    text: "Un espacio ordenado para circulares, reglamentos y archivos del colegio, siempre disponibles y a mano. Se termina el “¿me reenvías la circular?”.",
  },
  {
    icon: "Languages",
    title: "Cada familia, en su idioma",
    text: "Traducción de los avisos al idioma de cada familia con un solo toque. Ninguna familia queda afuera de la comunicación por una barrera de idioma.",
  },
  {
    icon: "CreditCard",
    title: "Seguimiento de pagos",
    text: "El comprobante de la cuota de cada mes y la posibilidad de que las familias suban su pago, con el estado de cada una ordenado y a la vista.",
  },
];

/* Diferenciadores. */
const DIFFERENTIATORS = [
  {
    icon: "LayoutGrid",
    title: "Inicio: todo de un vistazo",
    text: "Al entrar, cada usuario ve un resumen: avisos sin leer, eventos de la semana y solicitudes pendientes.",
  },
  {
    icon: "ShieldCheck",
    title: "Privacidad por diseño",
    text: "Cada familia ve únicamente lo de sus hijos. Cuidar los datos de menores es la base de la plataforma.",
  },
  {
    icon: "GraduationCap",
    title: "+30 años en educación",
    text: "Hecho por un equipo que conoce la escuela por dentro: sus tiempos, roles y necesidades reales.",
  },
  {
    icon: "Globe",
    title: "Pensado para LatAm y Brasil",
    text: "Multi-idioma y multi-colegio desde el primer día, listo para crecer con la institución.",
  },
];

/* Preguntas frecuentes (nacidas del manejo de objeciones de la guía). */
const FAQ = [
  {
    q: "Ya usamos WhatsApp y es gratis. ¿Para qué cambiar?",
    a: "WhatsApp mezcla lo personal con lo escolar, genera ruido y desigualdad, y no protege los datos de los menores. Aulakium es el canal oficial: ordenado, segmentado por curso y trazable.",
  },
  {
    q: "¿Es complicado de implementar?",
    a: "Es una app simple, fácil y completa, pensada desde cómo trabaja de verdad un colegio. El acceso de familias y docentes es por invitación de la institución.",
  },
  {
    q: "¿Y la privacidad de los datos de los niños?",
    a: "Privacidad por diseño: cada familia ve solo la información de sus propios hijos.",
  },
  {
    q: "Tenemos familias que hablan otro idioma.",
    a: "Traducción integrada: cada familia lee los avisos en su idioma con un solo toque.",
  },
];

const STATS = [
  { big: "9 módulos", small: "en 1 sola app" },
  { big: "+30 años", small: "de experiencia en educación" },
  { big: "Multi-idioma", small: "para LatAm y Brasil" },
];

export default function PorQueAulakiumPage() {
  return (
    <div className="min-h-dvh bg-white text-ink antialiased">
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-ink to-navy-deep" />
        <div className="absolute inset-0 -z-10 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-cta/20 blur-3xl" />

        <div className="mx-auto max-w-4xl px-5 py-16 text-center text-white lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-600 text-white/85 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cta" /> ¿Por qué Aulakium?
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-700 leading-[1.1] tracking-tight sm:text-5xl">
              Menos ruido,{" "}
              <span className="font-hand inline-block px-1 text-[1.12em] text-sky">más claridad</span>{" "}
              para toda la comunidad
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-400 leading-relaxed text-white/75">
              Aulakium reúne toda la comunicación del colegio en una sola app fácil de usar, le da a
              cada familia la información de sus hijos —clara y en su idioma— y reemplaza los grupos
              de chat, los papeles y los mails perdidos.
            </p>
            <div className="mt-8 flex justify-center">
              <PillCTA href="/#contacto">Solicitar una demo</PillCTA>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.big} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-5 backdrop-blur">
                  <p className="text-2xl font-700 text-white">{s.big}</p>
                  <p className="mt-1 text-sm font-500 text-white/60">{s.small}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Los 3 reemplazos ===== */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-700 text-brand">Por qué importa</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">
              Reconstruimos cómo el colegio se comunica
            </h2>
            <p className="mt-3 font-400 text-ink/60">
              Con tecnología y diseño modernos, lo disperso pasa a estar en un solo lugar.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {REPLACEMENTS.map((r, i) => (
              <Reveal key={r.from} delay={i * 80}>
                <div className="flex h-full flex-col items-center gap-3 rounded-3xl border border-ink/10 bg-mist/40 p-7 text-center">
                  <span className="text-sm font-600 text-rose line-through decoration-rose/50">{r.from}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
                    <Icon name="ChevronRight" className="h-4 w-4 rotate-90" />
                  </span>
                  <span className="text-lg font-700 text-ink">{r.to}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Las 8 ventajas ===== */}
      <section className="bg-mist py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-700 text-brand">Ventajas</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">
              Beneficios concretos para tu colegio
            </h2>
            <p className="mt-3 font-400 text-ink/60">
              Ocho razones por las que las instituciones eligen Aulakium.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {ADVANTAGES.map((a, i) => (
              <Reveal key={a.title} delay={(i % 2) * 90}>
                <div className="flex h-full gap-5 rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-all hover:border-brand/30 hover:shadow-pop sm:p-7">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Icon name={a.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-700 leading-snug text-ink">{a.title}</h3>
                    <p className="mt-2 text-sm font-400 leading-relaxed text-ink/60">{a.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Diferenciadores ===== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-700 text-brand">Diferenciadores</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">
              Lo que hace distinta a Aulakium
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENTIATORS.map((d, i) => (
              <Reveal key={d.title} delay={i * 80}>
                <div className="h-full rounded-3xl border border-ink/8 bg-mist/40 p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Icon name={d.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-700 text-ink">{d.title}</h3>
                  <p className="mt-2 text-sm font-400 leading-relaxed text-ink/60">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-mist py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal className="text-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-700 text-brand">Preguntas frecuentes</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">Dudas comunes, respuestas claras</h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-4">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 70}>
                <details className="group rounded-2xl border border-ink/8 bg-white p-5 open:shadow-card sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-700 text-ink">
                    {f.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-open:rotate-45">
                      <Icon name="Plus" className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm font-400 leading-relaxed text-ink/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-white px-5 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy to-navy-deep px-6 py-14 text-center sm:px-14">
            <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 -z-10 h-64 w-64 rounded-full bg-cta/20 blur-3xl" />
            <h2 className="mx-auto max-w-xl text-3xl font-700 tracking-tight text-white sm:text-4xl">
              ¿Listo para conectar tu colegio?
            </h2>
            <p className="mx-auto mt-3 max-w-md font-400 text-white/70">
              Coordinamos una demo con la institución. El acceso de familias y docentes es por
              invitación del colegio.
            </p>
            <div className="mt-8 flex justify-center">
              <PillCTA href="/#contacto" tone="cta">Solicitar una demo</PillCTA>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
