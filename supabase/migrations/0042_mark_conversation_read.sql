-- ════════════════════════════════════════════════════════════════════════
-- Colequium — marcar como leídos todos los mensajes de una conversación para
-- el usuario actual. Se llama al abrir la conversación; limpia el puntito de
-- "sin leer" en la navegación. Idempotente (on conflict do nothing).
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_mid uuid;
begin
  select id into v_mid from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null then return; end if;

  -- Sólo si el usuario participa de la conversación.
  if not exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = p_conversation and cp.membership_id = v_mid
  ) then
    return;
  end if;

  insert into message_reads (message_id, membership_id)
  select m.id, v_mid
  from messages m
  where m.conversation_id = p_conversation
    and m.sender_membership_id <> v_mid
  on conflict (message_id, membership_id) do nothing;
end;
$$;
