import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { NuevaForm } from "./NuevaForm";

export default async function NuevaPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <Wordmark href="/" className="mb-8 lg:hidden" />
      {user ? (
        <>
          <h1 className="font-display text-2xl font-700 text-ink">Creá tu nueva contraseña</h1>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Para la cuenta <b>{user.email}</b>.
          </p>
          <NuevaForm />
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-rose/15 text-rose">
            <Icon name="X" className="h-7 w-7" />
          </span>
          <h1 className="font-display text-2xl font-700 text-ink">Enlace inválido o vencido</h1>
          <p className="mt-2 text-sm font-500 text-ink/60">
            El enlace de recuperación expiró o ya se usó. Pedí uno nuevo.
          </p>
          <Link
            href="/recuperar"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
    </div>
  );
}
