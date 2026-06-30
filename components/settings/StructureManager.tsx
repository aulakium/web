"use client";

import { Icon } from "@/components/icons";
import type { Structure } from "@/lib/structure";
import type { SchoolPreset } from "@/lib/school-presets";
import {
  applyPreset,
  createLevel,
  createGrade,
  createGroup,
  deleteLevel,
  deleteGrade,
  deleteGroup,
} from "@/app/(app)/settings/structure/actions";

export function StructureManager({
  structure,
  presets,
  canManageLevels = true,
}: {
  structure: Structure;
  presets: SchoolPreset[];
  /** Solo Dirección crea/borra niveles y aplica plantillas. La coordinación gestiona
   *  grados y salones dentro de su nivel, pero no toca los niveles. */
  canManageLevels?: boolean;
}) {
  const empty = structure.levels.length === 0;
  // Contar sobre los niveles visibles (la coordinación ve solo el suyo).
  const visibleGroups = structure.levels.reduce(
    (n, lv) => n + lv.grades.reduce((m, g) => m + g.groups.length, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-600 text-ink/60">
        <span>
          <b className="text-ink">{structure.academicYear ?? "Sin ciclo"}</b> · ciclo actual
        </span>
        <span>
          <b className="text-ink">{structure.levels.length}</b> niveles ·{" "}
          <b className="text-ink">{visibleGroups}</b> salones
        </span>
      </div>

      {empty ? (
        canManageLevels ? (
          <PresetPicker presets={presets} />
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white px-5 py-8 text-center text-sm font-600 text-ink/55">
            Todavía no hay grados en tu nivel. La estructura general la define la
            Dirección del colegio.
          </div>
        )
      ) : (
        <>
          {structure.levels.map((lv) => (
            <section
              key={lv.id}
              className="overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white shadow-card"
            >
              <header className="flex items-center justify-between gap-2 border-b border-ink/5 bg-[#f8fafc] px-5 py-3">
                <h2 className="font-display text-base font-700 text-ink">{lv.name}</h2>
                {canManageLevels ? (
                  <form action={deleteLevel}>
                    <input type="hidden" name="id" value={lv.id} />
                    <DeleteBtn
                      disabled={lv.grades.length > 0}
                      title={lv.grades.length > 0 ? "Quita los grados primero" : "Eliminar nivel"}
                    />
                  </form>
                ) : null}
              </header>

              <div className="flex flex-col divide-y divide-ink/5">
                {lv.grades.map((g) => (
                  <div key={g.id} className="flex flex-wrap items-center gap-2 px-5 py-3">
                    <span className="w-16 shrink-0 text-sm font-700 text-ink">{g.name}</span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {g.groups.map((gr) => (
                        <span
                          key={gr.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-3 pr-1 text-xs font-700 text-brand"
                        >
                          {gr.name}
                          {gr.enrolled > 0 ? (
                            <span className="text-brand/60">· {gr.enrolled}</span>
                          ) : null}
                          <form action={deleteGroup} className="inline">
                            <input type="hidden" name="id" value={gr.id} />
                            <button
                              type="submit"
                              disabled={gr.enrolled > 0}
                              title={gr.enrolled > 0 ? "Tiene alumnos inscriptos" : "Quitar salón"}
                              className="grid h-5 w-5 place-items-center rounded-full text-brand/70 transition-colors hover:bg-brand/20 disabled:opacity-30"
                            >
                              <Icon name="X" className="h-3 w-3" />
                            </button>
                          </form>
                        </span>
                      ))}

                      <form action={createGroup} className="inline">
                        <input type="hidden" name="gradeId" value={g.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-xs font-700 text-ink/50 transition-colors hover:border-brand/50 hover:text-brand"
                        >
                          <Icon name="Plus" className="h-3 w-3" /> salón
                        </button>
                      </form>
                    </div>

                    <form action={deleteGrade} className="ml-auto">
                      <input type="hidden" name="id" value={g.id} />
                      <DeleteBtn
                        disabled={g.groups.length > 0}
                        title={g.groups.length > 0 ? "Quitá los salones primero" : "Eliminar grado"}
                        small
                      />
                    </form>
                  </div>
                ))}

                {/* Agregar grado */}
                <form action={createGrade} className="flex items-center gap-2 px-5 py-2.5">
                  <input type="hidden" name="levelId" value={lv.id} />
                  <input
                    name="name"
                    placeholder="Nuevo grado (ej. 7°)"
                    className="w-40 rounded-lg bg-mist px-3 py-1.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                  />
                  <button type="submit" className="text-sm font-700 text-brand hover:text-ink">
                    Agregar grado
                  </button>
                </form>
              </div>
            </section>
          ))}

          {/* Agregar nivel (solo Dirección) */}
          {canManageLevels ? (
          <form
            action={createLevel}
            className="flex items-center gap-2 rounded-[1.5rem] border border-dashed border-ink/15 bg-white px-5 py-3"
          >
            <input
              name="name"
              placeholder="Nuevo nivel (ej. Bachillerato)"
              className="w-56 rounded-lg bg-mist px-3 py-2 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-700 text-white transition-colors hover:bg-navy-deep"
            >
              <Icon name="Plus" className="h-4 w-4" /> Agregar nivel
            </button>
          </form>
          ) : null}
        </>
      )}
    </div>
  );
}

function PresetPicker({ presets }: { presets: SchoolPreset[] }) {
  return (
    <div className="rounded-[1.75rem] border border-ink/8 bg-white p-6 shadow-card sm:p-8">
      <h2 className="font-display text-lg font-700 text-ink">Arma tu estructura</h2>
      <p className="mt-1 text-sm font-500 text-ink/60">
        Elige una plantilla para empezar. Después puedes agregar, quitar o renombrar
        niveles y grados, y definir los salones de cada grado.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {presets.map((p) => (
          <form key={p.id} action={applyPreset.bind(null, p.id)}>
            <button
              type="submit"
              className="flex h-full w-full flex-col items-start gap-1 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-card"
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-700 text-ink">
                <Icon name="GraduationCap" className="h-4 w-4 text-brand" />
                {p.label}
              </span>
              <span className="text-xs font-600 text-ink/50">{p.description}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function DeleteBtn({
  disabled,
  title,
  small,
}: {
  disabled?: boolean;
  title?: string;
  small?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      title={title}
      className={`grid place-items-center rounded-lg text-ink/35 transition-colors hover:bg-rose/10 hover:text-rose disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink/35 ${
        small ? "h-7 w-7" : "h-8 w-8"
      }`}
    >
      <Icon name="X" className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}
