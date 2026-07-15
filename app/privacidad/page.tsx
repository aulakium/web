import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";

export const metadata = {
  title: "Política de privacidad",
  description: "Cómo Aulakium trata los datos de colegios, familias y docentes.",
};

const UPDATED = "30 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-700 text-ink/55 transition-colors hover:text-ink"
      >
        <Icon name="ChevronLeft" className="h-4 w-4" /> Volver
      </Link>
      <Wordmark href="/" className="mb-8" />

      <h1 className="font-display text-3xl font-700 text-ink">Política de privacidad</h1>
      <p className="mt-2 text-sm font-500 text-ink/55">Última actualización: {UPDATED}</p>

      <div className="legal mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-ink/75">
        <section>
          <p>
            Aulakium es una plataforma de comunicación escolar que usan los colegios para
            comunicarse con las familias y los docentes. Esta política explica qué datos
            tratamos, con qué fin y qué derechos tienes. Para los datos de los alumnos, el
            <strong> colegio es el responsable</strong> y Aulakium actúa como{" "}
            <strong>encargado del tratamiento</strong> en su nombre.
          </p>
        </section>

        <Block title="1. Qué datos tratamos">
          <ul className="ml-5 list-disc space-y-1.5">
            <li><strong>Cuenta:</strong> nombre, correo electrónico, rol e idioma preferido.</li>
            <li><strong>Datos académicos (provistos por el colegio):</strong> nombre del alumno, grado y salón, inscripción, y el vínculo familiar (relación y permisos como retirar o justificar inasistencias).</li>
            <li><strong>Contenido que generas:</strong> avisos, comentarios, mensajes, confirmaciones de asistencia, tareas y lecturas.</li>
            <li><strong>Datos técnicos:</strong> token del dispositivo para notificaciones push y cookies de sesión para mantenerte conectado.</li>
          </ul>
        </Block>

        <Block title="2. Para qué los usamos">
          <p>
            Únicamente para prestar el servicio: mostrarte lo que te corresponde según tu rol,
            enviar avisos y mensajes, gestionar tareas y eventos, y notificarte. <strong>No
            vendemos tus datos, no hacemos publicidad ni seguimiento entre apps.</strong>
          </p>
        </Block>

        <Block title="3. Con quién los compartimos">
          <p>
            No compartimos datos con terceros para sus propios fines. Nos apoyamos en
            proveedores que los procesan por nuestra cuenta, bajo contrato y solo para operar
            el servicio:
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li><strong>Supabase</strong> — base de datos, autenticación y archivos.</li>
            <li><strong>Resend</strong> — envío de correos (invitaciones, recuperación de contraseña).</li>
            <li><strong>Firebase Cloud Messaging (Google)</strong> — entrega de notificaciones push.</li>
            <li><strong>Vercel</strong> — alojamiento de la aplicación.</li>
          </ul>
          <p className="mt-2">
            También compartimos información con el colegio del que formas parte, que es quien
            administra su comunidad.
          </p>
        </Block>

        <Block title="4. Datos de menores">
          <p>
            Los datos de los alumnos los carga y administra el colegio bajo su responsabilidad
            y con la base legal correspondiente. Las familias acceden a la información de sus
            hijos a través de su cuenta. Si eres madre, padre o tutor y quieres revisar o
            corregir datos de tu hijo/a, contacta al colegio o escríbenos.
          </p>
        </Block>

        <Block title="5. Conservación y eliminación">
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Puedes{" "}
            <strong>eliminar tu cuenta desde la app</strong> (Perfil → Eliminar mi cuenta): se
            borran tus datos personales y los vínculos asociados; el contenido institucional
            puede conservarse de forma anonimizada. El colegio también puede dar de baja
            cuentas de su comunidad.
          </p>
        </Block>

        <Block title="6. Tus derechos">
          <p>
            Puedes acceder, corregir y eliminar tus datos. Buena parte la gestionas desde tu
            perfil; para lo demás, escríbenos. Si estás en Brasil, te amparan los derechos de
            la <strong>LGPD</strong>; en otros países de la región, la normativa local de
            protección de datos aplicable.
          </p>
        </Block>

        <Block title="7. Seguridad">
          <p>
            Usamos cifrado en tránsito (HTTPS), control de acceso por rol y aislamiento de
            datos por colegio. Ningún sistema es 100% infalible, pero trabajamos para
            protegerlos.
          </p>
        </Block>

        <Block title="8. Contacto">
          <p>
            Por cualquier consulta sobre privacidad, escríbenos a{" "}
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
