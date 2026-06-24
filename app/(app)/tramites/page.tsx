import { RequestsView } from "@/components/tramites/RequestsView";
import { getRequests } from "@/lib/requests";
import { blockStudents, getIdentity } from "@/lib/identity";

export default async function TramitesPage() {
  await blockStudents();
  const [items, me] = await Promise.all([getRequests(), getIdentity()]);
  // Dirección/gestión no inicia trámites de alumno (inasistencias, salidas): los gestiona.
  const canCreate = !me?.isAdmin;
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Trámites</h1>
        <p className="text-sm font-500 text-ink/55">
          {canCreate
            ? "Inasistencias, autorizaciones y comprobantes."
            : "Inasistencias y trámites de la comunidad para gestionar."}
        </p>
      </div>
      <RequestsView items={items} canCreate={canCreate} />
    </main>
  );
}
