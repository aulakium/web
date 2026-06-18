-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Contenido DEMO para el Muro (depende de los usuarios demo).
-- Correr DESPUÉS de scripts/seed-demo-users.sh. Idempotente (UUIDs fijos).
-- Demuestra "contenido real por rol": cada audiencia llega a distinta gente.
-- ════════════════════════════════════════════════════════════════════════
\set COMM '''11111111-1111-1111-1111-111111111111'''
\set GROUP6B '''22222222-0000-0000-0000-000000000003'''
\set GRADE6 '''22222222-0000-0000-0000-000000000002'''
\set LVLPRIM '''22222222-0000-0000-0000-000000000001'''
\set YEAR '''22222222-0000-0000-0000-000000000004'''
\set TOMAS '''33333333-0000-0000-0000-000000000001'''

-- Helper: membership id por email
-- (se usa inline con subconsultas)

-- ===== Alumno (registro), inscripción y tutorías =====
insert into students (id, community_id, full_name)
values (:TOMAS::uuid, :COMM::uuid, 'Tomás Méndez')
on conflict (id) do nothing;

insert into student_enrollments (student_id, group_id, academic_year_id)
values (:TOMAS::uuid, :GROUP6B::uuid, :YEAR::uuid)
on conflict (student_id, academic_year_id) do nothing;

-- Marina (familia) es la madre de Tomás
insert into guardianships (id, guardian_membership_id, student_id, relationship, can_pickup, can_pay, can_report_absence, is_primary_contact, receives_billing)
select '55555555-0000-0000-0000-000000000001'::uuid, ms.id, :TOMAS::uuid, 'madre', true, true, true, true, true
from memberships ms join users u on u.id = ms.user_id
where u.email = 'familia@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- El alumno se ve a sí mismo (relación 'self' → reutiliza el motor de audiencias)
insert into guardianships (id, guardian_membership_id, student_id, relationship)
select '55555555-0000-0000-0000-000000000002'::uuid, ms.id, :TOMAS::uuid, 'self'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'alumno@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- Valentina (docente) es tutora de 6°B
insert into staff_group_assignments (membership_id, group_id, role, subject)
select ms.id, :GROUP6B::uuid, 'tutor', null
from memberships ms join users u on u.id = ms.user_id
where u.email = 'docente@laslomas.demo' and ms.community_id = :COMM::uuid
  and not exists (
    select 1 from staff_group_assignments x
    where x.membership_id = ms.id and x.group_id = :GROUP6B::uuid
  );

-- ===== Posts (autor por email) =====
-- P1 — Dirección → toda la comunidad
insert into posts (id, community_id, author_membership_id, title, body, type, published_at)
select '44444444-0000-0000-0000-000000000001'::uuid, :COMM::uuid, ms.id,
  'Jornada de puertas abiertas — Sábado 14 de junio',
  'Invitamos a todas las familias a recorrer el colegio, conocer los proyectos del año y compartir una mañana con los equipos docentes. Habrá actividades para los más chicos en el patio central.',
  'announcement', now() - interval '2 hours'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'principal@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- P2 — Docente → grupo 6°B
insert into posts (id, community_id, author_membership_id, title, body, type, published_at)
select '44444444-0000-0000-0000-000000000002'::uuid, :COMM::uuid, ms.id,
  'Salida didáctica al Museo de Ciencias',
  'El próximo jueves visitamos el Museo de Ciencias Naturales. Recuerden enviar la autorización firmada y vestir el equipo de educación física. Salimos 8:30 en punto.',
  'announcement', now() - interval '5 hours'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'docente@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- P3 — Coordinación → nivel Primaria
insert into posts (id, community_id, author_membership_id, title, body, type, published_at)
select '44444444-0000-0000-0000-000000000003'::uuid, :COMM::uuid, ms.id,
  'Resultados de la feria del libro',
  '¡Gracias a todas las familias que se sumaron! Entre todos juntamos más de 300 libros para la biblioteca. Compartimos los ganadores del concurso de lectura.',
  'announcement', now() - interval '1 day'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'coord@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- P4 — Administración → rol familia (aviso de transporte)
insert into posts (id, community_id, author_membership_id, title, body, type, published_at)
select '44444444-0000-0000-0000-000000000004'::uuid, :COMM::uuid, ms.id,
  'Nuevo recorrido de la ruta 14',
  'A partir del lunes, la ruta 14 incorpora dos paradas nuevas en el barrio Norte. Pueden ver el recorrido actualizado y el horario estimado desde la sección de Transporte.',
  'announcement', now() - interval '2 days'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'admin@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- ===== Audiencias (reset + insert idempotente) =====
delete from audiences where content_type = 'post' and content_id in (
  '44444444-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000002',
  '44444444-0000-0000-0000-000000000003','44444444-0000-0000-0000-000000000004'
);
insert into audiences (community_id, content_type, content_id, target_type, target_id) values
  (:COMM::uuid, 'post', '44444444-0000-0000-0000-000000000001'::uuid, 'community', :COMM::uuid),
  (:COMM::uuid, 'post', '44444444-0000-0000-0000-000000000002'::uuid, 'group',     :GROUP6B::uuid),
  (:COMM::uuid, 'post', '44444444-0000-0000-0000-000000000003'::uuid, 'level',     :LVLPRIM::uuid),
  (:COMM::uuid, 'post', '44444444-0000-0000-0000-000000000004'::uuid, 'role',
    (select id from roles where community_id = :COMM::uuid and key = 'guardian'));

-- ===== Algunos likes y comentarios para que los contadores no estén en cero =====
insert into post_likes (post_id, membership_id)
select '44444444-0000-0000-0000-000000000001'::uuid, ms.id
from memberships ms join users u on u.id = ms.user_id
where u.email in ('docente@laslomas.demo','familia@laslomas.demo','coord@laslomas.demo')
  and ms.community_id = :COMM::uuid
on conflict do nothing;

insert into post_comments (id, post_id, membership_id, body)
select '66666666-0000-0000-0000-000000000001'::uuid, '44444444-0000-0000-0000-000000000002'::uuid, ms.id,
  '¡Gracias! Ya enviamos la autorización.'
from memberships ms join users u on u.id = ms.user_id
where u.email = 'familia@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════════
-- CALENDARIO: sub-calendarios + eventos (con audiencias) + tareas (6°B)
-- ════════════════════════════════════════════════════════════════════════
insert into calendars (id, community_id, name, color) values
  ('77777777-0000-0000-0000-000000000001'::uuid, :COMM::uuid, 'Institucional', 'navy'),
  ('77777777-0000-0000-0000-000000000002'::uuid, :COMM::uuid, 'Primaria',      'brand'),
  ('77777777-0000-0000-0000-000000000003'::uuid, :COMM::uuid, '6°B',           'sky'),
  ('77777777-0000-0000-0000-000000000004'::uuid, :COMM::uuid, 'Evaluaciones',  'news'),
  ('77777777-0000-0000-0000-000000000005'::uuid, :COMM::uuid, 'Transporte',    'transport')
on conflict (id) do nothing;

-- Eventos (junio 2026, horas en UTC para que se muestren tal cual)
insert into events (id, community_id, calendar_id, title, starts_at, ends_at, all_day) values
  ('88888888-0000-0000-0000-000000000001'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000001'::uuid, 'Coffee Morning de familias', '2026-06-05 09:00:00+00', '2026-06-05 10:30:00+00', false),
  ('88888888-0000-0000-0000-000000000002'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000003'::uuid, 'Salida al Museo de Ciencias', '2026-06-09 08:30:00+00', '2026-06-09 12:00:00+00', false),
  ('88888888-0000-0000-0000-000000000003'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000004'::uuid, 'Evaluación 2º trimestre', '2026-06-12 00:00:00+00', '2026-06-12 23:59:00+00', true),
  ('88888888-0000-0000-0000-000000000004'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000001'::uuid, 'Jornada de puertas abiertas', '2026-06-14 09:00:00+00', '2026-06-14 12:00:00+00', false),
  ('88888888-0000-0000-0000-000000000005'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000002'::uuid, 'Acto del Día de la Bandera', '2026-06-17 10:00:00+00', '2026-06-17 11:00:00+00', false),
  ('88888888-0000-0000-0000-000000000006'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000003'::uuid, 'Reunión de padres 6°B', '2026-06-19 18:30:00+00', '2026-06-19 20:00:00+00', false),
  ('88888888-0000-0000-0000-000000000007'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000001'::uuid, 'Inicio receso de invierno', '2026-06-21 00:00:00+00', '2026-06-21 23:59:00+00', true),
  ('88888888-0000-0000-0000-000000000008'::uuid, :COMM::uuid, '77777777-0000-0000-0000-000000000005'::uuid, 'Nuevo recorrido ruta 14', '2026-06-15 00:00:00+00', '2026-06-15 23:59:00+00', true)
on conflict (id) do nothing;

-- Audiencias de los eventos (reset + insert)
delete from audiences where content_type = 'event' and content_id::text like '88888888-%';
insert into audiences (community_id, content_type, content_id, target_type, target_id) values
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000001'::uuid, 'community', :COMM::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000002'::uuid, 'group',     :GROUP6B::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000003'::uuid, 'level',     :LVLPRIM::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000004'::uuid, 'community', :COMM::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000005'::uuid, 'level',     :LVLPRIM::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000006'::uuid, 'group',     :GROUP6B::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000007'::uuid, 'community', :COMM::uuid),
  (:COMM::uuid, 'event', '88888888-0000-0000-0000-000000000008'::uuid, 'role',
    (select id from roles where community_id = :COMM::uuid and key = 'guardian'));

-- Tareas de 6°B (todo el día, vencimiento)
insert into tasks (id, community_id, group_id, title, due_at) values
  ('99999999-0000-0000-0000-000000000001'::uuid, :COMM::uuid, :GROUP6B::uuid, 'Entregar autorización del museo', '2026-06-09 00:00:00+00'),
  ('99999999-0000-0000-0000-000000000002'::uuid, :COMM::uuid, :GROUP6B::uuid, 'Firmar boletín del trimestre', '2026-06-18 00:00:00+00')
on conflict (id) do nothing;

select 'posts: ' || count(*) from posts where community_id = :COMM::uuid;
select 'events: ' || count(*) from events where community_id = :COMM::uuid;

-- ════════════════════════════════════════════════════════════════════════
-- CONVERSACIONES: hilos entre participantes (privacidad por participación)
-- ════════════════════════════════════════════════════════════════════════
-- Helper inline: membership por email → función temporal no; usamos subconsultas.

-- cv1 — Familia ↔ Docente (autorización museo)
insert into conversations (id, community_id, subject, status, created_at) values
  ('99999999-0000-0000-0000-000000000001'::uuid, :COMM::uuid, 'Autorización salida al museo', 'open', now() - interval '1 day')
on conflict (id) do nothing;
insert into conversation_labels (conversation_id, label)
select '99999999-0000-0000-0000-000000000001'::uuid, 'Salidas'
where not exists (select 1 from conversation_labels where conversation_id='99999999-0000-0000-0000-000000000001'::uuid and label='Salidas');
insert into conversation_participants (conversation_id, membership_id)
select '99999999-0000-0000-0000-000000000001'::uuid, ms.id
from memberships ms join users u on u.id=ms.user_id
where u.email in ('familia@laslomas.demo','docente@laslomas.demo') and ms.community_id=:COMM::uuid
on conflict do nothing;
insert into messages (id, conversation_id, sender_membership_id, body, created_at)
select 'aaaa0000-0000-0000-0000-000000000001'::uuid, '99999999-0000-0000-0000-000000000001'::uuid, ms.id,
  'Hola Marina, te recuerdo que el jueves es la salida al Museo. Necesito la autorización firmada antes del miércoles.', now() - interval '20 hours'
from memberships ms join users u on u.id=ms.user_id where u.email='docente@laslomas.demo' and ms.community_id=:COMM::uuid
on conflict (id) do nothing;
insert into messages (id, conversation_id, sender_membership_id, body, created_at)
select 'aaaa0000-0000-0000-0000-000000000002'::uuid, '99999999-0000-0000-0000-000000000001'::uuid, ms.id,
  '¡Hola Valentina! Sí, la completo hoy y la subo.', now() - interval '6 hours'
from memberships ms join users u on u.id=ms.user_id where u.email='familia@laslomas.demo' and ms.community_id=:COMM::uuid
on conflict (id) do nothing;
insert into messages (id, conversation_id, sender_membership_id, body, created_at)
select 'aaaa0000-0000-0000-0000-000000000003'::uuid, '99999999-0000-0000-0000-000000000001'::uuid, ms.id,
  'Perfecto, ya envié la autorización firmada. ¡Gracias!', now() - interval '2 hours'
from memberships ms join users u on u.id=ms.user_id where u.email='familia@laslomas.demo' and ms.community_id=:COMM::uuid
on conflict (id) do nothing;

-- cv2 — Coordinación ↔ Docente (acto)
insert into conversations (id, community_id, subject, status, created_at) values
  ('99999999-0000-0000-0000-000000000002'::uuid, :COMM::uuid, 'Coordinación acto Día de la Bandera', 'open', now() - interval '3 days')
on conflict (id) do nothing;
insert into conversation_labels (conversation_id, label)
select '99999999-0000-0000-0000-000000000002'::uuid, 'Eventos'
where not exists (select 1 from conversation_labels where conversation_id='99999999-0000-0000-0000-000000000002'::uuid and label='Eventos');
insert into conversation_participants (conversation_id, membership_id)
select '99999999-0000-0000-0000-000000000002'::uuid, ms.id
from memberships ms join users u on u.id=ms.user_id
where u.email in ('coord@laslomas.demo','docente@laslomas.demo') and ms.community_id=:COMM::uuid
on conflict do nothing;
insert into messages (id, conversation_id, sender_membership_id, body, created_at)
select 'aaaa0000-0000-0000-0000-000000000004'::uuid, '99999999-0000-0000-0000-000000000002'::uuid, ms.id,
  'Equipo, recuerden que ensayamos el lunes en el SUM a las 10.', now() - interval '2 days'
from memberships ms join users u on u.id=ms.user_id where u.email='coord@laslomas.demo' and ms.community_id=:COMM::uuid
on conflict (id) do nothing;

-- cv3 — Administración ↔ Familia (reintegro, cerrada)
insert into conversations (id, community_id, subject, status, created_at) values
  ('99999999-0000-0000-0000-000000000003'::uuid, :COMM::uuid, 'Reintegro viaje de estudios', 'closed', now() - interval '10 days')
on conflict (id) do nothing;
insert into conversation_labels (conversation_id, label)
select '99999999-0000-0000-0000-000000000003'::uuid, 'Administrativo'
where not exists (select 1 from conversation_labels where conversation_id='99999999-0000-0000-0000-000000000003'::uuid and label='Administrativo');
insert into conversation_participants (conversation_id, membership_id)
select '99999999-0000-0000-0000-000000000003'::uuid, ms.id
from memberships ms join users u on u.id=ms.user_id
where u.email in ('admin@laslomas.demo','familia@laslomas.demo') and ms.community_id=:COMM::uuid
on conflict do nothing;
insert into messages (id, conversation_id, sender_membership_id, body, created_at)
select 'aaaa0000-0000-0000-0000-000000000005'::uuid, '99999999-0000-0000-0000-000000000003'::uuid, ms.id,
  'Listo, el reintegro fue procesado. Cerramos el tema.', now() - interval '9 days'
from memberships ms join users u on u.id=ms.user_id where u.email='admin@laslomas.demo' and ms.community_id=:COMM::uuid
on conflict (id) do nothing;

select 'conversaciones: ' || count(*) from conversations where community_id = :COMM::uuid;
