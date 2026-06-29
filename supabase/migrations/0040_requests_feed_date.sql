-- ════════════════════════════════════════════════════════════════════════
-- Colequium — requests_feed devuelve event_date (la fecha de la inasistencia /
-- salida que guardó la familia), para mostrarla y agrupar Hoy / Próximas.
-- ════════════════════════════════════════════════════════════════════════
drop function if exists public.requests_feed();
create function public.requests_feed()
returns table(
  id uuid, type text, student_name text, group_name text, summary text,
  status text, created_at timestamptz, handled_by text, event_date date
)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  mgr as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and r.key in ('principal','coordinator','support_staff','board','manager','department_head')
    ) as is_mgr
  )
  select
    r.id, r.type,
    s.full_name as student_name,
    (select g.name from student_enrollments se join groups g on g.id = se.group_id
       where se.student_id = r.student_id limit 1) as group_name,
    coalesce(r.payload->>'summary', '') as summary,
    r.status, r.created_at,
    hu.full_name as handled_by,
    nullif(r.payload->>'date','')::date as event_date
  from requests r
  left join students s on s.id = r.student_id
  left join memberships hm on hm.id = r.handled_by_membership_id
  left join users hu on hu.id = hm.user_id
  where r.community_id = (select cid from me)
    and (
      r.opener_membership_id = (select mid from me)
      or (select is_mgr from mgr)
      or r.student_id in (
        select se.student_id from student_enrollments se
        where se.group_id in (select public.my_group_ids())
          and exists (
            select 1 from staff_group_assignments sga
            join memberships m on m.id = sga.membership_id
            where m.user_id = auth.uid() and sga.group_id = se.group_id
          )
      )
    )
  order by nullif(r.payload->>'date','')::date asc nulls last, r.created_at desc;
$$;
