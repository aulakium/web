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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://loremflickr.com/900/1200/school,children?lock=41"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/80 to-navy-deep/95" />

        <Wordmark theme="dark" className="relative" />

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-800 leading-tight">
            La comunidad escolar, conectada en un solo lugar.
          </h2>
          <p className="mt-3 text-white/70">
            Avisos, calendario, mensajes y trámites entre el colegio, las
            familias y los docentes — claro, ordenado y en tu idioma.
          </p>
        </div>

        <p className="relative text-sm text-white/50">
          © {2026} Colequium · Plataforma de comunicación escolar
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
