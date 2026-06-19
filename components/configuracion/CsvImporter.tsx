"use client";

import { useActionState, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import {
  parseCsv,
  commitImport,
  type PreviewState,
  type CommitState,
} from "@/app/(app)/configuracion/importar/actions";

const HEADER =
  "alumno,salon,tutor1_nombre,tutor1_email,tutor1_relacion,tutor2_nombre,tutor2_email,tutor2_relacion";
const SAMPLE = `${HEADER}
Lucía Far,6°B,Ana Far,ana.far@example.com,madre,Diego Far,diego.far@example.com,padre
Mateo Ruiz,6°B,Sofía Ruiz,sofia.ruiz@example.com,madre,,,`;

export function CsvImporter() {
  const [csv, setCsv] = useState("");
  const [preview, previewAction, previewing] = useActionState<PreviewState | null, FormData>(
    parseCsv,
    null,
  );
  const [commit, commitAction, committing] = useActionState<CommitState | null, FormData>(
    commitImport,
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setCsv);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Entrada */}
      <form action={previewAction} className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-700 text-ink">Importar desde CSV</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCsv(SAMPLE)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-700 text-brand hover:bg-brand/10"
            >
              Cargar ejemplo
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 px-2.5 py-1.5 text-xs font-700 text-ink/60 hover:border-brand/40"
            >
              <Icon name="Paperclip" className="h-3.5 w-3.5" /> Subir archivo
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          </div>
        </div>
        <p className="mb-2 text-xs font-600 text-ink/45">
          Columnas: <code className="rounded bg-mist px-1.5 py-0.5">{HEADER}</code>. El salón
          (ej. <b>6°B</b>) tiene que existir en Estructura.
        </p>
        <textarea
          name="csv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={6}
          placeholder="Pegá acá el CSV…"
          className="w-full resize-y rounded-xl bg-mist px-3 py-2.5 font-mono text-xs text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />
        {preview?.error ? (
          <p className="mt-2 text-sm font-700 text-rose">{preview.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={previewing}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-700 text-white hover:bg-navy-deep disabled:opacity-60"
        >
          {previewing ? "Analizando…" : "Previsualizar"}
        </button>
      </form>

      {/* Preview */}
      {preview && preview.rows.length > 0 ? (
        <section className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-700">
            <span className="text-leaf">✓ {preview.valid} listas para importar</span>
            {preview.invalid > 0 ? (
              <span className="text-rose">✗ {preview.invalid} con problemas</span>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-xl border border-ink/8">
            {preview.rows.map((r) => (
              <div
                key={r.line}
                className={`flex flex-wrap items-center gap-2 border-b border-ink/5 px-3 py-2 text-sm last:border-0 ${
                  r.ok ? "" : "bg-rose/5"
                }`}
              >
                <Icon
                  name={r.ok ? "CircleCheck" : "X"}
                  className={`h-4 w-4 shrink-0 ${r.ok ? "text-leaf" : "text-rose"}`}
                />
                <span className="font-700 text-ink">{r.alumno || "—"}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-700 text-brand">
                  {r.salon || "sin salón"}
                </span>
                <span className="text-xs font-600 text-ink/55">
                  {r.tutors.filter((t) => t.email).length} tutor(es)
                </span>
                {r.issues.length > 0 ? (
                  <span className="text-xs font-600 text-rose">· {r.issues.join("; ")}</span>
                ) : null}
              </div>
            ))}
          </div>

          {preview.valid > 0 && !commit?.done ? (
            <form action={commitAction} className="mt-4">
              <input type="hidden" name="csv" value={preview.csv} />
              <button
                type="submit"
                disabled={committing}
                className="inline-flex items-center gap-2 rounded-full bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft hover:bg-cta-deep disabled:opacity-60"
              >
                <Icon name="Send" className="h-4 w-4" />
                {committing ? "Importando…" : `Importar ${preview.valid} y enviar invitaciones`}
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {/* Resultado */}
      {commit?.done ? (
        <div className="rounded-[1.5rem] border border-leaf/30 bg-leaf/5 p-5">
          <h3 className="font-display text-base font-700 text-ink">Importación lista ✓</h3>
          <ul className="mt-2 space-y-1 text-sm font-600 text-ink/70">
            <li>• {commit.studentsCreated} alumnos nuevos · {commit.enrolled} inscripciones</li>
            <li>• {commit.invitesSent} invitaciones enviadas {commit.invitesFailed > 0 ? `· ${commit.invitesFailed} fallaron` : ""}</li>
          </ul>
          {commit.errors.length > 0 ? (
            <p className="mt-2 text-xs font-600 text-rose">{commit.errors.join(" · ")}</p>
          ) : null}
        </div>
      ) : commit?.error ? (
        <p className="text-sm font-700 text-rose">{commit.error}</p>
      ) : null}
    </div>
  );
}
