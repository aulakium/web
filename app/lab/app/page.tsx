import { Icon } from "@/components/icons";

/* Avatar de iniciales (local). */
function Av({ n, c = "bg-brand", size = "h-9 w-9 text-xs" }: { n: string; c?: string; size?: string }) {
  const ini = n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span className={`grid shrink-0 place-items-center rounded-full font-700 text-white ${c} ${size}`}>{ini}</span>;
}
/* Thumbnail placeholder local. */
function Thumb({ className = "", v = 0 }: { className?: string; v?: number }) {
  const g = ["from-navy to-brand", "from-brand to-sky", "from-ink to-navy-deep", "from-sky to-brand"];
  return <div className={`shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${g[v % g.length]} ${className}`} />;
}
/* Card de widget con encabezado + divisor (estilo Alliance). */
function Card({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(12,74,110,.25)]">
      <div className="flex items-center justify-between border-b border-ink/8 pb-3">
        <h2 className="text-lg font-700 text-ink">{title}</h2>
        {action ? <a href="#" className="text-xs font-700 uppercase tracking-wide text-brand hover:text-ink">{action}</a> : null}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

const NAV = [
  { icon: "LayoutGrid", label: "Inicio", active: true },
  { icon: "Megaphone", label: "Novedades" },
  { icon: "CalendarDays", label: "Calendario" },
  { icon: "MessagesSquare", label: "Mensajes" },
  { icon: "ClipboardList", label: "Trámites" },
  { icon: "FolderClosed", label: "Documentos" },
  { icon: "Bus", label: "Transporte" },
  { icon: "Users", label: "Comunidad" },
];
const POSTS = [
  { tag: "Dirección", title: "Jornada de puertas abiertas — sábado 14", date: "14 jun 2026", comments: 12, v: 0 },
  { tag: "6°B", title: "Salida didáctica al Museo de Ciencias", date: "12 jun 2026", comments: 7, v: 1 },
  { tag: "Primaria", title: "Resultados de la feria del libro", date: "Ayer", comments: 18, v: 2 },
];
const EVENTS = [
  { d: "12", m: "JUN", t: "Evaluación 2º trimestre", h: "Todo el día", c: "bg-cta" },
  { d: "14", m: "JUN", t: "Puertas abiertas", h: "09:00 – 12:00", c: "bg-brand" },
  { d: "19", m: "JUN", t: "Reunión de padres 6°B", h: "18:30", c: "bg-sky" },
];
const PROG = [
  { l: "6°B", p: 92, c: "bg-brand" },
  { l: "Primaria", p: 78, c: "bg-sky" },
  { l: "Institucional", p: 64, c: "bg-cta" },
];
const COMMUNITY = [
  { n: "Marina López", r: "Familia · 6°B", on: true },
  { n: "Jorge Méndez", r: "Familia · 6°B", on: false },
  { n: "Coordinación", r: "Primaria", on: true },
];
const TASKS = [
  { t: "Entregar autorización del museo", d: "Vence jueves", done: false },
  { t: "Firmar boletín del trimestre", d: "Vence 18/06", done: false },
  { t: "Traer materiales de arte", d: "Vence 20/06", done: true },
];

/* Mini calendario estático (junio 2026; 1 = lunes). */
function MiniCal() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = 9;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-700 text-ink">Junio 2026</span>
        <div className="flex gap-1 text-ink/40">
          <span className="grid h-6 w-6 place-items-center rounded-lg hover:bg-mist"><Icon name="ChevronLeft" className="h-4 w-4" /></span>
          <span className="grid h-6 w-6 place-items-center rounded-lg hover:bg-mist"><Icon name="ChevronRight" className="h-4 w-4" /></span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-700 uppercase text-ink/35">
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <span key={d} className={`grid aspect-square place-items-center rounded-lg text-xs font-600 ${
            d === today ? "bg-cta text-white" : [12, 14, 19].includes(d) ? "bg-brand/10 text-brand" : "text-ink/60 hover:bg-mist"
          }`}>{d}</span>
        ))}
      </div>
    </div>
  );
}

export default function LabApp() {
  return (
    <div className="flex min-h-dvh bg-[#f1f5fa] text-ink antialiased">
      {/* ===== Rail slim de íconos (estilo Alliance, claro) ===== */}
      <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col items-center border-r border-ink/8 bg-white py-5 md:flex">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-sky text-white shadow-soft">
          <Icon name="Sparkles" className="h-5 w-5" />
        </span>
        <nav className="mt-7 flex flex-1 flex-col items-center gap-2">
          {NAV.map((it) => (
            <a key={it.label} href="#" title={it.label}
              className={`group relative grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
                it.active ? "bg-brand text-white shadow-soft" : "text-ink/40 hover:bg-mist hover:text-ink"
              }`}>
              <Icon name={it.icon} className="h-[22px] w-[22px]" />
              <span className="pointer-events-none absolute left-14 z-20 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-600 text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100">{it.label}</span>
            </a>
          ))}
        </nav>
        <Av n="Valentina Ríos" c="bg-navy" size="h-11 w-11 text-sm" />
      </aside>

      {/* ===== Columna principal ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-ink/8 bg-white px-5 py-3.5">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Icon name="Search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input placeholder="Buscar en la comunidad…" className="w-full rounded-full bg-[#f1f5fa] py-2.5 pl-11 pr-4 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30" />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-sm font-700 text-ink"><span>🇲🇽</span> ES-MX</button>
            <button className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/10 text-ink/60">
              <Icon name="Bell" className="h-5 w-5" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cta" />
            </button>
            <div className="flex items-center gap-2.5 pl-1">
              <Av n="Valentina Ríos" c="bg-navy" />
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-700 text-ink">Valentina Ríos</p>
                <p className="text-xs font-500 text-ink/50">Tutora de 6°B</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-5 lg:p-7">
          <div className="mb-6">
            <h1 className="text-2xl font-700 tracking-tight text-ink">Hola, Valentina 👋</h1>
            <p className="text-sm font-500 text-ink/55">Esto es lo que pasa hoy en la comunidad.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr_1fr]">
            {/* Columna A */}
            <div className="flex flex-col gap-5">
              <Card title="Últimas novedades" action="Ver todo">
                <ul className="flex flex-col gap-4">
                  {POSTS.map((p) => (
                    <li key={p.title} className="flex gap-3.5">
                      <Thumb className="h-16 w-20" v={p.v} />
                      <div className="min-w-0">
                        <span className="text-[11px] font-700 uppercase tracking-wide text-brand">{p.tag} · {p.date}</span>
                        <h3 className="mt-0.5 text-sm font-700 leading-snug text-ink">{p.title}</h3>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-500 text-ink/45"><Icon name="MessageCircle" className="h-3.5 w-3.5" />{p.comments}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Comunidad" action="Ver todos">
                <div className="mb-3 flex gap-2">
                  {["Nuevos", "Activos", "Populares"].map((t, i) => (
                    <span key={t} className={`rounded-full px-3 py-1 text-xs font-700 ${i === 1 ? "bg-ink text-white" : "bg-mist text-ink/55"}`}>{t}</span>
                  ))}
                </div>
                <ul className="flex flex-col gap-3">
                  {COMMUNITY.map((m, i) => (
                    <li key={m.n} className="flex items-center gap-3">
                      <span className="relative"><Av n={m.n} c={["bg-brand", "bg-sky", "bg-cta"][i]} />{m.on && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-leaf bg-[#22c55e]" />}</span>
                      <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-700 text-ink">{m.n}</p><p className="text-xs font-500 text-ink/50">{m.r}</p></div>
                      <button className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-mist"><Icon name="MessageCircle" className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Columna B */}
            <div className="flex flex-col gap-5">
              <Card title="Próximos eventos" action="Calendario">
                <ul className="flex flex-col gap-3">
                  {EVENTS.map((e) => (
                    <li key={e.t} className="flex items-center gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl leading-none text-white ${e.c}`}>
                        <span className="text-lg font-700">{e.d}</span><span className="text-[9px] font-700 opacity-80">{e.m}</span>
                      </span>
                      <div className="min-w-0"><p className="truncate text-sm font-700 text-ink">{e.t}</p><p className="text-xs font-500 text-ink/50">{e.h}</p></div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Tareas pendientes">
                <ul className="flex flex-col gap-3">
                  {TASKS.map((t) => (
                    <li key={t.t} className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${t.done ? "border-brand bg-brand text-white" : "border-ink/20 text-transparent"}`}><Icon name="Check" className="h-3 w-3" /></span>
                      <div className="min-w-0 leading-tight">
                        <p className={`text-sm font-600 ${t.done ? "text-ink/40 line-through" : "text-ink"}`}>{t.t}</p>
                        <p className="text-xs font-500 text-cta">{t.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Columna C */}
            <div className="flex flex-col gap-5">
              <Card title="Calendario"><MiniCal /></Card>
              <Card title="Lectura de avisos">
                <ul className="flex flex-col gap-4">
                  {PROG.map((p) => (
                    <li key={p.l}>
                      <div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-600 text-ink">{p.l}</span><span className="font-700 text-ink/60">{p.p}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-mist"><div className={`h-full rounded-full ${p.c}`} style={{ width: `${p.p}%` }} /></div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
