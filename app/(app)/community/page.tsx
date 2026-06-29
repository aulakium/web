import { Icon } from "@/components/icons";
import { getPeople, personSubtitle } from "@/lib/people";
import { ROLE_COLOR } from "@/lib/posts";
import { blockStudents, getIdentity } from "@/lib/identity";
import { getServerT } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";
import type { RoleKey } from "@/lib/domain";
import { ComunidadView, type DirSection } from "@/components/community/ComunidadView";

/** Secciones del directorio, en orden de jerarquía. */
const GROUPS: { key: string; titleKey: string; icon: string; roles: RoleKey[]; filterable?: boolean }[] = [
  { key: "direccion", titleKey: "dir.management", icon: "ShieldCheck", roles: ["board", "manager", "principal", "department_head", "coordinator"] },
  { key: "docentes", titleKey: "dir.teachers", icon: "GraduationCap", roles: ["teacher"], filterable: true },
  { key: "servicios", titleKey: "dir.services", icon: "Settings", roles: ["support_staff", "service_inbox"] },
  { key: "familias", titleKey: "dir.families", icon: "Users", roles: ["guardian"], filterable: true },
  { key: "alumnos", titleKey: "dir.students", icon: "Smile", roles: ["student"], filterable: true },
  { key: "transporte", titleKey: "dir.transport", icon: "Bus", roles: ["driver"] },
];

export default async function ComunidadPage() {
  await blockStudents();
  const [people, t, me] = await Promise.all([getPeople(), getServerT(), getIdentity()]);
  const isAdmin = !!me?.isAdmin;

  // Para el editor (solo admin): lista de salones del colegio.
  let allGroups: { id: string; name: string }[] = [];
  if (isAdmin) {
    const supabase = await createClient();
    const { data } = await supabase.from("groups").select("id, name").order("name");
    allGroups = (data ?? []) as { id: string; name: string }[];
  }

  const sections: DirSection[] = GROUPS.map((g) => ({
    key: g.key,
    title: t(g.titleKey),
    icon: g.icon,
    filterable: !!g.filterable,
    people: people
      .filter((p) => p.roleKey && g.roles.includes(p.roleKey))
      .map((p) => ({
        membershipId: p.membershipId,
        roleKey: p.roleKey,
        name: p.name,
        subtitle: personSubtitle(p),
        color: (p.roleKey ? ROLE_COLOR[p.roleKey] ?? "brand" : "brand") as string,
        groups: p.groups,
      })),
  })).filter((s) => s.people.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("nav.people")}</h1>
        <p className="text-sm font-500 text-ink/55">
          {people.length > 0
            ? `${people.length} ${t("community.countLabel")}`
            : t("community.subtitleEmpty")}
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="Users" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">{t("community.empty.title")}</p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            {t("community.empty.body")}
          </p>
        </div>
      ) : (
        <ComunidadView sections={sections} isAdmin={isAdmin} groups={allGroups} />
      )}
    </main>
  );
}
