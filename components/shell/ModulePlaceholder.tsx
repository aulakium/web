import { Icon } from "../icons";

/**
 * Estado "próximamente" para módulos aún sin construir. Diseñado a propósito
 * (no un 404): comunica qué traerá el módulo. Evita rutas rotas en la demo.
 */
export function ModulePlaceholder({
  icon,
  title,
  subtitle,
  features,
}: {
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{title}</h1>
        <p className="text-sm font-500 text-ink/55">{subtitle}</p>
      </div>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white p-8 shadow-card sm:p-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative flex flex-col items-start gap-5">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-sky text-white shadow-soft">
            <Icon name={icon} className="h-7 w-7" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-700 text-brand">
              <Icon name="Sparkles" className="h-3.5 w-3.5" />
              Próximamente
            </span>
            <h2 className="mt-3 font-display text-xl font-700 text-ink">
              Estamos construyendo esta sección
            </h2>
            <p className="mt-1 max-w-lg text-sm font-500 text-ink/60">
              Va a estar disponible muy pronto. Esto es lo que podrás hacer aquí:
            </p>
          </div>

          <ul className="grid w-full gap-2.5 sm:grid-cols-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 rounded-2xl bg-[#f1f5fa] px-4 py-3 text-sm font-600 text-ink/75"
              >
                <Icon name="CircleCheck" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
