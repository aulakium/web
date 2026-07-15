import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Wordmark } from "@/components/Wordmark";
import { Reveal } from "@/components/landing/Reveal";
import { BLOG_POSTS, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artículo — Aulakium" };
  return {
    title: `${post.title} — Aulakium`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-dvh bg-white text-ink antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Wordmark href="/" />
          <Link
            href="/#recursos"
            className="inline-flex items-center gap-1.5 text-sm font-700 text-ink/70 transition-colors hover:text-brand"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" /> Recursos
          </Link>
        </nav>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:pt-14">
        <Reveal>
          <span className="text-sm font-700 text-cta">{post.tag}</span>
          <h1 className="mt-3 font-display text-3xl font-700 leading-tight tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm font-500 text-ink/50">
            <span>{post.date}</span>
            <span className="h-1 w-1 rounded-full bg-ink/25" />
            <span>{post.readMins} min de lectura</span>
          </p>
        </Reveal>

        {/* Portada */}
        <Reveal delay={80}>
          <div className="relative mt-7 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-ink to-brand">
            {post.hasCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover} alt={post.coverAlt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
                <Icon name="Sparkles" className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/30" />
                <span className="absolute bottom-3 right-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-700 text-white/80 backdrop-blur">
                  Foto
                </span>
              </>
            )}
          </div>
        </Reveal>

        {/* Cuerpo */}
        <Reveal delay={120}>
          <p className="mt-9 text-lg font-500 leading-relaxed text-ink/80">{post.lead}</p>

          <div className="mt-8 flex flex-col gap-8">
            {post.sections.map((s, i) => (
              <section key={i}>
                {s.heading ? (
                  <h2 className="mb-3 font-display text-xl font-700 tracking-tight text-ink">
                    {s.heading}
                  </h2>
                ) : null}
                {s.paragraphs?.map((p, j) => (
                  <p key={j} className="mt-3 text-[15px] font-400 leading-relaxed text-ink/70 first:mt-0">
                    {p}
                  </p>
                ))}
                {s.list ? (
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {s.list.map((li) => (
                      <li key={li} className="flex items-start gap-3 text-[15px] font-500 text-ink/75">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                          <Icon name="Check" className="h-3 w-3" />
                        </span>
                        {li}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Reveal>

        {/* CTA al pie */}
        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-navy to-navy-deep px-7 py-9 text-center">
          <h3 className="font-display text-2xl font-700 text-white">¿Quieres esto en tu colegio?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm font-400 text-white/70">
            Coordinamos una demo y te mostramos Aulakium funcionando con tu comunidad.
          </p>
          <Link
            href="/#contacto"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep"
          >
            Solicitar demo <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>

        {/* Más notas */}
        <div className="mt-14">
          <h3 className="font-display text-lg font-700 text-ink">Sigue leyendo</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {more.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-3xl border border-ink/8 bg-white p-6 transition-all hover:border-brand/30 hover:shadow-pop"
              >
                <span className="text-xs font-700 text-cta">{p.tag}</span>
                <h4 className="mt-2 text-base font-700 leading-snug text-ink group-hover:text-brand">
                  {p.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-sm font-400 text-ink/55">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
