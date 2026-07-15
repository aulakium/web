import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Wordmark } from "@/components/Wordmark";
import { Reveal } from "@/components/landing/Reveal";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Ideas para tu comunidad — Aulakium",
  description: "Notas sobre comunicación escolar, organización y comunidad para colegios de LatAm y Brasil.",
};

export default function BlogIndex() {
  return (
    <div className="min-h-dvh bg-white text-ink antialiased">
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Wordmark href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-700 text-ink/70 transition-colors hover:text-brand"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" /> Inicio
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:pt-16">
        <Reveal>
          <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-700 text-brand">Recursos</span>
          <h1 className="mt-4 font-display text-4xl font-700 tracking-tight text-ink sm:text-5xl">
            Ideas para tu comunidad
          </h1>
          <p className="mt-3 max-w-xl font-400 text-ink/60">
            Notas cortas sobre comunicación escolar, organización y cómo acercar al colegio con las familias.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block h-full overflow-hidden rounded-3xl border border-ink/8 bg-white transition-all hover:shadow-pop"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-navy via-ink to-brand">
                  {p.hasCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover} alt={p.coverAlt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
                      <Icon name="Sparkles" className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/30" />
                    </>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-700 text-cta">{p.tag}</span>
                  <h2 className="mt-2 text-lg font-700 leading-snug text-ink group-hover:text-brand">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm font-400 leading-relaxed text-ink/60">{p.excerpt}</p>
                  <p className="mt-3 text-xs font-500 text-ink/45">
                    {p.date} · {p.readMins} min
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}
