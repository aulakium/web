import { LocaleProvider } from "@/components/locale-context";
import { IdentityProvider } from "@/components/identity-context";
import { RailSidebar } from "@/components/shell/RailSidebar";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { MobileNav } from "@/components/shell/MobileNav";
import { ChildFilterBar } from "@/components/shell/ChildFilterBar";
import { getIdentity } from "@/lib/identity";
import { getChildFilter } from "@/lib/child-filter";
import { LOCALES, type Locale } from "@/lib/i18n";

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
  const [identity, childFilter] = await Promise.all([getIdentity(), getChildFilter()]);
  const codes = LOCALES.map((l) => l.code) as string[];
  const initialLocale: Locale =
    identity?.uiLocale && codes.includes(identity.uiLocale)
      ? (identity.uiLocale as Locale)
      : "es-MX";

  return (
    <LocaleProvider initial={initialLocale}>
      <IdentityProvider value={identity}>
        <div className="flex min-h-dvh bg-[#f1f5fa]">
          <RailSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar />
            <ChildFilterBar courses={childFilter.courses} active={childFilter.active} />
            <div className="flex-1">{children}</div>
            <MobileNav />
          </div>
        </div>
      </IdentityProvider>
    </LocaleProvider>
  );
}
