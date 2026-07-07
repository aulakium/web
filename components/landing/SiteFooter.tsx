import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { SHOW_PRICING } from "@/lib/site-flags";

const HREFS: Record<string, string> = {
  "¿Por qué Colequium": "/por-que-colequium",
  Funciones: "/#funciones",
  Planes: "/#planes",
  Recursos: "/#recursos",
  Novedades: "/blog",
  Contacto: "mailto:hola@colequium.com",
  Privacidad: "/privacidad",
  Términos: "/terminos",
};

/** Pie de página compartido del sitio público. */
export function SiteFooter() {
  const cols = [
    {
      h: "Producto",
      items: ["¿Por qué Colequium", "Funciones", "Planes", "Novedades"].filter(
        (x) => SHOW_PRICING || x !== "Planes",
      ),
    },
    { h: "Empresa", items: ["Recursos", "Contacto", "Trabaja con nosotros"] },
    { h: "Legal", items: ["Privacidad", "Términos", "Datos de menores"] },
  ];
  return (
    <footer className="bg-gradient-to-br from-navy to-navy-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark theme="dark" />
          <p className="mt-4 max-w-xs text-sm font-400 text-white/55">
            <span className="font-700 text-white/85">Todo el colegio en una app que da gusto usar.</span>{" "}
            Simple, fácil y completa.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.h}>
            <h3 className="text-sm font-700 text-white">{col.h}</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm font-400 text-white/55">
              {col.items.map((it) => (
                <li key={it}>
                  <a href={HREFS[it] ?? "#"} className="transition-colors hover:text-white">
                    {it}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm font-400 text-white/45 sm:flex-row">
          <p>© 2026 Colequium · Comunicación escolar</p>
          <span className="flex items-center gap-2"><Icon name="Mail" className="h-4 w-4" /> hola@colequium.com</span>
        </div>
      </div>
    </footer>
  );
}
