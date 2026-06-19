import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { getIdentity } from "@/lib/identity";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/login/actions";
import { ProfileEditor } from "@/components/perfil/ProfileEditor";

export default async function PerfilPage() {
  const me = await getIdentity();

  const name = me?.name ?? "Invitado";
  const role = me?.roleLabel || "—";
  const school = me?.schoolName ?? "—";
  const email = me?.email ?? "—";

  // Mis comunidades (para multi-colegio).
  let communities: { name: string }[] = [];
  if (me) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("memberships")
        .select("communities(name)")
        .eq("user_id", user.id)
        .eq("status", "active");
      communities = (data ?? [])
        .map((m) => {
          const c = m.communities as { name: string } | { name: string }[] | null;
          return Array.isArray(c) ? c[0] : c;
        })
        .filter(Boolean) as { name: string }[];
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Mi perfil</h1>
        <p className="text-sm font-500 text-ink/55">Tus datos en {school}.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Encabezado */}
        <section className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-card">
          <div className="relative bg-gradient-to-br from-navy to-navy-deep px-6 py-7 sm:px-8">
            <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
            <div className="relative flex items-center gap-4">
              <Avatar name={name} color="brand" size="lg" ring />
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-700 text-white">{name}</p>
                <p className="text-sm font-600 text-white/70">
                  {role} · {school}
                </p>
              </div>
            </div>
          </div>
          <dl className="divide-y divide-ink/8">
            <Row icon="ShieldCheck" label="Rol" value={role} />
            <Row icon="Mail" label="Correo" value={email} />
          </dl>
        </section>

        {/* Editor: nombre + idioma */}
        <ProfileEditor fullName={me?.name ?? ""} uiLocale={me?.uiLocale ?? null} />

        {/* Mis comunidades */}
        <section className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
          <h2 className="mb-1 font-display text-base font-700 text-ink">Mis comunidades</h2>
          <p className="mb-3 text-xs font-500 text-ink/50">
            Los colegios a los que perteneces.
          </p>
          <div className="flex flex-col gap-2">
            {communities.map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl bg-[#f1f5fa] px-4 py-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-sky text-white">
                  <Icon name="GraduationCap" className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-700 text-ink">{c.name}</span>
                <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-700 text-leaf">
                  Activo
                </span>
              </div>
            ))}
          </div>
          {communities.length === 1 ? (
            <p className="mt-3 text-xs font-500 text-ink/40">
              Cuando pertenezcas a más de un colegio, vas a poder cambiar entre ellos desde acá.
            </p>
          ) : null}
        </section>

        {/* Cerrar sesión */}
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-rose/30 px-4 py-2.5 text-sm font-700 text-rose transition-colors hover:bg-rose/10"
          >
            <Icon name="LogOut" className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 sm:px-8">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f1f5fa] text-ink/55">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <dt className="w-24 shrink-0 text-sm font-500 text-ink/50">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-sm font-700 text-ink">{value}</dd>
    </div>
  );
}
