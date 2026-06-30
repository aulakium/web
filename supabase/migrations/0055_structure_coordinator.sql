-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Coordinación gestiona la estructura DE SU NIVEL.
-- Un coordinador con scope de nivel puede crear/quitar grados y salones de ese
-- nivel (no de otros), pero NO crea ni borra niveles (eso queda en Dirección).
-- La gestión total (principal/manager/board) sigue manejando todo el árbol.
-- ════════════════════════════════════════════════════════════════════════

-- Niveles que un coordinador acotado puede gestionar estructuralmente.
create or replace function public.my_struct_level_ids()
returns setof uuid
language sql stable security definer set search_path to 'public'
as $function$
  select mr.scope_id
  from memberships m
  join membership_roles mr on mr.membership_id = m.id
  join roles r on r.id = mr.role_id
  where m.user_id = auth.uid()
    and m.status = 'active'
    and r.key = 'coordinator'
    and mr.scope_type = 'level'
    and mr.scope_id is not null;
$function$;

-- Grados que un coordinador puede gestionar: los de sus niveles, más los que
-- tenga acotados directamente (scope_type = 'grade').
create or replace function public.my_admin_grade_ids()
returns setof uuid
language sql stable security definer set search_path to 'public'
as $function$
  select g.id from grades g where g.level_id in (select public.my_struct_level_ids())
  union
  select mr.scope_id
  from memberships m
  join membership_roles mr on mr.membership_id = m.id
  join roles r on r.id = mr.role_id
  where m.user_id = auth.uid()
    and m.status = 'active'
    and r.key = 'coordinator'
    and mr.scope_type = 'grade'
    and mr.scope_id is not null;
$function$;

-- ── Grados: escritura para admin total O coordinador dentro de su nivel ──
drop policy if exists grades_admin_write on public.grades;
create policy grades_admin_write on public.grades
  for all
  using (
    is_school_admin(community_id)
    or level_id in (select public.my_struct_level_ids())
  )
  with check (
    is_school_admin(community_id)
    or level_id in (select public.my_struct_level_ids())
  );

-- ── Salones: escritura para admin total O coordinador dentro de su(s) grado(s) ──
drop policy if exists groups_admin_write on public.groups;
create policy groups_admin_write on public.groups
  for all
  using (
    is_school_admin(community_id)
    or grade_id in (select public.my_admin_grade_ids())
  )
  with check (
    is_school_admin(community_id)
    or grade_id in (select public.my_admin_grade_ids())
  );
