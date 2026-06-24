-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Tres tipos de novedad en el muro.
--   • announcement (Comunicado): sin acción.
--   • event (Invitación): lugar + fecha → se muestra como evento.
--   • task (Tarea): acción requerida (firmar / entregar / completar). Cada
--     destinatario la marca como hecha; al hacerlo desaparece de sus pendientes.
-- posts.type no tiene check constraint, así que solo sumamos columnas + la
-- tabla de "hecho por mí" + actualizamos feed() para devolver los campos nuevos.
-- ════════════════════════════════════════════════════════════════════════

alter table public.posts
  add column if not exists event_location text,
  add column if not exists event_at       timestamptz,
  add column if not exists task_action     text,   -- 'sign' | 'submit' | 'complete'
  add column if not exists task_due        timestamptz;

-- Quién completó una tarea (una fila por persona).
create table if not exists public.post_task_completions (
  post_id       uuid not null references public.posts(id) on delete cascade,
  membership_id uuid not null references public.memberships(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (post_id, membership_id)
);

alter table public.post_task_completions enable row level security;

drop policy if exists ptc_select on public.post_task_completions;
create policy ptc_select on public.post_task_completions
  for select to authenticated
  using (membership_id in (
    select id from public.memberships where user_id = auth.uid()
  ));

-- Marcar/desmarcar una tarea como hecha (solo sobre mi propia membresía y si
-- la novedad es visible para mí). SECURITY DEFINER para resolver la membresía.
create or replace function public.set_task_done(p_post uuid, p_done boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_mid uuid;
begin
  select id into v_mid from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null then raise exception 'sin membresía'; end if;

  if p_done then
    insert into post_task_completions (post_id, membership_id)
    values (p_post, v_mid)
    on conflict (post_id, membership_id) do nothing;
  else
    delete from post_task_completions
    where post_id = p_post and membership_id = v_mid;
  end if;
end;
$$;

grant execute on function public.set_task_done(uuid, boolean) to authenticated;

-- feed(): sumamos event_location, event_at, task_action, task_due, task_done.
drop function if exists public.feed();
create function public.feed()
returns table(
  id uuid, title text, body text, type text, published_at timestamptz,
  author_name text, author_role text, audience_target text, audience_label text,
  likes integer, comments integer, liked boolean, unread boolean,
  bookmarked boolean, comments_enabled boolean, cover_url text,
  event_location text, event_at timestamptz,
  task_action text, task_due timestamptz, task_done boolean
)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select p.*
    from posts p
    where p.community_id = (select community_id from me)
      and (
        p.author_membership_id = (select membership_id from me)
        or (
          exists (
            select 1 from audiences a
            where a.content_type = 'post' and a.content_id = p.id
              and (a.target_type, a.target_id) in (
                select target_type, target_id from public.my_audience_scopes()
              )
          )
          and (
            p.audience_roles is null
            or exists (
              select 1 from membership_roles mr join roles r on r.id = mr.role_id
              where mr.membership_id = (select membership_id from me)
                and r.key = any(p.audience_roles)
            )
          )
        )
      )
  )
  select
    v.id, v.title, v.body, v.type, v.published_at,
    au.full_name as author_name,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = v.author_membership_id limit 1) as author_role,
    aud.target_type as audience_target,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level'     then (select name from levels where id = aud.target_id)
      when 'grade'     then (select name from grades where id = aud.target_id)
      when 'group'     then (select name from groups where id = aud.target_id)
      when 'role'      then (select key  from roles  where id = aud.target_id)
      else 'Mensaje directo'
    end as audience_label,
    (select count(*) from post_likes    pl where pl.post_id = v.id)::int as likes,
    (select count(*) from post_comments pc where pc.post_id = v.id)::int as comments,
    exists(select 1 from post_likes pl where pl.post_id = v.id
           and pl.membership_id = (select membership_id from me)) as liked,
    not exists(select 1 from post_reads pr where pr.post_id = v.id
           and pr.membership_id = (select membership_id from me)) as unread,
    exists(select 1 from bookmarks b where b.content_type = 'post' and b.content_id = v.id
           and b.membership_id = (select membership_id from me)) as bookmarked,
    coalesce(v.comments_enabled, true) as comments_enabled,
    v.cover_url,
    v.event_location, v.event_at,
    v.task_action, v.task_due,
    exists(select 1 from post_task_completions tc where tc.post_id = v.id
           and tc.membership_id = (select membership_id from me)) as task_done
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
  order by v.published_at desc nulls last, v.created_at desc;
$$;
