import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { MobileMenu } from "@/components/landing/MobileMenu";
import { PillCTA } from "@/components/landing/PillCTA";
import { SHOW_PRICING } from "@/lib/site-flags";

/** Cabecera compartida del sitio público (landing + páginas de marketing).
 *  Las anclas van a "/#seccion" (absolutas) para funcionar desde cualquier página;
 *  "¿Por qué?" es una página real. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Wordmark theme="light" />
        <ul className="hidden items-center gap-8 text-sm font-600 text-ink/70 md:flex">
          <li>
            <Link href="/por-que-colequium" className="transition-colors hover:text-brand">
              ¿Por qué?
            </Link>
          </li>
          <li><a href="/#funciones" className="transition-colors hover:text-brand">Funciones</a></li>
          {SHOW_PRICING ? <li><a href="/#planes" className="transition-colors hover:text-brand">Planes</a></li> : null}
          <li><a href="/#recursos" className="transition-colors hover:text-brand">Recursos</a></li>
          <li><a href="/#contacto" className="transition-colors hover:text-brand">Contacto</a></li>
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-700 text-ink transition-colors hover:text-brand">
            Ingresar
          </Link>
          <PillCTA href="/#contacto">Solicitar demo</PillCTA>
        </div>
        <MobileMenu />
      </nav>
    </header>
  );
}
