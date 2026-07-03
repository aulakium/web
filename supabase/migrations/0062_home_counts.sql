-- Contador liviano para el estado "todo al día" (celebración global inbox-cero).
-- Reusa EXACTAMENTE el mismo filtro de visibilidad que feed() pero sin traer las
-- filas: sólo cuenta avisos sin leer y tareas pendientes del usuario logueado.
-- Respeta el filtro por hijo (p_group) igual que feed().
create or replace function public.home_counts(p_group uuid default null)
returns table(unread_posts int, pending_tasks int)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select p.id, p.type
    from posts p
    where p.community_id = (select community_id from me)
      and (
        p.published_at is null
        or p.published_at <= now()
        or p.author_membership_id = (select membership_id from me)
      )
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
      and (
        p_group is null
        or exists (select 1 from audiences a where a.content_type='post' and a.content_id=p.id
                   and a.target_type='group' and a.target_id = p_group)
        or not exists (select 1 from audiences a where a.content_type='post' and a.content_id=p.id
                       and a.target_type='group')
      )
  )
  select
    count(*) filter (
      where not exists (
        select 1 from post_reads pr
        where pr.post_id = v.id and pr.membership_id = (select membership_id from me))
    )::int as unread_posts,
    count(*) filter (
      where v.type = 'task'
        and not exists (
          select 1 from post_task_completions tc
          where tc.post_id = v.id and tc.membership_id = (select membership_id from me))
    )::int as pending_tasks
  from visible v;
$function$;

grant execute on function public.home_counts(uuid) to authenticated;
