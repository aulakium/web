import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/identity";
import { getStructure } from "@/lib/structure";
import { StudentForm, DeleteStudentButton } from "@/components/settings/StudentForm";
import { Icon } from "@/components/icons";

interface StudentRow {
  student_id: string;
  full_name: string;
  group_label: string | null;
  tutors: string | null;
}

export default async function FamiliesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: students }, structure] = await Promise.all([
    supabase.rpc("students_admin"),
    getStructure(),
  ]);

  const groupOptions = structure.levels.flatMap((lv) =>
    lv.grades.flatMap((g) => g.groups.map((gr) => ({ value: gr.id, label: `${lv.name} - ${gr.name}` }))),
  );
  const list = (students ?? []) as StudentRow[];

  return (
    <div className="flex flex-col gap-6">
      <StudentForm groups={groupOptions} />

      <section>
        <h2 className="mb-3 font-display text-base font-700 text-ink">
          Alumnos
          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
            {list.length}
          </span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-ink/15 bg-white px-5 py-8 text-center text-sm font-500 text-ink/50">
            Todavía no hay alumnos. Agregá uno arriba, o cargá varios desde Importar.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[1.25rem] border border-ink/5 bg-white shadow-card">
            {list.map((s, i) => (
              <div
                key={s.student_id}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-ink/5" : ""}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon name="GraduationCap" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-700 text-ink">{s.full_name}</span>
                  <span className="block truncate text-xs font-600 text-ink/50">
                    {[s.group_label, s.tutors].filter(Boolean).join(" · ") || "Sin salón ni tutores"}
                  </span>
                </span>
                <DeleteStudentButton id={s.student_id} name={s.full_name} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
