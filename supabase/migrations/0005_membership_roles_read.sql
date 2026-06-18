-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Lectura de membership_roles (identidad / directorio).
-- Permite ver los roles de las membresías de MIS comunidades (incluye el mío).
-- Consistente con la policy de `memberships`. Sin esto, la app no puede saber
-- el rol del usuario logueado (la tabla estaba RLS-on sin policy = cerrada).
-- ════════════════════════════════════════════════════════════════════════
drop policy if exists membership_roles_read on public.membership_roles;
create policy membership_roles_read on public.membership_roles
  for select to authenticated
  using (
    membership_id in (
      select id from public.memberships
      where community_id in (select public.my_community_ids())
    )
  );
