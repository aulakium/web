-- ════════════════════════════════════════════════════════════════════════
-- Colequium — gestión de personas para administradores (desde Comunidad):
--   • admin_update_member: cambia el rol y, si es docente, sus salones + materia.
--   • admin_remove_member: baja lógica (status='removed'); no a sí mismo.
--   • admin_member_detail: rol + salones + materia actuales (para precargar).
-- Todo gateado por is_school_admin (solo dirección/gestión).
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.admin_update_member(
  p_membership uuid,
  p_role_key text,
  p_group_ids uuid[] default null,
  p_subject text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_cid uuid;
  v_role_id uuid;
begin
  select community_id into v_cid from memberships where id = p_membership;
  if v_cid is null or not public.is_school_admin(v_cid) then return; end if;

  -- Rol
  if p_role_key is not null and p_role_key <> '' then
    select id into v_role_id from roles where key = p_role_key;
    if v_role_id is not null then
      delete from membership_roles where membership_id = p_membership;
      insert into membership_roles (membership_id, role_id) values (p_membership, v_role_id);
    end if;
  end if;

  -- Salones asignados (para staff/docente). p_group_ids = null → no se tocan.
  if p_group_ids is not null then
    delete from staff_group_assignments where membership_id = p_membership;
    insert into staff_group_assignments (membership_id, group_id, role, subject)
    select p_membership, gid, 'teacher', nullif(btrim(coalesce(p_subject,'')), '')
    from unnest(p_group_ids) as gid
    where exists (select 1 from groups g where g.id = gid and g.community_id = v_cid);
  end if;
end;
$$;

create or replace function public.admin_remove_member(p_membership uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_cid uuid;
  v_me uuid;
begin
  select community_id into v_cid from memberships where id = p_membership;
  select id into v_me from memberships where user_id = auth.uid() and status = 'active' limit 1;
  if v_cid is null or not public.is_school_admin(v_cid) then return; end if;
  if p_membership = v_me then return; end if; -- no puede darse de baja a sí mismo
  update memberships set status = 'removed' where id = p_membership;
end;
$$;

create or replace function public.admin_member_detail(p_membership uuid)
returns table(role_key text, group_ids uuid[], subject text)
language sql stable security definer set search_path = public as $$
  select
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
       where mr.membership_id = p_membership limit 1),
    (select array_agg(distinct group_id) from staff_group_assignments
       where membership_id = p_membership),
    (select subject from staff_group_assignments
       where membership_id = p_membership and subject is not null limit 1)
  where public.is_school_admin((select community_id from memberships where id = p_membership));
$$;
