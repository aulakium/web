import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";

export const metadata = {
  title: "Términos del servicio",
  description: "Condiciones de uso de la plataforma Aulakium.",
};

const UPDATED = "30 de junio de 2026";

export default function TerminosPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-700 text-ink/55 transition-colors hover:text-ink"
      >
        <Icon name="ChevronLeft" className="h-4 w-4" /> Volver
      </Link>
      <Wordmark href="/" className="mb-8" />

      <h1 className="font-display text-3xl font-700 text-ink">Términos del servicio</h1>
      <p className="mt-2 text-sm font-500 text-ink/55">Última actualización: {UPDATED}</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-ink/75">
        <Block title="1. El servicio">
          <p>
            Aulakium es una plataforma de comunicación escolar que los colegios contratan
            para comunicarse con las familias y los docentes. Al usar la aplicación, aceptas
            estos términos.
          </p>
        </Block>

        <Block title="2. Cuentas">
          <p>
            El acceso es <strong>por invitación del colegio</strong>. Eres responsable de
            mantener la confidencialidad de tu contraseña y de la actividad de tu cuenta.
            Avísanos si detectas un uso no autorizado.
          </p>
        </Block>

        <Block title="3. Uso aceptable">
          <p>Te comprometes a no usar Aulakium para:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>publicar contenido ilegal, ofensivo, acosador o que vulnere derechos de terceros;</li>
            <li>suplantar a otra persona o acceder a datos que no te corresponden;</li>
            <li>interferir con el funcionamiento o la seguridad del servicio.</li>
          </ul>
        </Block>

        <Block title="4. Contenido">
          <p>
            El contenido que cargan los colegios, las familias y los docentes les pertenece.
            Nos otorgas una licencia limitada para alojarlo y mostrarlo con el único fin de
            operar el servicio. Cada colegio es responsable del contenido de su comunidad.
          </p>
        </Block>

        <Block title="5. Disponibilidad">
          <p>
            Trabajamos para mantener el servicio disponible y seguro, pero se ofrece "tal
            cual", sin garantía de disponibilidad ininterrumpida. Podemos hacer mantenimiento
            o cambios para mejorarlo.
          </p>
        </Block>

        <Block title="6. Responsabilidad">
          <p>
            En la medida que permita la ley, Aulakium no será responsable por daños
            indirectos o incidentales derivados del uso del servicio. Aulakium es una
            herramienta de comunicación; las decisiones académicas y administrativas son del
            colegio.
          </p>
        </Block>

        <Block title="7. Baja">
          <p>
            Puedes eliminar tu cuenta en cualquier momento desde la app (Perfil → Eliminar mi
            cuenta). El colegio puede dar de baja cuentas de su comunidad. Podemos suspender
            cuentas que incumplan estos términos.
          </p>
        </Block>

        <Block title="8. Cambios">
          <p>
            Podemos actualizar estos términos. Si el cambio es relevante, lo avisaremos por
            los canales del servicio. El uso continuado implica la aceptación de la versión
            vigente.
          </p>
        </Block>

        <Block title="9. Ley aplicable">
          <p>
            Estos términos se rigen por la legislación aplicable del país donde opera el
            colegio contratante, sin perjuicio de las normas de protección al consumidor que
            correspondan.
          </p>
        </Block>

        <Block title="10. Contacto">
          <p>
            Escríbenos a{" "}
            <a className="font-700 text-brand hover:text-ink" href="mailto:hola@aulakium.com">
              hola@aulakium.com
            </a>.
          </p>
        </Block>
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
