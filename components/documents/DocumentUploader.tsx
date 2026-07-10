"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { uploadGeneralDocument, uploadBoletines } from "@/app/(app)/documents/actions";
import type { RosterStudent } from "@/lib/documents";

/** Normaliza para comparar nombres de archivo con nombres de alumnos. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Mejor alumno para un nombre de archivo (por tokens del nombre). "" si dudoso. */
function matchStudent(filename: string, roster: RosterStudent[]): string {
  const hay = " " + norm(filename) + " ";
  let best = "";
  let bestScore = 0;
  for (const s of roster) {
    const tokens = norm(s.fullName).split(" ").filter((t) => t.length > 2);
    if (!tokens.length) continue;
    const hits = tokens.filter((t) => hay.includes(t)).length;
    const score = hits / tokens.length;
    if (hits >= Math.min(2, tokens.length) && score > bestScore) {
      bestScore = score;
      best = s.studentId;
    }
  }
  return bestScore >= 0.5 ? best : "";
}

type BatchRow = { file: File; studentId: string };

export function DocumentUploader({
  folders,
  roster,
}: {
  folders: string[];
  roster: RosterStudent[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"general" | "boletines">("general");

  return (
    <div className="mb-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-navy-deep"
        >
          <Icon name="Upload" className="h-4 w-4" />
          Subir documentos
        </button>
      ) : (
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1 rounded-full bg-mist p-1">
              <TabBtn active={mode === "general"} onClick={() => setMode("general")}>
                General
              </TabBtn>
              <TabBtn active={mode === "boletines"} onClick={() => setMode("boletines")}>
                Boletas (por alumno)
              </TabBtn>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-mist hover:text-ink"
              aria-label="Cerrar"
            >
              <Icon name="X" className="h-4 w-4" />
            </button>
          </div>
          {mode === "general" ? (
            <GeneralForm folders={folders} />
          ) : (
            <BatchForm folders={folders} roster={roster} />
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-700 transition-colors ${
        active ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const FIELD =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm font-500 text-ink outline-none focus:border-brand/50";

function GeneralForm({ folders }: { folders: string[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function submit(formData: FormData) {
    setMsg(null);
    start(async () => {
      const res = await uploadGeneralDocument(formData);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Documento subido. Lo ve toda la comunidad." });
        setFile(null);
      }
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-3">
      <p className="text-sm font-500 text-ink/55">
        Un documento visible para <span className="font-700 text-ink">toda la comunidad</span>{" "}
        (circulares, reglamentos, calendarios).
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-700 text-ink/60">Carpeta</label>
        <input name="folder" list="doc-folders" placeholder="General" className={FIELD} />
        <datalist id="doc-folders">
          {folders.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-700 text-ink/60">Título (opcional)</label>
        <input name="title" placeholder="Se usa el nombre del archivo si lo dejas vacío" className={FIELD} />
      </div>
      <input type="hidden" name="scopeType" value="community" />
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-mist/40 px-4 py-3 text-sm font-600 text-ink/70 hover:border-brand/40">
        <Icon name="Paperclip" className="h-4 w-4 text-ink/45" />
        {file ? file.name : "Elige un archivo (PDF, máx 10 MB)"}
        <input
          type="file"
          name="file"
          required
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {msg ? (
        <p className={`text-sm font-600 ${msg.ok ? "text-leaf" : "text-rose"}`}>{msg.text}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !file}
        className="self-start rounded-full bg-cta px-5 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-50"
      >
        {pending ? "Subiendo…" : "Publicar documento"}
      </button>
    </form>
  );
}

function BatchForm({ folders, roster }: { folders: string[]; roster: RosterStudent[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [folder, setFolder] = useState("Boletas");
  const [rows, setRows] = useState<BatchRow[]>([]);

  const assigned = rows.filter((r) => r.studentId).length;

  function onFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).map((file) => ({
      file,
      studentId: matchStudent(file.name, roster),
    }));
    setRows(next);
    setMsg(null);
  }

  function setStudent(idx: number, studentId: string) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, studentId } : r)));
  }

  function publish() {
    setMsg(null);
    const toSend = rows.filter((r) => r.studentId);
    if (!toSend.length) {
      setMsg({ ok: false, text: "Asigna al menos un archivo a un alumno." });
      return;
    }
    const fd = new FormData();
    fd.set("folder", folder || "Boletas");
    toSend.forEach((r, i) => {
      fd.set(`file_${i}`, r.file);
      fd.set(`student_${i}`, r.studentId);
    });
    start(async () => {
      const res = await uploadBoletines(fd);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        const errs = res?.errors?.length ? ` (${res.errors.length} con error)` : "";
        setMsg({ ok: true, text: `Se enviaron ${res?.count ?? 0} boletas a sus familias${errs}.` });
        setRows([]);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-500 text-ink/55">
        Sube todas las boletas juntas. Cada archivo se envía como documento{" "}
        <span className="font-700 text-ink">privado</span>, visible solo para la familia del alumno.
        Revisa el emparejamiento antes de publicar.
      </p>
      {roster.length === 0 ? (
        <p className="rounded-xl bg-sun/10 px-4 py-3 text-sm font-600 text-ink/70">
          No tienes grupos con alumnos asignados, así que no hay a quién dirigir boletas.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-700 text-ink/60">Carpeta</label>
            <input
              list="doc-folders"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className={FIELD}
            />
            <datalist id="doc-folders">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-mist/40 px-4 py-3 text-sm font-600 text-ink/70 hover:border-brand/40">
            <Icon name="Upload" className="h-4 w-4 text-ink/45" />
            {rows.length ? `${rows.length} archivos elegidos` : "Elige las boletas (varios PDF)"}
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>

          {rows.length ? (
            <div className="overflow-hidden rounded-xl border border-ink/8">
              <div className="flex items-center justify-between bg-mist px-3 py-2 text-xs font-700 text-ink/55">
                <span>Archivo → Alumno</span>
                <span>
                  {assigned}/{rows.length} asignados
                </span>
              </div>
              <ul className="max-h-72 divide-y divide-ink/5 overflow-y-auto">
                {rows.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2">
                    <Icon name="FileText" className="h-4 w-4 shrink-0 text-ink/35" />
                    <span className="min-w-0 flex-1 truncate text-xs font-600 text-ink/70" title={r.file.name}>
                      {r.file.name}
                    </span>
                    <Icon
                      name={r.studentId ? "CircleCheck" : "ChevronRight"}
                      className={`h-4 w-4 shrink-0 ${r.studentId ? "text-leaf" : "text-sun"}`}
                    />
                    <select
                      value={r.studentId}
                      onChange={(e) => setStudent(i, e.target.value)}
                      className={`max-w-[45%] shrink-0 rounded-lg border px-2 py-1.5 text-xs font-600 outline-none ${
                        r.studentId ? "border-ink/12 text-ink" : "border-sun/50 text-ink/60"
                      }`}
                    >
                      <option value="">— Sin asignar —</option>
                      {roster.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.fullName} · {s.groupName}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {msg ? (
            <p className={`text-sm font-600 ${msg.ok ? "text-leaf" : "text-rose"}`}>{msg.text}</p>
          ) : null}

          <button
            type="button"
            onClick={publish}
            disabled={pending || assigned === 0}
            className="self-start rounded-full bg-cta px-5 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-50"
          >
            {pending ? "Enviando…" : `Enviar ${assigned} boletas`}
          </button>
        </>
      )}
    </div>
  );
}
