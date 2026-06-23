"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvite } from "@/lib/invites";

type Supa = Awaited<ReturnType<typeof createClient>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface ParsedTutor {
  nombre: string;
  email: string;
  relacion: string;
  emailOk: boolean;
}
export interface ParsedRow {
  line: number;
  alumno: string;
  salon: string;
  groupId: string | null;
  tutors: ParsedTutor[];
  ok: boolean;
  issues: string[];
}
export interface PreviewState {
  rows: ParsedRow[];
  valid: number;
  invalid: number;
  csv: string;
  error?: string;
}
export interface CommitState {
  done?: boolean;
  studentsCreated: number;
  enrolled: number;
  invitesSent: number;
  invitesFailed: number;
  errors: string[];
  error?: string;
}

function splitCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(",").map((c) => c.trim()));
}

/** Lee groups de la comunidad y arma un mapa nombre→id (case-insensitive). */
async function groupMap(supabase: Supa) {
  const { data } = await supabase.from("groups").select("id, name");
  const map = new Map<string, string>();
  for (const g of data ?? []) map.set(String(g.name).toLowerCase(), g.id as string);
  return map;
}

function analyze(rows: string[][], groups: Map<string, string>): ParsedRow[] {
  // Saltar encabezado si la primera fila parece títulos.
  const start = rows.length && /alumno|salon|salón|email|tutor/i.test(rows[0].join(",")) ? 1 : 0;
  const out: ParsedRow[] = [];
  for (let i = start; i < rows.length; i++) {
    const c = rows[i];
    const alumno = c[0] || "";
    const salon = c[1] || "";
    const groupId = groups.get(salon.toLowerCase()) ?? null;
    const tutors: ParsedTutor[] = [];
    for (const base of [2, 5]) {
      const nombre = c[base] || "";
      const email = (c[base + 1] || "").toLowerCase();
      const relacion = c[base + 2] || "";
      if (email || nombre) {
        tutors.push({ nombre, email, relacion, emailOk: EMAIL_RE.test(email) });
      }
    }
    const issues: string[] = [];
    if (!alumno) issues.push("falta el nombre del alumno");
    if (!salon) issues.push("falta el salón");
    else if (!groupId) issues.push(`el salón "${salon}" no existe`);
    if (tutors.some((t) => t.email && !t.emailOk)) issues.push("correo de tutor inválido");
    out.push({
      line: i + 1,
      alumno,
      salon,
      groupId,
      tutors,
      ok: !!alumno && !!groupId && tutors.every((t) => !t.email || t.emailOk),
      issues,
    });
  }
  return out;
}

export async function parseCsv(_prev: PreviewState | null, formData: FormData): Promise<PreviewState> {
  const csv = String(formData.get("csv") || "");
  if (!csv.trim()) return { rows: [], valid: 0, invalid: 0, csv, error: "Pega o sube un CSV." };
  const supabase = await createClient();
  const groups = await groupMap(supabase);
  const rows = analyze(splitCsv(csv), groups);
  return {
    rows,
    valid: rows.filter((r) => r.ok).length,
    invalid: rows.filter((r) => !r.ok).length,
    csv,
  };
}

async function ctx(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("id, community_id, communities(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const communities = data.communities as { name: string } | { name: string }[] | null;
  return {
    membershipId: data.id as string,
    communityId: data.community_id as string,
    communityName: (Array.isArray(communities) ? communities[0]?.name : communities?.name) ?? "tu colegio",
  };
}

export async function commitImport(
  _prev: CommitState | null,
  formData: FormData,
): Promise<CommitState> {
  const base: CommitState = { studentsCreated: 0, enrolled: 0, invitesSent: 0, invitesFailed: 0, errors: [] };
  const csv = String(formData.get("csv") || "");
  if (!csv.trim()) return { ...base, error: "No hay nada para importar." };

  const supabase = await createClient();
  const c = await ctx(supabase);
  if (!c) return { ...base, error: "No pudimos identificar tu colegio." };

  // Año académico actual (crear si falta).
  let { data: year } = await supabase
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  if (!year) {
    const ins = await supabase
      .from("academic_years")
      .insert({ community_id: c.communityId, label: `Ciclo ${new Date().getFullYear()}`, is_current: true })
      .select("id")
      .single();
    year = ins.data;
  }
  const yearId = year?.id as string | undefined;

  const groups = await groupMap(supabase);
  const rows = analyze(splitCsv(csv), groups).filter((r) => r.ok);

  for (const r of rows) {
    // Alumno (dedup por nombre dentro de la comunidad)
    let studentId: string | undefined;
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("community_id", c.communityId)
      .eq("full_name", r.alumno)
      .maybeSingle();
    if (existing) {
      studentId = existing.id as string;
    } else {
      const ins = await supabase
        .from("students")
        .insert({ community_id: c.communityId, full_name: r.alumno })
        .select("id")
        .single();
      studentId = ins.data?.id as string | undefined;
      if (studentId) base.studentsCreated++;
    }
    if (!studentId) {
      base.errors.push(`No se pudo crear el alumno "${r.alumno}".`);
      continue;
    }

    // Inscripción
    if (yearId && r.groupId) {
      const { error: enrErr } = await supabase
        .from("student_enrollments")
        .upsert(
          { student_id: studentId, group_id: r.groupId, academic_year_id: yearId },
          { onConflict: "student_id,academic_year_id", ignoreDuplicates: true },
        );
      if (!enrErr) base.enrolled++;
    }

    // Invitaciones de tutores
    for (const t of r.tutors) {
      if (!t.email || !t.emailOk) continue;
      const { data: dup } = await supabase
        .from("invitations")
        .select("id")
        .eq("community_id", c.communityId)
        .eq("email", t.email)
        .eq("student_id", studentId)
        .eq("status", "pending")
        .maybeSingle();
      if (dup) continue; // ya invitado para este alumno

      const { error: invErr } = await supabase.from("invitations").insert({
        community_id: c.communityId,
        email: t.email,
        full_name: t.nombre || null,
        role_key: "guardian",
        student_id: studentId,
        relationship: t.relacion || null,
        can_pickup: true,
        can_report_absence: true,
        invited_by: c.membershipId,
      });
      if (invErr) {
        base.invitesFailed++;
        continue;
      }
      const res = await sendInvite({ email: t.email, fullName: t.nombre, communityName: c.communityName });
      if (res.ok && res.emailed) base.invitesSent++;
      else base.invitesFailed++;
    }
  }

  revalidatePath("/configuracion/personas");
  revalidatePath("/configuracion/estructura");
  return { ...base, done: true };
}
