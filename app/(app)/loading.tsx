/**
 * Estado de carga instantáneo del shell logueado. Next.js lo muestra apenas se
 * navega (la página "cambia primero"), mientras se renderiza el contenido real.
 * El rail/topbar quedan fijos (están en el layout); solo se reemplaza esto.
 */
export default function AppLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8" aria-busy>
      <span className="sr-only">Cargando…</span>

      {/* Encabezado */}
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-44 rounded-lg bg-ink/10" />
        <div className="mt-2 h-4 w-64 rounded-lg bg-ink/5" />
      </div>

      {/* Tarjetas placeholder */}
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-[1.5rem] border border-ink/5 bg-white p-5 shadow-card"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-ink/10" />
              <div className="min-w-0 flex-1">
                <div className="h-3.5 w-32 rounded bg-ink/10" />
                <div className="mt-2 h-3 w-20 rounded bg-ink/5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-ink/10" />
              <div className="h-3.5 w-1/2 rounded bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
