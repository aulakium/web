-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Administración de la ESTRUCTURA del colegio.
-- Un "Administrador del colegio" (roles principal/manager/board) puede crear y
-- editar niveles/grados/salones/alumnos. El resto de la comunidad solo lee.
-- Antes (0002) cualquier miembro podía escribir estas tablas → se endurece.
-- ════════════════════════════════════════════════════════════════════════

-- Orden de visualización (Kínder antes que Primaria, 1° antes que 2°, salón A antes que B).
alter table public.levels add column if not exists position int not null default 0;
alter table public.grades add column if not exists position int not null default 0;
alter table public.groups add column if not exists position int not null default 0;

create or replace function public.is_school_admin(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from memberships m
    join membership_roles mr on mr.membership_id = m.id
    join roles r on r.id = mr.role_id
    where m.user_id = auth.uid()
      and m.community_id = c
      and m.status = 'active'
      and r.key in ('principal','manager','board')
  )
$$;

-- ===== Tablas con community_id directo: SELECT miembros + WRITE solo admin =====
do $$
declare t text;
begin
  foreach t in array array['levels','grades','groups','academic_years','students'] loop
    execute format('drop policy if exists "%1$s_community" on public.%1$s', t);
    execute format($f$
      drop policy if exists %1$s_select on public.%1$s;
      create policy %1$s_select on public.%1$s
        for select to authenticated
        using (public.is_community_member(community_id));
      drop policy if exists %1$s_admin_write on public.%1$s;
      create policy %1$s_admin_write on public.%1$s
        for all to authenticated
        using (public.is_school_admin(community_id))
        with check (public.is_school_admin(community_id));
    $f$, t);
  end loop;
end $$;

-- ===== Tablas de unión (sin community_id): gatear por el padre =====
-- student_enrollments → community via students
drop policy if exists student_enrollments_select on public.student_enrollments;
create policy student_enrollments_select on public.student_enrollments
  for select to authenticated
  using (exists (
    select 1 from students s where s.id = student_id
      and (public.is_school_admin(s.community_id)
           or s.id in (select g.student_id from guardianships g
                       join memberships m on m.id = g.guardian_membership_id
                       where m.user_id = auth.uid()))
  ));
drop policy if exists student_enrollments_admin on public.student_enrollments;
create policy student_enrollments_admin on public.student_enrollments
  for all to authenticated
  using (exists (select 1 from students s where s.id = student_id and public.is_school_admin(s.community_id)))
  with check (exists (select 1 from students s where s.id = student_id and public.is_school_admin(s.community_id)));

-- guardianships → community via students; el tutor ve las suyas
drop policy if exists guardianships_select on public.guardianships;
create policy guardianships_select on public.guardianships
  for select to authenticated
  using (
    guardian_membership_id in (select id from memberships where user_id = auth.uid())
    or exists (select 1 from students s where s.id = student_id and public.is_school_admin(s.community_id))
  );
drop policy if exists guardianships_admin on public.guardianships;
create policy guardianships_admin on public.guardianships
  for all to authenticated
  using (exists (select 1 from students s where s.id = student_id and public.is_school_admin(s.community_id)))
  with check (exists (select 1 from students s where s.id = student_id and public.is_school_admin(s.community_id)));

-- staff_group_assignments → community via groups; el docente ve las suyas
drop policy if exists staff_group_assignments_select on public.staff_group_assignments;
create policy staff_group_assignments_select on public.staff_group_assignments
  for select to authenticated
  using (
    membership_id in (select id from memberships where user_id = auth.uid())
    or exists (select 1 from groups g where g.id = group_id and public.is_school_admin(g.community_id))
  );
drop policy if exists staff_group_assignments_admin on public.staff_group_assignments;
create policy staff_group_assignments_admin on public.staff_group_assignments
  for all to authenticated
  using (exists (select 1 from groups g where g.id = group_id and public.is_school_admin(g.community_id)))
  with check (exists (select 1 from groups g where g.id = group_id and public.is_school_admin(g.community_id)));
