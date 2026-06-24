-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Responder comentarios (un solo nivel).
-- post_comments.parent_id apunta al comentario padre (top-level). Las respuestas
-- nunca se anidan más de un nivel (se fuerza en la action). feed devuelve parent_id.
-- ════════════════════════════════════════════════════════════════════════
alter table public.post_comments
  add column if not exists parent_id uuid references public.post_comments on delete cascade;

drop function if exists public.post_comments_feed(uuid);
create or replace function public.post_comments_feed(p_post uuid)
returns table(id uuid, author_name text, author_role text, body text, created_at timestamptz, parent_id uuid)
language sql stable security definer set search_path = public as $$
  select c.id, u.full_name,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = c.membership_id limit 1),
    c.body, c.created_at, c.parent_id
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
