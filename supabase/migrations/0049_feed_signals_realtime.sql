-- ════════════════════════════════════════════════════════════════════════
-- Colequium — señal de tiempo real para el muro. La RLS de `posts` es compleja
-- (usa my_audience_scopes()) y Realtime no la evalúa de forma confiable en
-- postgres_changes, así que los INSERT no llegan. En su lugar usamos una tabla
-- liviana `feed_signals` (solo community_id + hora, sin datos sensibles): un
-- trigger inserta una fila por cada aviso nuevo, el cliente la escucha y refresca
-- el feed (que sigue filtrando por audiencia con RLS al re-fetchear).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.feed_signals (
  id bigint generated always as identity primary key,
  community_id uuid not null,
  created_at timestamptz not null default now()
);

-- Sin datos sensibles → sin RLS, para que Realtime entregue el evento. El cliente
-- filtra por community_id; aun si llegara de otra comunidad, solo dispara un
-- refresh (el fetch posterior respeta la audiencia).
alter table public.feed_signals disable row level security;

create or replace function public.ping_feed_signal()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.feed_signals (community_id) values (new.community_id);
  return new;
end;
$$;

drop trigger if exists posts_feed_signal on public.posts;
create trigger posts_feed_signal
  after insert on public.posts
  for each row execute function public.ping_feed_signal();

-- Limpieza: no acumular señales viejas (las borra cada vez que se inserta una).
create or replace function public.prune_feed_signals()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.feed_signals where created_at < now() - interval '1 hour';
  return null;
end;
$$;
drop trigger if exists feed_signals_prune on public.feed_signals;
create trigger feed_signals_prune
  after insert on public.feed_signals
  for each statement execute function public.prune_feed_signals();

alter publication supabase_realtime add table public.feed_signals;
