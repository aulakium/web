-- ════════════════════════════════════════════════════════════════════════
-- Colequium — total de mensajes sin leer del usuario (para el puntito en la
-- navegación de Mensajes). Mismo criterio que conversations_feed.unread, pero
-- agregado en un solo número y barato de pedir en cada carga del shell.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.unread_messages_count()
returns integer
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  )
  select coalesce(count(*), 0)::int
  from messages msg
  where exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = msg.conversation_id
      and cp.membership_id = (select mid from me)
  )
    and msg.sender_membership_id <> (select mid from me)
    and not exists (
      select 1 from message_reads mrd
      where mrd.message_id = msg.id and mrd.membership_id = (select mid from me)
    );
$$;
