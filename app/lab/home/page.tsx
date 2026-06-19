import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/landing/Reveal";
import { HeroMessages } from "@/components/landing/HeroMessages";
import { Wordmark } from "@/components/Wordmark";

/* ── Marca (manzana naranja + wordmark cursivo) ── */
function Brand({ dark = false }: { dark?: boolean }) {
  return <Wordmark theme={dark ? "dark" : "light"} />;
}

/* ── Placeholder de imagen 100% local (gradiente + patrón + icono). ── */
const GRADS = [
  "from-navy via-ink to-brand",
  "from-brand to-sky",
  "from-ink to-navy-deep",
  "from-sky via-brand to-navy",
  "from-navy to-brand",
];
function Ph({
  className = "",
  v = 0,
  icon = "GraduationCap",
  rounded = "rounded-3xl",
}: {
  className?: string;
  v?: number;
  icon?: string;
  rounded?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${rounded} bg-gradient-to-br ${GRADS[v % GRADS.length]} ${className}`}>
      <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      <Icon name={icon} className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/25" />
      <span className="absolute bottom-3 right-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-700 text-white/80 backdrop-blur">
        Foto
      </span>
    </div>
  );
}

/* ── Botón pill con círculo de flecha (estilo Autoguru) ── */
function PillCTA({ href, children, tone = "cta" }: { href: string; children: React.ReactNode; tone?: "cta" | "light" | "ink" }) {
  const map = {
    cta: "bg-cta text-white hover:bg-cta-deep",
    light: "bg-white text-ink hover:bg-mist",
    ink: "bg-ink text-white hover:bg-navy-deep",
  } as const;
  const circle = { cta: "bg-white/20", light: "bg-ink text-white", ink: "bg-white/20" } as const;
  return (
    <a href={href} className={`group inline-flex items-center gap-2 rounded-full py-2 pl-6 pr-2 text-sm font-700 shadow-soft transition-colors ${map[tone]}`}>
      {children}
      <span className={`grid h-9 w-9 place-items-center rounded-full ${circle[tone]} transition-transform group-hover:translate-x-0.5`}>
        <Icon name="ArrowRight" className="h-4 w-4" />
      </span>
    </a>
  );
}

const FEATURES = [
  { icon: "Megaphone", title: "Novedades", text: "Avisos del colegio con foto, likes y comentarios, segmentados por curso." },
  { icon: "CalendarDays", title: "Calendario", text: "Exámenes, eventos y vacaciones en un calendario claro y compartido." },
  { icon: "MessagesSquare", title: "Mensajes", text: "Conversaciones entre familias y docentes, siempre dentro de cada salón." },
  { icon: "ClipboardList", title: "Trámites", text: "Inasistencias, autorizaciones y comprobantes, sin papeles." },
  { icon: "FolderClosed", title: "Documentos", text: "Boletines, circulares y protocolos ordenados y a un clic." },
  { icon: "Bus", title: "Transporte", text: "Seguimiento del camión escolar en vivo y avisos de subida y bajada." },
];
const STATS = [
  { n: "+120", l: "Colegios conectados" },
  { n: "+30 mil", l: "Familias activas" },
  { n: "98%", l: "Avisos leídos" },
  { n: "4.9/5", l: "Satisfacción" },
];
const PLANES = [
  { name: "Demo", price: "$0", per: "para probar", feats: ["Hasta 1 salón", "Novedades y calendario", "Soporte por correo"] },
  { name: "Escuela", price: "$XX", per: "por mes", feats: ["Salones ilimitados", "Mensajes y trámites", "Multi-idioma", "Soporte prioritario"], best: true },
  { name: "Institución", price: "A medida", per: "varios colegios", feats: ["Todo lo de Escuela", "Transporte en vivo", "Integraciones", "Gestor dedicado"] },
];
const POSTS = [
  { tag: "Comunidad", title: "5 ideas para que las familias lean tus avisos", date: "10 jun 2026" },
  { tag: "Gestión", title: "Cómo organizar el calendario escolar del trimestre", date: "03 jun 2026" },
  { tag: "Tecnología", title: "Adiós a los grupos de WhatsApp del colegio", date: "28 may 2026" },
];

export default function LabHome() {
  return (
    <div className="min-h-dvh bg-white text-ink antialiased">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Brand />
          <ul className="hidden items-center gap-8 text-sm font-600 text-ink/70 md:flex">
            <li><a href="#funciones" className="transition-colors hover:text-brand">Funciones</a></li>
            <li><a href="#planes" className="transition-colors hover:text-brand">Planes</a></li>
            <li><a href="#recursos" className="transition-colors hover:text-brand">Recursos</a></li>
            <li><a href="#contacto" className="transition-colors hover:text-brand">Contacto</a></li>
          </ul>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-700 text-ink transition-colors hover:text-brand sm:block">Ingresar</Link>
            <PillCTA href="#contacto">Solicitar demo</PillCTA>
          </div>
        </nav>
      </header>

      {/* ===== Hero (a sangre, con foto también en móvil) ===== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-ink to-navy-deep" />
        <div className="absolute inset-0 -z-10 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-cta/20 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-600 text-white/85 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cta" /> Plataforma de comunicación escolar
            </span>
            <h1 className="mt-6 text-4xl font-700 leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              La comunidad escolar,{" "}
              <span className="font-hand inline-block px-1 text-[1.15em] font-700 text-sky">
                conectada
              </span>{" "}
              en un solo lugar
            </h1>
            <p className="mt-5 max-w-lg text-lg font-400 leading-relaxed text-white/70">
              Novedades, calendario, mensajes y trámites entre el colegio, las
              familias y los docentes. Claro, ordenado y en el idioma de cada país.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <PillCTA href="#contacto">Empieza hoy</PillCTA>
              <a href="#funciones" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-700 text-white/90 transition-colors hover:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Icon name="ChevronRight" className="h-4 w-4" /></span>
                Ver funciones
              </a>
            </div>
            <div className="mt-9 flex items-center gap-3">
              <div className="flex gap-0.5 text-cta">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="Star" className="h-4 w-4 fill-cta" />)}</div>
              <p className="text-sm font-600 text-white/75"><span className="font-700 text-white">4.9/5</span> · 250+ familias y docentes</p>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border-4 border-white/10 shadow-pop">
              <Image
                src="/hero-foto.webp"
                alt="Una mamá revisa los avisos del colegio desde su teléfono"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            {/* Mensajes que rotan por las esquinas de la foto */}
            <HeroMessages />
          </Reveal>
        </div>
      </section>

      {/* ===== Logos ===== */}
      <section className="border-b border-ink/5 bg-white py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-sm font-600 text-ink/40">Colegios de toda Latinoamérica confían en Colequium</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {["Colegio Las Lomas", "Instituto del Sol", "Colegio San Marcos", "Liceo Norte", "Escuela Río"].map((n) => (
              <span key={n} className="text-lg font-700 text-ink/25">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Funciones (6) ===== */}
      <section id="funciones" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-700 text-brand">Funciones</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">Todo lo del colegio, en una sola app</h2>
            <p className="mt-3 font-400 text-ink/60">Seis módulos que reemplazan los grupos de chat, los papeles y los mails perdidos.</p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="group h-full rounded-3xl border border-ink/8 bg-white p-7 transition-all hover:border-brand/30 hover:shadow-pop">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={f.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-700 text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm font-400 leading-relaxed text-ink/60">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Stats (banda navy) ===== */}
      <section className="bg-gradient-to-br from-navy to-navy-deep py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 80} className="text-center">
              <p className="text-4xl font-700 tracking-tight text-white sm:text-5xl">{s.n}</p>
              <p className="mt-1 text-sm font-500 text-white/60">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Sobre ===== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <Ph className="aspect-[6/5] w-full shadow-card" v={3} icon="Users" rounded="rounded-[2.5rem]" />
            <div className="absolute -right-4 -top-4 rounded-2xl bg-cta px-5 py-4 text-white shadow-pop">
              <p className="text-2xl font-700">+5 años</p>
              <p className="text-xs font-500 text-white/85">con colegios</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="order-1 lg:order-2">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-700 text-brand">Sobre Colequium</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">Comunicación clara para toda la comunidad</h2>
            <p className="mt-4 font-400 leading-relaxed text-ink/65">
              Reconstruimos, con tecnología y diseño modernos, la forma en que el
              colegio habla con las familias. Menos ruido, más claridad, y la
              información importante siempre a mano.
            </p>
            <ul className="mt-7 flex flex-col gap-4">
              {["Una sola app para avisos, calendario, mensajes y trámites", "Cada familia ve solo lo de sus hijos, con privacidad por diseño", "Lista para crecer a varios países e idiomas"].map((t) => (
                <li key={t} className="flex items-start gap-3 font-500 text-ink/75">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="Check" className="h-3.5 w-3.5" /></span>{t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ===== Planes ===== */}
      <section id="planes" className="bg-mist py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-700 text-brand">Planes</span>
            <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">El plan ideal para tu colegio</h2>
            <p className="mt-3 font-400 text-ink/60">Precios de referencia. El plan final se arma según el tamaño del colegio.</p>
          </Reveal>
          <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
            {PLANES.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
                <div className={`rounded-[1.75rem] p-8 ${p.best ? "bg-gradient-to-br from-navy to-navy-deep text-white shadow-pop lg:-translate-y-4" : "border border-ink/8 bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-700 ${p.best ? "text-white/70" : "text-ink/50"}`}>{p.name}</span>
                    {p.best && <span className="rounded-full bg-cta px-3 py-1 text-xs font-700 text-white">Más elegido</span>}
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className={`text-4xl font-700 ${p.best ? "text-white" : "text-ink"}`}>{p.price}</span>
                    <span className={`mb-1 text-sm font-500 ${p.best ? "text-white/60" : "text-ink/45"}`}>/ {p.per}</span>
                  </div>
                  <ul className="mt-7 flex flex-col gap-3.5">
                    {p.feats.map((f) => (
                      <li key={f} className={`flex items-center gap-3 text-sm font-500 ${p.best ? "text-white/85" : "text-ink/70"}`}>
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.best ? "bg-cta text-white" : "bg-brand/15 text-brand"}`}><Icon name="Check" className="h-3 w-3" /></span>{f}
                      </li>
                    ))}
                  </ul>
                  <a href="#contacto" className={`mt-8 block rounded-full py-3.5 text-center text-sm font-700 transition-colors ${p.best ? "bg-cta text-white hover:bg-cta-deep" : "bg-ink text-white hover:bg-navy-deep"}`}>Solicitar demo</a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonio ===== */}
      <section className="bg-white py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <Icon name="Quote" className="mx-auto h-10 w-10 text-brand/25" />
          <p className="mt-5 text-2xl font-600 leading-snug tracking-tight text-ink sm:text-3xl">
            &ldquo;Desde que usamos Colequium, las familias se enteran de todo y dejamos
            atrás el caos de los grupos de WhatsApp. La comunicación del colegio cambió por completo.&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-sm font-700 text-white">MS</span>
            <div className="text-left">
              <p className="text-sm font-700 text-ink">Mariana Saldaña</p>
              <p className="text-xs font-500 text-ink/55">Directora · Colegio Las Lomas</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Recursos ===== */}
      <section id="recursos" className="bg-mist py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-700 text-brand">Recursos</span>
              <h2 className="mt-4 text-3xl font-700 tracking-tight text-ink sm:text-4xl">Ideas para tu comunidad</h2>
            </div>
            <a href="#" className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-700 text-ink transition-colors hover:border-brand/40 hover:text-brand">Ver todo</a>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {POSTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <article className="group overflow-hidden rounded-3xl border border-ink/8 bg-white transition-all hover:shadow-pop">
                  <Ph className="aspect-[16/10] w-full" v={i + 1} icon="Sparkles" rounded="rounded-none" />
                  <div className="p-6">
                    <span className="text-xs font-700 text-cta">{p.tag}</span>
                    <h3 className="mt-2 text-lg font-700 leading-snug text-ink">{p.title}</h3>
                    <p className="mt-3 text-xs font-500 text-ink/45">{p.date}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="contacto" className="bg-white px-5 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy to-navy-deep px-6 py-14 text-center sm:px-14">
            <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 -z-10 h-64 w-64 rounded-full bg-cta/20 blur-3xl" />
            <h2 className="mx-auto max-w-xl text-3xl font-700 tracking-tight text-white sm:text-4xl">¿Listo para conectar tu colegio?</h2>
            <p className="mx-auto mt-3 max-w-md font-400 text-white/70">Déjanos tus datos y coordinamos una demo. El acceso de familias y docentes es por invitación del colegio.</p>
            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="email" required placeholder="Correo del colegio" className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-sm font-500 text-ink outline-none placeholder:text-ink/40" />
              <button type="submit" className="rounded-full bg-cta px-6 py-3.5 text-sm font-700 text-white transition-colors hover:bg-cta-deep">Solicitar demo</button>
            </form>
          </div>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-gradient-to-br from-navy to-navy-deep text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Brand dark />
            <p className="mt-4 max-w-xs text-sm font-400 text-white/55">La comunidad escolar, conectada en un solo lugar. Para LatAm y Brasil.</p>
          </div>
          {[
            { h: "Producto", items: ["Funciones", "Planes", "Novedades", "Seguridad"] },
            { h: "Empresa", items: ["Sobre Colequium", "Recursos", "Contacto", "Trabaja con nosotros"] },
            { h: "Legal", items: ["Privacidad", "Términos", "Datos de menores"] },
          ].map((col) => (
            <div key={col.h}>
              <h3 className="text-sm font-700 text-white">{col.h}</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm font-400 text-white/55">
                {col.items.map((it) => <li key={it}><a href="#" className="transition-colors hover:text-white">{it}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm font-400 text-white/45 sm:flex-row">
            <p>© 2026 Colequium · Comunicación escolar</p>
            <span className="flex items-center gap-2"><Icon name="Mail" className="h-4 w-4" /> hola@colequium.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
