import { Reveal } from "@/components/landing/Reveal";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PillCTA } from "@/components/landing/PillCTA";
import { FeaturesExplorer } from "@/components/landing/FeaturesExplorer";

export const metadata = {
  title: "Ventajas",
  description:
    "Todo lo del colegio en una sola app. Explorá las ventajas de Aulakium por audiencia: para el colegio, para docentes y para las familias.",
};

export default function VentajasPage() {
  return (
    <div className="min-h-dvh bg-white text-ink antialiased">
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-ink to-navy-deep" />
        <div className="absolute inset-0 -z-10 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-cta/20 blur-3xl" />

        <div className="mx-auto max-w-3xl px-5 py-16 text-center text-white lg:py-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-600 text-white/85 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cta" /> Ventajas
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-700 leading-[1.1] tracking-tight sm:text-5xl">
              Todo lo del colegio,{" "}
              <span className="font-hand inline-block px-1 text-[1.12em] text-sky">en una sola app</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg font-400 leading-relaxed text-white/75">
              Nueve módulos que reemplazan los grupos de chat, los papeles y los mails perdidos.
              Filtrá según a quién le aportan: el colegio, los docentes o las familias.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== Explorador filtrable ===== */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FeaturesExplorer />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-white px-5 pb-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy to-navy-deep px-6 py-14 text-center sm:px-14">
            <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 -z-10 h-64 w-64 rounded-full bg-cta/20 blur-3xl" />
            <h2 className="mx-auto max-w-xl text-3xl font-700 tracking-tight text-white sm:text-4xl">
              ¿Listo para conectar tu colegio?
            </h2>
            <p className="mx-auto mt-3 max-w-md font-400 text-white/70">
              Coordinamos una demo con la institución. El acceso de familias y docentes es por
              invitación del colegio.
            </p>
            <div className="mt-8 flex justify-center">
              <PillCTA href="/#contacto">Solicitar una demo</PillCTA>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
