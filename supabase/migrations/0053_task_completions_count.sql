-- ════════════════════════════════════════════════════════════════════════
-- Colequium — feed() devuelve task_completions: cuántas personas marcaron la
-- tarea como hecha (p. ej. "confirmaron lectura"). Así el colegio ve, en el
-- propio aviso, quiénes ya lo leyeron / cumplieron.
-- ════════════════════════════════════════════════════════════════════════
drop function if exists public.feed(integer, integer, uuid);
create function public.feed(p_limit integer default 20, p_offset integer default 0, p_group uuid default null)
returns table(
  id uuid, title text, body text, type text, published_at timestamptz,
  author_name text, author_role text, audience_target text, audience_label text,
  likes integer, comments integer, liked boolean, unread boolean, bookmarked boolean,
  comments_enabled boolean, cover_url text, event_location text, event_at timestamptz,
  task_action text, task_due timestamptz, task_done boolean, reads integer,
  my_rsvp text, rsvp_yes integer, group_id uuid, event_all_day boolean,
  task_completions integer
)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select p.*
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
    v.id, v.title, v.body, v.type, v.published_at,
    au.full_name,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = v.author_membership_id limit 1),
    aud.target_type,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level'     then (select name from levels where id = aud.target_id)
      when 'grade'     then (select name from grades where id = aud.target_id)
      when 'group'     then (select name from groups where id = aud.target_id)
      when 'role'      then (select key  from roles  where id = aud.target_id)
      else 'Mensaje directo' end,
    (select count(*) from post_likes    pl where pl.post_id = v.id)::int,
    (select count(*) from post_comments pc where pc.post_id = v.id)::int,
    exists(select 1 from post_likes pl where pl.post_id = v.id and pl.membership_id = (select membership_id from me)),
    not exists(select 1 from post_reads pr where pr.post_id = v.id and pr.membership_id = (select membership_id from me)),
    exists(select 1 from bookmarks b where b.content_type='post' and b.content_id=v.id and b.membership_id=(select membership_id from me)),
    coalesce(v.comments_enabled, true),
    v.cover_url, v.event_location, v.event_at, v.task_action, v.task_due,
    exists(select 1 from post_task_completions tc where tc.post_id = v.id and tc.membership_id = (select membership_id from me)),
    (select count(*) from post_reads pr where pr.post_id = v.id)::int,
    (select response from post_rsvps rv where rv.post_id = v.id and rv.membership_id = (select membership_id from me)),
    (select count(*) from post_rsvps rv where rv.post_id = v.id and rv.response = 'yes')::int,
    case when aud.target_type = 'group' then aud.target_id else null end,
    coalesce(v.event_all_day, false),
    (select count(*) from post_task_completions tc where tc.post_id = v.id)::int
  from visible v
  left join memberships am on am.id = v.author_membership_id
  left join users au on au.id = am.user_id
  left join lateral (
    select a.target_type, a.target_id
    from audiences a
    where a.content_type = 'post' and a.content_id = v.id
    order by case a.target_type
      when 'user' then 0 when 'group' then 1 when 'grade' then 2
      when 'level' then 3 when 'role' then 4 else 5 end
    limit 1
  ) aud on true
  order by v.published_at desc nulls last, v.created_at desc
  limit greatest(p_limit, 0) offset greatest(p_offset, 0);
$function$;
