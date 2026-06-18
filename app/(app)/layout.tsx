import { LocaleProvider } from "@/components/locale-context";
import { IdentityProvider } from "@/components/identity-context";
import { RailSidebar } from "@/components/shell/RailSidebar";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { MobileNav } from "@/components/shell/MobileNav";
import { getIdentity } from "@/lib/identity";

/**
 * Shell interno (estilo intranet Alliance): rail slim de íconos a la izquierda,
 * topbar compartida (buscador + idioma + notif + perfil) y bottom-nav en móvil.
 * Resuelve la identidad real del usuario logueado y la provee al árbol.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getIdentity();

  return (
    <LocaleProvider initial="es-MX">
      <IdentityProvider value={identity}>
        <div className="flex min-h-dvh bg-[#f1f5fa]">
          <RailSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar />
            <div className="flex-1">{children}</div>
            <MobileNav />
          </div>
        </div>
      </IdentityProvider>
    </LocaleProvider>
  );
}
