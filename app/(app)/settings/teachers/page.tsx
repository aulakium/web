import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/identity";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { StaffGroupPicker } from "@/components/settings/StaffGroupPicker";
import { unassignGroup } from "./actions";

/** Roles de staff a los que tiene sentido asignarles salones. */
const STAFF_ROLES: RoleKey[] = [
  "teacher", "coordinator", "principal", "support_staff", "department_head",
];

interface StaffRow {
  id: string;
  users: { full_name: string | null; email: string | null } | null;
  membership_roles: { roles: { key: string | null } | null }[] | null;
  staff_group_assignments: { group_id: string; groups: { name: string | null } | null }[] | null;
}

export default async function DocentesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: rows }, { data: groups }] = await Promise.all([
    supabase
      .from("memberships")
      .select(
        "id, users(full_name, email), membership_roles(roles(key)), staff_group_assignments(group_id, groups(name))",
      )
      .eq("status", "active"),
    supabase.from("groups").select("id, name").order("name"),
  ]);

  const groupOptions = (groups ?? []).map((g) => ({
    value: g.id as string,
    label: g.name as string,
  }));

  // Solo staff con rol asignable a salones.
  const staff = ((rows ?? []) as unknown as StaffRow[])
    .map((m) => {
      const roleKeys = (m.membership_roles ?? [])
        .map((mr) => mr.roles?.key)
        .filter(Boolean) as RoleKey[];
      const primary = roleKeys.find((k) => STAFF_ROLES.includes(k)) ?? null;
      return {
        membershipId: m.id,
        name: m.users?.full_name || m.users?.email || "Sin nombre",
        roleKey: primary,
        assignments: (m.staff_group_assignments ?? []).map((a) => ({
          groupId: a.group_id,
          groupName: a.groups?.name ?? "—",
        })),
      };
    })
    .filter((m) => m.roleKey !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-base font-700 text-ink">Docentes y equipo</h2>
        <p className="text-sm font-500 text-ink/55">
          Asigna los salones de cada docente. Solo verán y podrán publicar a los
          salones que tengan asignados. Para sumar a alguien nuevo, usa{" "}
          <span className="font-700 text-ink/70">Personas</span>.
        </p>
      </div>

      {staff.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-ink/15 bg-white px-5 py-10 text-center text-sm font-500 text-ink/50">
          Todavía no hay docentes activos. Invítalos desde Personas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {staff.map((m) => (
            <div
              key={m.membershipId}
              className="rounded-[1.25rem] border border-ink/8 bg-white p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <Avatar name={m.name} color="brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-700 text-ink">{m.name}</p>
                  <p className="truncate text-xs font-600 text-ink/50">
                    {m.roleKey ? ROLE_LABELS[m.roleKey] : "Equipo"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-[11px] font-700 text-ink/50">
                  {m.assignments.length} {m.assignments.length === 1 ? "salón" : "salones"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {m.assignments.length === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-600 text-ink/40">
                    <Icon name="Tag" className="h-3.5 w-3.5" />
                    Sin salones asignados
                  </span>
                ) : (
                  m.assignments.map((a) => (
                    <SalonChip
                      key={a.groupId}
                      membershipId={m.membershipId}
                      groupId={a.groupId}
                      label={a.groupName}
                    />
                  ))
                )}
                <StaffGroupPicker
                  membershipId={m.membershipId}
                  groups={groupOptions.filter(
                    (g) => !m.assignments.some((a) => a.groupId === g.value),
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalonChip({
  membershipId,
  groupId,
  label,
}: {
  membershipId: string;
  groupId: string;
  label: string;
}) {
  return (
    <form action={unassignGroup} className="inline-flex">
      <input type="hidden" name="membershipId" value={membershipId} />
      <input type="hidden" name="groupId" value={groupId} />
      <button
        type="submit"
        className="group inline-flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-3 pr-2 text-xs font-700 text-brand transition-colors hover:bg-rose/10 hover:text-rose"
        title="Quitar salón"
      >
        {label}
        <Icon name="X" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
      </button>
    </form>
  );
}
