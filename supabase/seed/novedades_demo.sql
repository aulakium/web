-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Novedades demo de los tres tipos (comunicado / invitación / tarea).
-- Idempotente: borra las suyas por título y las vuelve a crear. Autor: dirección.
-- ════════════════════════════════════════════════════════════════════════
do $$
declare
  v_author uuid := '7351cd0f-ffd1-4da8-abf7-4afd30460edf'; -- principal@laslomas.demo
  v_comm   uuid := '11111111-1111-1111-1111-111111111111'; -- comunidad Las Lomas
  v_6b     uuid := '22222222-0000-0000-0000-000000000003'; -- salón 6°B
  v_post   uuid;
begin
  delete from posts where community_id = v_comm and title in (
    'Jornada de puertas abiertas', 'Autorización para la salida al museo'
  );

  -- Invitación (evento): toda la comunidad.
  insert into posts (community_id, author_membership_id, title, body, type,
                     event_location, event_at, published_at)
  values (v_comm, v_author, 'Jornada de puertas abiertas',
          'Los esperamos para conocer el colegio, recorrer las aulas y compartir un café con el equipo.',
          'event', 'Patio central', timestamptz '2026-07-15 18:30-06', now())
  returning id into v_post;
  insert into audiences (community_id, content_type, content_id, target_type, target_id)
  values (v_comm, 'post', v_post, 'community', v_comm);

  -- Tarea (firmar): familias de 6°B.
  insert into posts (community_id, author_membership_id, title, body, type,
                     task_action, task_due, published_at)
  values (v_comm, v_author, 'Autorización para la salida al museo',
          'Por favor firmen la autorización para que su hijo pueda asistir a la salida educativa.',
          'task', 'sign', timestamptz '2026-07-10 00:00-06', now())
  returning id into v_post;
  insert into audiences (community_id, content_type, content_id, target_type, target_id)
  values (v_comm, 'post', v_post, 'group', v_6b);
end $$;
