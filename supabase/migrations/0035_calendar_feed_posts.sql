-- ════════════════════════════════════════════════════════════════════════
-- Colequium — calendar_feed v2:
--   • Suma al calendario las NOVEDADES tipo invitación (event) y tarea (task)
--     que se crean en Avisos (antes solo salían las tablas events/tasks).
--   • Devuelve group_id (el salón al que apunta cada cosa, o null si es de toda
--     la comunidad/nivel/grado) para poder filtrar por curso de cada hijo.
--   • Devuelve done: si YO ya marqué la tarea como hecha.
-- ════════════════════════════════════════════════════════════════════════
drop function if exists public.calendar_feed();
create function public.calendar_feed()
returns table(
  id uuid, calendar_key text, day integer, all_day boolean,
  start_time text, end_time text, title text, audience_label text, kind text,
  group_id uuid, done boolean
)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  vis_posts as (
    select p.*
    from posts p
    where p.community_id = (select community_id from me)
      and p.type in ('event', 'task')
      and (
        p.author_membership_id = (select membership_id from me)
        or (
          exists (
            select 1 from audiences a
            where a.content_type = 'post' and a.content_id = p.id
              and (a.target_type, a.target_id) in (
                select target_type, target_id from public.my_audience_scopes())
          )
          and (
            p.audience_roles is null
            or exists (
              select 1 from membership_roles mr join roles r on r.id = mr.role_id
              where mr.membership_id = (select membership_id from me)
                and r.key = any(p.audience_roles))
          )
        )
      )
  )
  -- 1) Eventos de la tabla events (calendarios institucionales)
  select
    e.id,
    case c.name
      when 'Institucional' then 'inst' when 'Primaria' then 'primaria'
      when '6°B' then '6b' when 'Evaluaciones' then 'exams'
      when 'Transporte' then 'transport' else 'inst' end,
    extract(day from e.starts_at)::int,
    coalesce(e.all_day, false),
    case when coalesce(e.all_day,false) then null else to_char(e.starts_at,'HH24:MI') end,
    case when coalesce(e.all_day,false) then null else to_char(e.ends_at,  'HH24:MI') end,
    e.title,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level' then (select name from levels where id = aud.target_id)
      when 'grade' then (select name from grades where id = aud.target_id)
      when 'group' then (select name from groups where id = aud.target_id)
      when 'role'  then 'Familias con transporte' else 'Comunidad' end,
    'event',
    case when aud.target_type = 'group' then aud.target_id else null end,
    false
  from events e
  left join calendars c on c.id = e.calendar_id
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'event' and a.content_id = e.id
    order by case a.target_type when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end limit 1
  ) aud on true
  where e.community_id = (select community_id from me)
    and exists (
      select 1 from audiences a
      where a.content_type = 'event' and a.content_id = e.id
        and (a.target_type, a.target_id) in (select target_type, target_id from public.my_audience_scopes()))

  union all
  -- 2) Tareas de la tabla tasks
  select t.id, '6b', extract(day from t.due_at)::int, true, null, null,
    t.title, g.name, 'task', t.group_id, false
  from tasks t join groups g on g.id = t.group_id
  where t.community_id = (select community_id from me)
    and t.group_id in (select public.my_group_ids())

  union all
  -- 3) Invitaciones (posts tipo event)
  select p.id, 'inst', extract(day from p.event_at)::int, false,
    to_char(p.event_at,'HH24:MI'), null, p.title,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level' then (select name from levels where id = aud.target_id)
      when 'grade' then (select name from grades where id = aud.target_id)
      when 'group' then (select name from groups where id = aud.target_id)
      else 'Comunidad' end,
    'event',
    case when aud.target_type = 'group' then aud.target_id else null end,
    false
  from vis_posts p
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'post' and a.content_id = p.id
    order by case a.target_type when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end limit 1
  ) aud on true
  where p.type = 'event' and p.event_at is not null

  union all
  -- 4) Tareas (posts tipo task)
  select p.id, '6b', extract(day from p.task_due)::int, true, null, null, p.title,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level' then (select name from levels where id = aud.target_id)
      when 'grade' then (select name from grades where id = aud.target_id)
      when 'group' then (select name from groups where id = aud.target_id)
      else 'Comunidad' end,
    'task',
    case when aud.target_type = 'group' then aud.target_id else null end,
    exists (select 1 from post_task_completions tc
            where tc.post_id = p.id and tc.membership_id = (select membership_id from me))
  from vis_posts p
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'post' and a.content_id = p.id
    order by case a.target_type when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end limit 1
  ) aud on true
  where p.type = 'task' and p.task_due is not null;
$$;

-- ── Cursos del usuario para filtrar el calendario por hijo ────────────────
-- Familia: cada hijo y su salón. Docente: sus salones asignados.
create or replace function public.my_courses()
returns table(group_id uuid, group_name text, person_name text)
language sql stable security definer set search_path = public as $$
  with me as (select id as mid from memberships where user_id = auth.uid() and status='active' limit 1)
  select distinct g.id, g.name, s.full_name
  from guardianships gu
  join students s on s.id = gu.student_id
  join student_enrollments se on se.student_id = s.id
  join groups g on g.id = se.group_id
  where gu.guardian_membership_id = (select mid from me)
    and coalesce(gu.relationship,'') <> 'self'
  union
  select distinct g.id, g.name, null
  from staff_group_assignments sga
  join groups g on g.id = sga.group_id
  where sga.membership_id = (select mid from me);
$$;
grant execute on function public.my_courses() to authenticated;
