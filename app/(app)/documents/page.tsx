import { Icon } from "@/components/icons";
import { getDocuments, getUploadInfo } from "@/lib/documents";
import { getServerT } from "@/lib/i18n-server";
import { DocumentUploader } from "@/components/documents/DocumentUploader";

export default async function DocumentosPage() {
  const [folders, t, upload] = await Promise.all([
    getDocuments(),
    getServerT(),
    getUploadInfo(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("docs.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("docs.subtitle")}</p>
      </div>

      {upload.canUpload ? (
        <DocumentUploader folders={upload.folders} roster={upload.roster} />
      ) : null}

      {folders.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="FolderClosed" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">{t("docs.empty")}</p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            {t("docs.subtitle")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {folders.map((f) => (
            <section key={f.name}>
              <div className="mb-2.5 flex items-center gap-2">
                <Icon name="FolderClosed" className="h-4 w-4 text-brand" />
                <h2 className="font-display text-base font-700 text-ink">{f.name}</h2>
                <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
                  {f.docs.length}
                </span>
              </div>
              <div className="overflow-hidden rounded-[1.25rem] border border-ink/5 bg-white shadow-card">
                {f.docs.map((d, i) => (
                  <a
                    key={d.id}
                    href={d.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-mist ${
                      i > 0 ? "border-t border-ink/5" : ""
                    } ${d.url ? "" : "pointer-events-none opacity-50"}`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-news/10 text-news">
                      <Icon name="FileText" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-700 text-ink">{d.title}</span>
                        {d.isPrivate ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-grape/10 px-2 py-0.5 text-[10px] font-700 text-grape">
                            <Icon name="ShieldCheck" className="h-3 w-3" /> Privado
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs font-500 text-ink/45">PDF · {d.dateLabel}</span>
                    </span>
                    <Icon name="ArrowRight" className="h-4 w-4 shrink-0 text-ink/30" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
