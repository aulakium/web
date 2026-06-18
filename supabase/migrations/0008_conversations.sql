-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Conversaciones reales con privacidad por PARTICIPANTE (§3.3).
-- Sólo ves un hilo si sos participante. Endurece RLS (antes: cualquier
-- miembro de la comunidad veía todos los hilos) y expone conversations_feed().
-- ════════════════════════════════════════════════════════════════════════

-- ===== RLS: sólo participantes =====
drop policy if exists "conversations_community" on public.conversations;
drop policy if exists conversations_participant on public.conversations;
create policy conversations_participant on public.conversations
  for select to authenticated
  using (exists (
    select 1 from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where cp.conversation_id = conversations.id and m.user_id = auth.uid()
  ));

drop policy if exists conv_participants_self on public.conversation_participants;
create policy conv_participants_self on public.conversation_participants
  for select to authenticated
  using (conversation_id in (
    select cp.conversation_id from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where m.user_id = auth.uid()
  ));

drop policy if exists conv_labels_self on public.conversation_labels;
create policy conv_labels_self on public.conversation_labels
  for select to authenticated
  using (conversation_id in (
    select cp.conversation_id from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where m.user_id = auth.uid()
  ));

drop policy if exists messages_participant on public.messages;
create policy messages_participant on public.messages
  for select to authenticated
  using (conversation_id in (
    select cp.conversation_id from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where m.user_id = auth.uid()
  ));

drop policy if exists message_reads_self on public.message_reads;
create policy message_reads_self on public.message_reads
  for all to authenticated
  using (membership_id in (select id from memberships where user_id = auth.uid()))
  with check (membership_id in (select id from memberships where user_id = auth.uid()));

-- ===== Lista de conversaciones del usuario (con participantes, etiquetas, mensajes) =====
create or replace function public.conversations_feed()
returns table(
  id uuid, subject text, status text, scope_label text,
  participants json, labels json, messages json, unread int
) language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid from memberships where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    c.id, c.subject, c.status,
    coalesce((select label from conversation_labels where conversation_id = c.id limit 1), 'General') as scope_label,
    (select json_agg(json_build_object('name', u.full_name, 'role', coalesce(r.key,'support_staff')) order by u.full_name)
       from conversation_participants cp
       join memberships m on m.id = cp.membership_id
       join users u on u.id = m.user_id
       left join lateral (
         select rr.key from membership_roles mr join roles rr on rr.id = mr.role_id
         where mr.membership_id = m.id limit 1
       ) r on true
       where cp.conversation_id = c.id) as participants,
    (select json_agg(label) from conversation_labels where conversation_id = c.id) as labels,
    (select json_agg(json_build_object(
        'id', msg.id, 'body', msg.body,
        'at', to_char(msg.created_at, 'DD/MM HH24:MI'),
        'sender', su.full_name,
        'senderRole', coalesce(sr.key,'support_staff'),
        'mine', (msg.sender_membership_id = (select mid from me))
      ) order by msg.created_at)
       from messages msg
       left join memberships sm on sm.id = msg.sender_membership_id
       left join users su on su.id = sm.user_id
       left join lateral (
         select rr.key from membership_roles mr join roles rr on rr.id = mr.role_id
         where mr.membership_id = sm.id limit 1
       ) sr on true
       where msg.conversation_id = c.id) as messages,
    (select count(*) from messages msg
       where msg.conversation_id = c.id
         and msg.sender_membership_id <> (select mid from me)
         and not exists (
           select 1 from message_reads mrd
           where mrd.message_id = msg.id and mrd.membership_id = (select mid from me)
         ))::int as unread
  from conversations c
  where exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = c.id and cp.membership_id = (select mid from me)
  )
  order by (select max(created_at) from messages where conversation_id = c.id) desc nulls last;
$$;
