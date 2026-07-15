import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { AceptarForm } from "./AceptarForm";

export default async function AceptarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <Wordmark href="/" className="mb-8 lg:hidden" />
      {user ? (
        <>
          <h1 className="font-display text-2xl font-700 text-ink">Activa tu cuenta</h1>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Crea una contraseña para entrar a tu colegio en Aulakium.
          </p>
          <AceptarForm email={user.email ?? ""} />
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-rose/15 text-rose">
            <Icon name="X" className="h-7 w-7" />
          </span>
          <h1 className="font-display text-2xl font-700 text-ink">Enlace inválido o vencido</h1>
          <p className="mt-2 text-sm font-500 text-ink/60">
            El enlace de invitación expiró o ya se usó. Pedile al colegio que te reenvíe la invitación.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep"
          >
            Ir a entrar
          </Link>
        </div>
      )}
    </div>
  );
}
