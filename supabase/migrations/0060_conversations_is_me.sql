-- conversations_feed: marcar is_me por participante para que la lista de
-- conversaciones muestre el avatar de la OTRA persona (no el del usuario actual).
create or replace function public.conversations_feed()
returns table(id uuid, subject text, status text, scope_label text, participants json, labels json, messages json, unread integer)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid from memberships where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    c.id, c.subject, c.status,
    coalesce((select label from conversation_labels where conversation_id = c.id limit 1), 'General') as scope_label,
    (select json_agg(json_build_object(
        'name', u.full_name,
        'role', coalesce(r.key,'support_staff'),
        'is_me', (cp.membership_id = (select mid from me))
      ) order by u.full_name)
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
$function$;
