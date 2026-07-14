import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/identity";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";
import { getStructure } from "@/lib/structure";
import { InviteForm } from "@/components/settings/InviteForm";
import { MembersList, type Member } from "@/components/settings/MembersList";
import { revokeInvitation, resendInvitation } from "./actions";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/SubmitButton";

// Esta sección es "Staff": las familias (guardian) se gestionan en "Alumnos y
// familias". Por eso guardian no está entre los roles invitables acá.
const INVITABLE: RoleKey[] = [
  "principal", "coordinator", "support_staff", "teacher", "driver",
];

export default async function StaffPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: invites }, { data: members }, structure] = await Promise.all([
    supabase
      .from("invitations")
      .select("id, email, full_name, role_key, status, created_at")
      .eq("status", "pending")
      .neq("role_key", "guardian")
      .order("created_at", { ascending: false }),
    supabase.rpc("members_admin"),
    getStructure(),
  ]);

  const roleOptions = INVITABLE.map((r) => ({ value: r, label: ROLE_LABELS[r] }));
  // Solo staff: las familias/alumnos viven en su propia sección.
  const staff = ((members ?? []) as Member[]).filter(
    (m) => m.role_key !== "guardian" && m.role_key !== "student",
  );

  return (
    <div className="flex flex-col gap-6">
      <InviteForm roles={roleOptions} levels={structure.levels} students={[]} />

      <MembersList members={staff} levels={structure.levels} roleLabels={ROLE_LABELS} />

      <section>
        <h2 className="mb-3 font-display text-base font-700 text-ink">
          Invitaciones pendientes
          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
            {invites?.length ?? 0}
          </span>
        </h2>

        {!invites || invites.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-ink/15 bg-white px-5 py-8 text-center text-sm font-500 text-ink/50">
            No hay invitaciones pendientes.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white shadow-card">
            {invites.map((inv, i) => (
              <div
                key={inv.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                  i > 0 ? "border-t border-ink/5" : ""
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warm/40 text-requests">
                  <Icon name="Mail" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-700 text-ink">
                    {inv.full_name || inv.email}
                  </p>
                  <p className="truncate text-xs font-500 text-ink/50">
                    {inv.email} · {ROLE_LABELS[inv.role_key as RoleKey] ?? inv.role_key}
                  </p>
                </div>
                <form action={resendInvitation}>
                  <input type="hidden" name="id" value={inv.id} />
                  <SubmitButton
                    spinnerOnly
                    className="flex items-center rounded-lg px-2.5 py-1.5 text-xs font-700 text-brand transition-colors hover:bg-brand/10"
                  >
                    Reenviar
                  </SubmitButton>
                </form>
                <form action={revokeInvitation}>
                  <input type="hidden" name="id" value={inv.id} />
                  <SubmitButton
                    spinnerOnly
                    className="flex items-center rounded-lg px-2.5 py-1.5 text-xs font-700 text-ink/45 transition-colors hover:bg-rose/10 hover:text-rose"
                  >
                    Revocar
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
