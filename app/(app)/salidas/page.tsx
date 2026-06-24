import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { getIdentity } from "@/lib/identity";
import { getSalidas } from "@/lib/pickups";
import { SalidasView } from "@/components/salidas/SalidasView";

export default async function SalidasPage() {
  const me = await getIdentity();
  // Solo docentes y dirección/gestión.
  if (!me || !(me.isAdmin || me.roleKey === "teacher")) redirect("/inicio");

  const students = await getSalidas();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Salidas</h1>
        <p className="text-sm font-500 text-ink/55">
          Quién puede retirar a cada alumno hoy. Mostramos solo los cambios del día;
          usa el buscador para consultar a cualquier alumno.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="DoorOpen" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">
            Todavía no hay alumnos para mostrar
          </p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Cuando haya alumnos inscritos en tus grupos, vas a ver aquí quién puede retirarlos.
          </p>
        </div>
      ) : (
        <SalidasView students={students} />
      )}
    </main>
  );
}
