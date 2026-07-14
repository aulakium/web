-- Lista de alumnos para el panel de administración (sección "Alumnos y familias"):
-- nombre, salón actual y sus tutores (los que ya aceptaron). Solo para admins.
create or replace function public.students_admin()
returns table(student_id uuid, full_name text, group_label text, tutors text)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select community_id as cid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    s.id,
    s.full_name,
    (select l.name || ' - ' || g.name
       from student_enrollments se
       join groups g on g.id = se.group_id
       join grades gr on gr.id = g.grade_id
       join levels l on l.id = gr.level_id
       where se.student_id = s.id
       order by se.academic_year_id desc nulls last limit 1),
    (select string_agg(u.full_name, ', ')
       from guardianships gd
       join memberships gm on gm.id = gd.guardian_membership_id
       join users u on u.id = gm.user_id
       where gd.student_id = s.id and coalesce(gd.relationship,'') <> 'self')
  from students s
  where s.community_id = (select cid from me)
    and public.is_school_admin((select cid from me))
  order by s.full_name;
$function$;

grant execute on function public.students_admin() to authenticated;
