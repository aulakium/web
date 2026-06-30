-- ════════════════════════════════════════════════════════════════════════
-- Colequium — un coordinador con alcance de sección (nivel/grado/salón) publica
-- SOLO a su sección: su(s) nivel(es), sus grados y sus salones. No a toda la
-- comunidad ni a otras secciones. Gestión total (dirección, etc.) y coordinador
-- de comunidad siguen publicando a todo. Docentes, a sus salones (sin cambios).
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.my_publish_scopes()
returns table(target_type text, target_id uuid)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  full_pub as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and (
          r.key in ('principal','board','manager','support_staff','department_head')
          or (r.key = 'coordinator' and (mr.scope_type is null or mr.scope_type = 'community'))
        )
    ) as ok
  ),
  coord_scoped as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and r.key = 'coordinator' and mr.scope_type in ('level','grade','group')
    ) as ok
  )
  -- Gestión total / coordinador de comunidad: todo.
  select 'community', (select cid from me) where (select ok from full_pub)
  union all select 'level', id from levels where community_id = (select cid from me) and (select ok from full_pub)
  union all select 'grade', id from grades where community_id = (select cid from me) and (select ok from full_pub)
  union all select 'group', id from groups where community_id = (select cid from me) and (select ok from full_pub)
  union all select 'role',  id from roles  where community_id = (select cid from me) and (select ok from full_pub)
  -- Coordinador acotado: su subárbol (salones + sus grados + sus niveles). Sin comunidad ni roles.
  union all
    select 'group', gid from public.my_admin_group_ids() gid where (select ok from coord_scoped)
  union all
    select distinct 'grade', g.grade_id from groups g
    where g.id in (select public.my_admin_group_ids()) and g.grade_id is not null and (select ok from coord_scoped)
  union all
    select distinct 'level', gr.level_id from groups g join grades gr on gr.id = g.grade_id
    where g.id in (select public.my_admin_group_ids()) and gr.level_id is not null and (select ok from coord_scoped)
  -- Docente: solo sus salones asignados.
  union all select 'group', gid from public.my_group_ids() gid;
$function$;
