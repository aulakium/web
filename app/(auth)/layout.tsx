import { Wordmark } from "@/components/Wordmark";

/**
 * Layout de las pantallas SIN sesión (login, recuperar). Pantalla partida:
 * panel de marca navy a la izquierda + formulario a la derecha. En móvil, solo el form.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-navy to-navy-deep p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-cta/15 blur-3xl" />

        <Wordmark theme="dark" href="/" className="relative" />

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-700 leading-tight">
            La comunidad escolar, conectada en un solo lugar.
          </h2>
          <p className="mt-3 text-white/70">
            Avisos, calendario, mensajes y solicitudes entre el colegio, las
            familias y los docentes. Claro, ordenado y en tu idioma.
          </p>
        </div>

        <p className="relative text-sm text-white/50">
          © {2026} Aulakium · Plataforma de comunicación escolar
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
