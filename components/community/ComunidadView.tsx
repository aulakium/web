"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { useLocale } from "@/components/locale-context";
import type { AccentColor } from "@/components/colors";
import {
  getMemberDetail,
  updateMember,
  removeMember,
} from "@/app/(app)/community/actions";

export interface DirPerson {
  membershipId: string | null;
  roleKey: string | null;
  name: string;
  subtitle: string;
  color: string;
  groups: string[];
}
export interface DirSection {
  key: string;
  title: string;
  icon: string;
  filterable: boolean; // Docentes / Familias → filtro por curso
  people: DirPerson[];
}

/** Roles que un admin puede asignar (con su clave i18n role.*). */
const ASSIGNABLE_ROLES = [
  "principal",
  "coordinator",
  "manager",
  "department_head",
  "support_staff",
  "teacher",
  "guardian",
  "driver",
  "student",
] as const;

/** Directorio de la comunidad: secciones por rol, desplegables, con filtro por curso. */
export function ComunidadView({
  sections,
  isAdmin = false,
  groups = [],
}: {
  sections: DirSection[];
  isAdmin?: boolean;
  groups?: { id: string; name: string }[];
}) {
  // La primera sección arranca abierta; el resto, plegadas.
  const [open, setOpen] = useState<Record<string, boolean>>(
    sections.length ? { [sections[0].key]: true } : {},
  );
  const [editing, setEditing] = useState<DirPerson | null>(null);
  const [removing, setRemoving] = useState<DirPerson | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((s) => (
        <Section
          key={s.key}
          section={s}
          open={!!open[s.key]}
          onToggle={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
          isAdmin={isAdmin}
          onEdit={setEditing}
          onRemove={setRemoving}
        />
      ))}

      {editing ? (
        <MemberEditModal person={editing} groups={groups} onClose={() => setEditing(null)} />
      ) : null}
      {removing ? (
        <RemoveConfirm person={removing} onClose={() => setRemoving(null)} />
      ) : null}
    </div>
  );
}

function Section({
  section,
  open,
  onToggle,
  isAdmin,
  onEdit,
  onRemove,
}: {
  section: DirSection;
  open: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onEdit: (p: DirPerson) => void;
  onRemove: (p: DirPerson) => void;
}) {
  const [course, setCourse] = useState<string>("todos");

  const courses = section.filterable
    ? [...new Set(section.people.flatMap((p) => p.groups))].sort((a, b) =>
        a.localeCompare(b, "es"),
      )
    : [];

  const shown =
    section.filterable && course !== "todos"
      ? section.people.filter((p) => p.groups.includes(course))
      : section.people;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icon name={section.icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-700 text-ink">{section.title}</span>
          <span className="block text-xs font-600 text-ink/45">
            {section.people.length} {section.people.length === 1 ? "persona" : "personas"}
          </span>
        </span>
        <Icon
          name="ChevronDown"
          className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-ink/5 px-4 pb-4 pt-3">
          {courses.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              <CourseChip label="Todos" active={course === "todos"} onClick={() => setCourse("todos")} />
              {courses.map((c) => (
                <CourseChip key={c} label={c} active={course === c} onClick={() => setCourse(c)} />
              ))}
            </div>
          ) : null}

          {shown.length === 0 ? (
            <p className="py-4 text-center text-sm font-500 text-ink/45">Nadie en este curso.</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p, i) => (
                <div
                  key={p.membershipId ?? `${p.name}-${i}`}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-ink/5 bg-cloud/40 p-2.5"
                >
                  <Avatar name={p.name} color={p.color as AccentColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-700 text-ink">{p.name}</p>
                    <p className="truncate text-xs font-600 text-ink/50">{p.subtitle}</p>
                  </div>
                  {/* Acciones de admin: editar / quitar */}
                  {isAdmin && p.membershipId ? (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        aria-label="Editar"
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-white hover:text-brand"
                      >
                        <Icon name="Pencil" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(p)}
                        aria-label="Quitar"
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-rose/10 hover:text-rose"
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

/** Editor de una persona (solo admin): rol + (docente) salones + materia. */
function MemberEditModal({
  person,
  groups,
  onClose,
}: {
  person: DirPerson;
  groups: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [roleKey, setRoleKey] = useState<string>(person.roleKey ?? "");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!person.membershipId) return;
    getMemberDetail(person.membershipId).then((d) => {
      if (d.roleKey) setRoleKey(d.roleKey);
      setGroupIds(d.groupIds ?? []);
      setSubject(d.subject ?? "");
      setLoaded(true);
    });
  }, [person.membershipId]);

  const isTeacher = roleKey === "teacher";
  function toggleGroup(id: string) {
    setGroupIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }
  function save() {
    if (!person.membershipId) return;
    start(async () => {
      await updateMember(
        person.membershipId!,
        roleKey,
        isTeacher ? groupIds : null,
        isTeacher ? subject : null,
      );
      onClose();
    });
  }

  return (
    <Modal onClose={onClose} title={`Editar · ${person.name}`}>
      <label className="mb-1 block text-xs font-700 text-ink/55">Rol</label>
      <select
        value={roleKey}
        onChange={(e) => setRoleKey(e.target.value)}
        className="mb-3 w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
      >
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {t(`role.${r}`)}
          </option>
        ))}
      </select>

      {isTeacher ? (
        <>
          <label className="mb-1 block text-xs font-700 text-ink/55">Materia (opcional)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ej. Música, Arte, Español"
            className="mb-3 w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
          />
          <label className="mb-1 block text-xs font-700 text-ink/55">Salones</label>
          <div className="mb-1 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
            {groups.map((g) => {
              const on = groupIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
                    on ? "bg-brand text-white ring-brand" : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2.5 text-sm font-700 text-ink/55 transition-colors hover:bg-mist hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending || !loaded}
          className="inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-60"
        >
          <Icon name="Check" className="h-4 w-4" />
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

function RemoveConfirm({ person, onClose }: { person: DirPerson; onClose: () => void }) {
  const [pending, start] = useTransition();
  function confirm() {
    if (!person.membershipId) return;
    start(async () => {
      await removeMember(person.membershipId!);
      onClose();
    });
  }
  return (
    <Modal onClose={onClose} title="Quitar de la comunidad">
      <p className="text-sm font-600 text-ink/70">
        ¿Seguro que querés quitar a <span className="font-700 text-ink">{person.name}</span> del
        colegio? Perderá el acceso. Podés volver a invitarlo más adelante.
      </p>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2.5 text-sm font-700 text-ink/55 transition-colors hover:bg-mist hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Icon name="Trash2" className="h-4 w-4" />
          {pending ? "Quitando…" : "Quitar"}
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-[1.75rem] border border-ink/10 bg-white p-5 shadow-pop sm:rounded-[1.75rem]">
        <h3 className="mb-4 font-display text-lg font-700 text-ink">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function CourseChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
        active ? "bg-ink text-white ring-ink" : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
