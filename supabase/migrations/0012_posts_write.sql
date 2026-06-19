-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Escritura en el Muro (v1): publicar avisos + likes.
--   • Publicar: roles de gestión (dirección/coordinación/apoyo/etc.) pueden
--     crear posts en SU comunidad, como autor de su propia membresía.
--     v1: la audiencia es "toda la comunidad" (el reparto fino llega después).
--   • Likes: cada quien puede dar/quitar su propio like (policy ya creada en
--     0006: post_likes_self). Acá solo se documenta.
-- ════════════════════════════════════════════════════════════════════════
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts
  for insert to authenticated
  with check (
    author_membership_id in (select id from memberships where user_id = auth.uid())
    and public.is_community_member(community_id)
    and exists (
      select 1 from membership_roles mr
      join roles r on r.id = mr.role_id
      join memberships m on m.id = mr.membership_id
      where m.user_id = auth.uid()
        and r.key in ('principal','coordinator','support_staff','board','manager','department_head')
    )
  );

-- Insert de audiencias para el post recién creado (miembro de la comunidad).
-- (audiences ya tiene policy FOR ALL por comunidad desde 0002; explícito por claridad.)
drop policy if exists audiences_insert on public.audiences;
create policy audiences_insert on public.audiences
  for insert to authenticated
  with check (public.is_community_member(community_id));
