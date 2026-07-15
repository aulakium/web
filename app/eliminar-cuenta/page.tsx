import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";

export const metadata = {
  title: "Eliminar tu cuenta",
  description: "Cómo eliminar tu cuenta de Aulakium y qué datos se borran.",
};

export default function EliminarCuentaPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-700 text-ink/55 transition-colors hover:text-ink"
      >
        <Icon name="ChevronLeft" className="h-4 w-4" /> Volver
      </Link>
      <Wordmark href="/" className="mb-8" />

      <h1 className="font-display text-3xl font-700 text-ink">Eliminar tu cuenta</h1>
      <p className="mt-2 text-sm font-500 text-ink/55">
        Aplica a la cuenta de Aulakium (com.aulakium.app).
      </p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-ink/75">
        <Block title="Desde la app (recomendado)">
          <p>
            Puedes eliminar tu cuenta en cualquier momento, sin pasar por soporte:
          </p>
          <ol className="ml-5 mt-2 list-decimal space-y-1.5">
            <li>Abre Aulakium e inicia sesión.</li>
            <li>Ve a <strong>Perfil</strong>.</li>
            <li>Toca <strong>Eliminar mi cuenta</strong> y confirma.</li>
          </ol>
          <p className="mt-2">La eliminación es inmediata y permanente.</p>
        </Block>

        <Block title="Si no puedes acceder a la app">
          <p>
            Escríbenos desde el correo de tu cuenta a{" "}
            <a className="font-700 text-brand hover:text-ink" href="mailto:hola@aulakium.com?subject=Eliminar%20mi%20cuenta">
              hola@aulakium.com
            </a>{" "}
            con el asunto «Eliminar mi cuenta» y la procesamos en un máximo de 30 días.
          </p>
        </Block>

        <Block title="Qué datos se eliminan">
          <p>
            Se borran tu cuenta y tus datos personales: tu membresía, los vínculos
            familiares, tus preferencias y el token de notificaciones de tus
            dispositivos. El contenido institucional (avisos, mensajes y comentarios)
            puede conservarse de forma <strong>anonimizada</strong> para no afectar la
            comunicación del colegio. Los datos académicos del alumno los administra el
            colegio bajo su responsabilidad.
          </p>
        </Block>

        <p className="text-sm font-500 text-ink/55">
          Más detalles en nuestra{" "}
          <Link className="font-700 text-brand hover:text-ink" href="/privacidad">
            política de privacidad
          </Link>.
        </p>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-700 text-ink">{title}</h2>
      {children}
    </section>
  );
}
