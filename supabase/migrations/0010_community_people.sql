-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Directorio de personas de la comunidad, consciente del rol.
-- Regla v1 (privacidad simple y defendible):
--   • El EQUIPO (roles staff/service) es visible para todos los miembros.
--   • Los roles de GESTIÓN (dirección/coord/apoyo) ven a TODOS (familias,
--     alumnos, choferes incluidos).
--   • Una familia/alumno/chofer NO ve a otras familias/alumnos (solo al equipo
--     y a sí mismo). El directorio fino por grupo se agrega más adelante.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.community_people()
returns table(name text, role_key text, role_kind text)
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
  select u.full_name, r.key, r.kind
  from memberships m
  join users u on u.id = m.user_id
  left join lateral (
    select rr.key, rr.kind from membership_roles mr join roles rr on rr.id = mr.role_id
    where mr.membership_id = m.id limit 1
  ) r on true
  where m.community_id = (select cid from me) and m.status = 'active'
    and (
      coalesce(r.kind, '') in ('staff','service')
      or (select is_mgr from mgr)
      or m.id = (select mid from me)
    )
  order by u.full_name;
$$;
