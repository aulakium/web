import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { getIdentity } from "@/lib/identity";
import { getSalidas, type SalidaStudent } from "@/lib/pickups";

export default async function SalidasPage() {
  const me = await getIdentity();
  // Solo docentes y dirección/gestión.
  if (!me || !(me.isAdmin || me.roleKey === "teacher")) redirect("/inicio");

  const students = await getSalidas();
  const salones = [...new Set(students.map((s) => s.group))].sort();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Salidas</h1>
        <p className="text-sm font-500 text-ink/55">
          Quién está autorizado a retirar a cada alumno hoy.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="DoorOpen" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">Todavía no hay alumnos para mostrar</p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Cuando haya alumnos inscriptos en tus grupos, vas a ver acá quién puede retirarlos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {salones.map((salon) => (
            <section key={salon}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-base font-700 text-ink">{salon}</h2>
                <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
                  {students.filter((s) => s.group === salon).length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {students.filter((s) => s.group === salon).map((s) => (
                  <StudentCard key={s.name} s={s} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function StudentCard({ s }: { s: SalidaStudent }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ink/5 bg-white shadow-card">
      {s.absentToday ? (
        <div className="flex items-center gap-1.5 bg-rose/10 px-4 py-2 text-xs font-700 text-rose">
          <Icon name="CalendarX" className="h-4 w-4" />
          No asistió al colegio hoy
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={s.name} color="sky" />
          <div className="min-w-0">
            <p className="truncate text-sm font-700 text-ink">{s.name}</p>
            <p className="truncate text-xs font-600 text-ink/50">{s.group}</p>
          </div>
        </div>

        <p className="mb-2 mt-4 text-[11px] font-700 uppercase tracking-wide text-ink/40">
          Pueden retirarlo
        </p>
        {s.pickups.length === 0 ? (
          <p className="text-xs font-600 text-ink/40">Sin autorizados cargados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {s.pickups.map((p, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <Avatar name={p.name} color={p.kind === "temporary" ? "requests" : "sky"} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-700 text-ink">{p.name}</span>
                  <span className="block text-xs font-600 text-ink/50">{p.relationship}</span>
                </span>
                {p.kind === "temporary" ? (
                  <span className="shrink-0 rounded-full bg-cta/10 px-2.5 py-1 text-[11px] font-700 text-cta">
                    Solo hoy
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-leaf/15 px-2.5 py-1 text-[11px] font-700 text-leaf">
                    Siempre
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
