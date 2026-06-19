-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Encuestas en el Muro (posts.type = 'poll').
-- poll_options: opciones del post. poll_votes: voto (1 por persona por encuesta).
-- ════════════════════════════════════════════════════════════════════════

-- Opciones: leer si el post es visible; crear si soy el autor del post.
drop policy if exists poll_options_read on public.poll_options;
create policy poll_options_read on public.poll_options
  for select to authenticated
  using (post_id in (select id from public.posts));
drop policy if exists poll_options_insert on public.poll_options;
create policy poll_options_insert on public.poll_options
  for insert to authenticated
  with check (post_id in (
    select id from public.posts
    where author_membership_id in (select id from public.memberships where user_id = auth.uid())
  ));

-- Votos: leer los de encuestas visibles; gestionar los propios.
drop policy if exists poll_votes_read on public.poll_votes;
create policy poll_votes_read on public.poll_votes
  for select to authenticated
  using (option_id in (select id from public.poll_options));
drop policy if exists poll_votes_self on public.poll_votes;
create policy poll_votes_self on public.poll_votes
  for all to authenticated
  using (membership_id in (select id from public.memberships where user_id = auth.uid()))
  with check (membership_id in (select id from public.memberships where user_id = auth.uid()));

-- Datos de la encuesta para el usuario actual.
create or replace function public.poll_data(p_post uuid)
returns table(option_id uuid, label text, votes int, mine boolean)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select 1 from posts p where p.id = p_post and (
      p.author_membership_id in (select id from memberships where user_id = auth.uid())
      or exists (select 1 from audiences a
        where a.content_type='post' and a.content_id=p.id
          and (a.target_type,a.target_id) in (select target_type,target_id from public.my_audience_scopes()))
    )
  )
  select o.id, o.label,
    (select count(*) from poll_votes v where v.option_id = o.id)::int,
    exists(select 1 from poll_votes v where v.option_id = o.id and v.membership_id = (select mid from me))
  from poll_options o
  where o.post_id = p_post and exists (select 1 from visible)
  order by o.position, o.label;
$$;
