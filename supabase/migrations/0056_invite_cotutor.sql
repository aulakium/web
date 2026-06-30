-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Un tutor invita a otro tutor para sus hijos.
-- Un padre/madre puede invitar a otra persona como tutor de uno o varios de
-- SUS hijos. La persona invitada hereda los mismos permisos operativos que
-- tiene quien invita sobre ese hijo (retirar, pagar, justificar inasistencias).
-- No puede invitar para hijos que no son suyos (se valida server-side).
-- ════════════════════════════════════════════════════════════════════════

-- Hijos del tutor actual, con los permisos que tiene sobre cada uno.
-- Sirve para que el padre elija a cuáles hijos extender la invitación.
create or replace function public.my_guardian_children()
returns table(
  student_id uuid,
  student_name text,
  group_name text,
  can_pickup boolean,
  can_pay boolean,
  can_report_absence boolean
)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    s.id,
    s.full_name,
    (
      select string_agg(distinct g.name, ', ')
      from student_enrollments se
      join groups g on g.id = se.group_id
      where se.student_id = s.id
    ),
    gu.can_pickup,
    gu.can_pay,
    gu.can_report_absence
  from guardianships gu
  join students s on s.id = gu.student_id
  where gu.guardian_membership_id = (select mid from me)
    and coalesce(gu.relationship, '') <> 'self'
  order by s.full_name;
$function$;

grant execute on function public.my_guardian_children() to authenticated;

-- Crea las invitaciones de co-tutor para los hijos indicados.
-- Devuelve cuántas invitaciones se crearon. Ignora silenciosamente los hijos
-- que no pertenecen a quien invita y las invitaciones pendientes duplicadas.
create or replace function public.invite_cotutor(
  p_email text,
  p_full_name text,
  p_student_ids uuid[],
  p_relationship text
)
returns integer
language plpgsql security definer set search_path to 'public'
as $function$
declare
  me_mid uuid;
  me_cid uuid;
  v_email citext := lower(trim(p_email));
  v_rel text := coalesce(nullif(trim(p_relationship), ''), 'tutor');
  v_name text := nullif(trim(p_full_name), '');
  sid uuid;
  n int := 0;
begin
  if v_email is null or length(v_email::text) = 0 then
    raise exception 'Falta el correo de la persona a invitar.';
  end if;
  if p_student_ids is null or array_length(p_student_ids, 1) is null then
    raise exception 'Elegí al menos un hijo/a.';
  end if;

  select id, community_id into me_mid, me_cid
  from memberships
  where user_id = auth.uid() and status = 'active'
  limit 1;
  if me_mid is null then
    raise exception 'No pudimos identificar tu cuenta.';
  end if;

  foreach sid in array p_student_ids loop
    -- Solo hijos de quien invita.
    if not exists (
      select 1 from guardianships g
      where g.guardian_membership_id = me_mid and g.student_id = sid
    ) then
      continue;
    end if;
    -- No duplicar una invitación pendiente para el mismo correo + hijo.
    if exists (
      select 1 from invitations i
      where i.email = v_email and i.student_id = sid and i.status = 'pending'
    ) then
      continue;
    end if;

    insert into invitations (
      community_id, email, full_name, role_key, student_id, relationship,
      can_pickup, can_pay, can_report_absence, is_primary_contact, receives_billing,
      invited_by, status, expires_at
    )
    select
      me_cid, v_email, v_name, 'guardian', sid, v_rel,
      g.can_pickup, g.can_pay, g.can_report_absence, false, false,
      me_mid, 'pending', now() + interval '30 days'
    from guardianships g
    where g.guardian_membership_id = me_mid and g.student_id = sid;

    n := n + 1;
  end loop;

  return n;
end;
$function$;

grant execute on function public.invite_cotutor(text, text, uuid[], text) to authenticated;
