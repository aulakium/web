-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Semilla de comunidad DEMO para pruebas de roles (reunión).
-- Idempotente: UUIDs fijos + on conflict. Los USUARIOS y sus membresías se
-- crean aparte con scripts/seed-demo-users.sh (necesitan auth.users).
-- ════════════════════════════════════════════════════════════════════════

-- Comunidad demo
insert into communities (id, name, short_name, country, settings)
values (
  '11111111-1111-1111-1111-111111111111',
  'Colegio Las Lomas', 'Las Lomas', 'MX',
  '{"locale":"es-MX","currency":"MXN"}'
)
on conflict (id) do update
  set name = excluded.name, short_name = excluded.short_name,
      country = excluded.country, settings = excluded.settings;

-- Catálogo de roles de la comunidad (key + kind). unique(community_id, key)
insert into roles (community_id, key, kind) values
  ('11111111-1111-1111-1111-111111111111', 'board',          'staff'),
  ('11111111-1111-1111-1111-111111111111', 'manager',        'staff'),
  ('11111111-1111-1111-1111-111111111111', 'principal',      'staff'),
  ('11111111-1111-1111-1111-111111111111', 'department_head','staff'),
  ('11111111-1111-1111-1111-111111111111', 'coordinator',    'staff'),
  ('11111111-1111-1111-1111-111111111111', 'support_staff',  'staff'),
  ('11111111-1111-1111-1111-111111111111', 'teacher',        'staff'),
  ('11111111-1111-1111-1111-111111111111', 'service_inbox',  'service'),
  ('11111111-1111-1111-1111-111111111111', 'guardian',       'family'),
  ('11111111-1111-1111-1111-111111111111', 'student',        'student'),
  ('11111111-1111-1111-1111-111111111111', 'driver',         'driver')
on conflict (community_id, key) do update set kind = excluded.kind;

-- Estructura académica mínima (Primaria → 6° → 6°B) para realismo
insert into levels (id, community_id, name) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Primaria')
on conflict (id) do nothing;

insert into grades (id, community_id, level_id, name) values
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000001', '6° grado')
on conflict (id) do nothing;

insert into groups (id, community_id, grade_id, name, type) values
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000002', '6°B', 'class')
on conflict (id) do nothing;

insert into academic_years (id, community_id, label, starts_on, ends_on, is_current) values
  ('22222222-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Ciclo 2026', '2026-02-01', '2026-12-15', true)
on conflict (id) do nothing;
