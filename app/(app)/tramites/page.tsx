import { RequestsView } from "@/components/tramites/RequestsView";
import { getRequests } from "@/lib/requests";

export default async function TramitesPage() {
  const items = await getRequests();
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Trámites</h1>
        <p className="text-sm font-500 text-ink/55">
          Inasistencias, autorizaciones y comprobantes.
        </p>
      </div>
      <RequestsView items={items} />
    </main>
  );
}
