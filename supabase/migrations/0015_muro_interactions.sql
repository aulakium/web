-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Interacciones del Muro: comentarios, guardados, leídos.
-- post_reads y post_likes ya tienen policy (0006). Acá: post_comments,
-- bookmarks, y feed() devuelve además si el usuario lo guardó.
-- ════════════════════════════════════════════════════════════════════════

-- Comentarios: leer si el post es visible; escribir los propios.
drop policy if exists post_comments_read on public.post_comments;
create policy post_comments_read on public.post_comments
  for select to authenticated
  using (post_id in (select id from public.posts));
drop policy if exists post_comments_insert on public.post_comments;
create policy post_comments_insert on public.post_comments
  for insert to authenticated
  with check (
    membership_id in (select id from public.memberships where user_id = auth.uid())
    and post_id in (select id from public.posts)
  );

-- Guardados: cada quien gestiona los suyos.
drop policy if exists bookmarks_self on public.bookmarks;
create policy bookmarks_self on public.bookmarks
  for all to authenticated
  using (membership_id in (select id from public.memberships where user_id = auth.uid()))
  with check (membership_id in (select id from public.memberships where user_id = auth.uid()));

-- feed() + bookmarked (cambia el tipo de retorno → drop + create)
drop function if exists public.feed();
create or replace function public.feed()
returns table(
  id uuid, title text, body text, type text, published_at timestamptz,
  author_name text, author_role text,
  audience_target text, audience_label text,
  likes int, comments int, liked boolean, unread boolean, bookmarked boolean
) language sql stable security definer set search_path = public as $$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select p.*
    from posts p
    where p.community_id = (select community_id from me)
      and exists (
        select 1 from audiences a
        where a.content_type = 'post' and a.content_id = p.id
          and (a.target_type, a.target_id) in (
            select target_type, target_id from public.my_audience_scopes()
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
           and b.membership_id = (select membership_id from me)) as bookmarked
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

-- Comentarios de un post (autor + texto), para mostrar en la tarjeta.
create or replace function public.post_comments_feed(p_post uuid)
returns table(id uuid, author_name text, author_role text, body text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, u.full_name,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = c.membership_id limit 1),
    c.body, c.created_at
  from post_comments c
  left join memberships m on m.id = c.membership_id
  left join users u on u.id = m.user_id
  where c.post_id = p_post
    and exists (  -- solo si el post es visible para quien consulta
      select 1 from posts p where p.id = p_post and (
        p.author_membership_id in (select id from memberships where user_id = auth.uid())
        or exists (select 1 from audiences a
          where a.content_type='post' and a.content_id=p.id
            and (a.target_type,a.target_id) in (select target_type,target_id from public.my_audience_scopes()))
      )
    )
  order by c.created_at asc;
$$;
