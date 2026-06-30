import { requireSettingsAccess } from "@/lib/identity";
import { ConfigNav } from "@/components/settings/ConfigNav";

/** Panel de Configuración. Administradores totales o coordinación (acotada). */
export default async function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireSettingsAccess();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-700 text-ink">Configuración</h1>
        <p className="text-sm font-500 text-ink/55">
          Administración de {me.schoolName}.
        </p>
      </div>
      <ConfigNav isAdmin={me.isAdmin} />
      <div className="mt-6">{children}</div>
    </main>
  );
}
