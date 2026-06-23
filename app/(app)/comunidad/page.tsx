import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { getPeople, personSubtitle, type Person } from "@/lib/people";
import { ROLE_COLOR } from "@/lib/posts";
import { blockStudents } from "@/lib/identity";
import type { RoleKey } from "@/lib/domain";

/** Secciones del directorio, en orden de jerarquía. */
const GROUPS: { title: string; roles: RoleKey[] }[] = [
  { title: "Dirección y coordinación", roles: ["board", "manager", "principal", "department_head", "coordinator"] },
  { title: "Docentes", roles: ["teacher"] },
  { title: "Administración y servicios", roles: ["support_staff", "service_inbox"] },
  { title: "Familias", roles: ["guardian"] },
  { title: "Alumnos", roles: ["student"] },
  { title: "Transporte", roles: ["driver"] },
];

export default async function ComunidadPage() {
  await blockStudents();
  const people = await getPeople();

  const sections = GROUPS.map((g) => ({
    title: g.title,
    people: people.filter((p) => p.roleKey && g.roles.includes(p.roleKey)),
  })).filter((s) => s.people.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Comunidad</h1>
        <p className="text-sm font-500 text-ink/55">
          {people.length > 0
            ? `${people.length} personas en tu colegio, según lo que te corresponde ver.`
            : "Personas del colegio."}
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="Users" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">Todavía no hay personas para mostrar</p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Cuando se sumen miembros a tu comunidad, los verás aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((s) => (
            <section key={s.title}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-base font-700 text-ink">{s.title}</h2>
                <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
                  {s.people.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.people.map((p, i) => (
                  <PersonCard key={`${p.name}-${i}`} person={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function PersonCard({ person }: { person: Person }) {
  const color = person.roleKey ? ROLE_COLOR[person.roleKey] ?? "brand" : "brand";
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] border border-ink/5 bg-white p-3 shadow-card">
      <Avatar name={person.name} color={color} />
      <div className="min-w-0">
        <p className="truncate text-sm font-700 text-ink">{person.name}</p>
        <p className="truncate text-xs font-600 text-ink/50">{personSubtitle(person)}</p>
      </div>
    </div>
  );
}
