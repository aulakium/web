-- ════════════════════════════════════════════════════════════════════════
-- Colequium — (1) eventos sin hora ("todo el día"): columna event_all_day.
--             (2) programar avisos a futuro: published_at futuro queda oculto
--                 para los destinatarios; el autor sí lo ve (para gestionarlo).
-- Se actualizan feed() y calendar_feed() para respetar ambas cosas.
-- ════════════════════════════════════════════════════════════════════════

alter table public.posts
  add column if not exists event_all_day boolean not null default false;

-- ── feed(): + event_all_day en el retorno, + filtro de programación ────────
drop function if exists public.feed(integer, integer, uuid);
create function public.feed(p_limit integer default 20, p_offset integer default 0, p_group uuid default null)
returns table(
  id uuid, title text, body text, type text, published_at timestamptz,
  author_name text, author_role text, audience_target text, audience_label text,
  likes integer, comments integer, liked boolean, unread boolean, bookmarked boolean,
  comments_enabled boolean, cover_url text, event_location text, event_at timestamptz,
  task_action text, task_due timestamptz, task_done boolean, reads integer,
  my_rsvp text, rsvp_yes integer, group_id uuid, event_all_day boolean
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
      -- Programación: lo no publicado aún solo lo ve su autor.
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
    coalesce(v.event_all_day, false)
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

-- ── calendar_feed(): + filtro de programación, + eventos "todo el día" ─────
drop function if exists public.calendar_feed();
create function public.calendar_feed()
returns table(
  id uuid, calendar_key text, day integer, all_day boolean, start_time text,
  end_time text, title text, audience_label text, kind text, group_id uuid,
  done boolean, is_post boolean, on_date date
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
      -- Programación: lo no publicado aún solo lo ve su autor.
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
  )
  select e.id,
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
    false, false, e.starts_at::date
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
  select t.id, '6b', extract(day from t.due_at)::int, true, null, null,
    t.title, g.name, 'task', t.group_id, false, false, t.due_at::date
  from tasks t join groups g on g.id = t.group_id
  where t.community_id = (select community_id from me)
    and t.group_id in (select public.my_group_ids())

  union all
  select p.id, 'inst', extract(day from p.event_at)::int,
    coalesce(p.event_all_day, false),
    case when coalesce(p.event_all_day,false) then null else to_char(p.event_at,'HH24:MI') end,
    null, p.title,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level' then (select name from levels where id = aud.target_id)
      when 'grade' then (select name from grades where id = aud.target_id)
      when 'group' then (select name from groups where id = aud.target_id)
      else 'Comunidad' end,
    'event',
    case when aud.target_type = 'group' then aud.target_id else null end,
    false, true, p.event_at::date
  from vis_posts p
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'post' and a.content_id = p.id
    order by case a.target_type when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end limit 1
  ) aud on true
  where p.type = 'event' and p.event_at is not null

  union all
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
            where tc.post_id = p.id and tc.membership_id = (select membership_id from me)),
    true, p.task_due::date
  from vis_posts p
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'post' and a.content_id = p.id
    order by case a.target_type when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end limit 1
  ) aud on true
  where p.type = 'task' and p.task_due is not null;
$$;
