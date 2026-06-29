#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Puebla la comunidad demo para la prueba grupal:
#   • Nivel Secundaria + 1° Sec (salones A/B)  [Primaria 4°/5°/6° ya existen]
#   • 5 alumnos por salón en 4°,5°,6° y 1° Sec (A y B)
#   • Un login de familia por salón (familiaXY@laslomas.demo) ligado a un alumno
#   • coord@ → coordpri@ (Primaria) + nuevo coordsec@ (Secundaria)
#   • Docentes con distintas asignaciones de salones
# Idempotente: se puede correr varias veces.
# Uso:  bash scripts/seed-demo-school.sh
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

SECRETS="${SECRETS:-../colequium.secrets.env.local}"
[ -f "$SECRETS" ] || { echo "No encuentro secretos: $SECRETS"; exit 1; }
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' "$SECRETS" | cut -d= -f2- | tr -d '[:space:]')
KEY=$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' "$SECRETS" | cut -d= -f2- | tr -d '[:space:]')
DBURL=$(grep -E '^SUPABASE_DB_URL=' "$SECRETS" | head -1 | cut -d= -f2- | tr -d '[:space:]')
PASSWORD="${DEMO_PASSWORD:-colequium123}"
COMM="11111111-1111-1111-1111-111111111111"
[ -n "$URL" ] && [ -n "$KEY" ] && [ -n "$DBURL" ] || { echo "Faltan secretos"; exit 1; }

# ── Nuevos usuarios auth (email | nombre | rol) ──────────────────────────
USERS=(
  "familia4a@laslomas.demo|Mónica Torres|guardian"
  "familia4b@laslomas.demo|Javier Ruiz|guardian"
  "familia5a@laslomas.demo|Patricia Gómez|guardian"
  "familia5b@laslomas.demo|Andrés Castro|guardian"
  "familia6b@laslomas.demo|Gabriela Ortiz|guardian"
  "familia1seca@laslomas.demo|Verónica Díaz|guardian"
  "familia1secb@laslomas.demo|Roberto Silva|guardian"
  "coordsec@laslomas.demo|Lucía Herrera|coordinator"
  "docente4@laslomas.demo|Pablo Sosa|teacher"
  "docente5@laslomas.demo|Carla Núñez|teacher"
  "docentesec@laslomas.demo|Diego Ramos|teacher"
)

echo "▸ Creando usuarios en Supabase Auth…"
for row in "${USERS[@]}"; do
  IFS='|' read -r email name role <<< "$row"
  resp=$(curl -sS -m 20 -X POST "$URL/auth/v1/admin/users" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"full_name\":\"$name\"}}")
  if echo "$resp" | grep -q '"id"'; then echo "  ✓ $email";
  elif echo "$resp" | grep -qiE 'already|registered|exists'; then echo "  • ya existe $email";
  else echo "  ✗ $email → $resp"; fi
done

# ── Renombrar coord@ → coordpri@ (auth) ──────────────────────────────────
echo "▸ Renombrando coord@ → coordpri@…"
COORD_ID=$(psql "$DBURL" -At -c "select id from auth.users where email='coord@laslomas.demo';")
if [ -n "$COORD_ID" ]; then
  curl -sS -m 20 -X PUT "$URL/auth/v1/admin/users/$COORD_ID" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    -d '{"email":"coordpri@laslomas.demo"}' >/dev/null && echo "  ✓ auth renombrado"
fi

# Wiring de membresías/roles para los nuevos usuarios
VALUES=""
for row in "${USERS[@]}"; do IFS='|' read -r email name role <<< "$row"; VALUES+="('$email','$role'),"; done
VALUES="${VALUES%,}"

echo "▸ Estructura + membresías + alumnos + familias + asignaciones…"
psql "$DBURL" -v ON_ERROR_STOP=1 <<SQL
-- ════════════════ 0) Sincronizar email renombrado en public.users ════════
update users set email='coordpri@laslomas.demo' where email='coord@laslomas.demo';

-- ════════════════ 1) Secundaria: nivel + grado + salones ═════════════════
insert into levels (id, community_id, name, position) values
  ('e1000000-0000-0000-0000-000000000001', '$COMM', 'Secundaria', 1)
on conflict (id) do nothing;

insert into grades (id, community_id, level_id, name, position) values
  ('d1000000-0000-0000-0000-000000000001', '$COMM', 'e1000000-0000-0000-0000-000000000001', '1° (secundaria)', 0)
on conflict (id) do nothing;

insert into groups (id, community_id, grade_id, name, position) values
  ('c1000000-0000-0000-0000-000000000001', '$COMM', 'd1000000-0000-0000-0000-000000000001', '1°A (secundaria)', 0),
  ('c1000000-0000-0000-0000-000000000002', '$COMM', 'd1000000-0000-0000-0000-000000000001', '1°B (secundaria)', 1)
on conflict (id) do nothing;

-- ════════════════ 2) Membresías + roles de los nuevos usuarios ═══════════
insert into memberships (community_id, user_id, status)
select '$COMM', u.id, 'active'
from (values $VALUES) as m(email, role_key)
join users u on u.email = m.email
on conflict (community_id, user_id) do nothing;

insert into membership_roles (membership_id, role_id)
select ms.id, r.id
from (values $VALUES) as m(email, role_key)
join users u on u.email = m.email
join memberships ms on ms.user_id = u.id and ms.community_id = '$COMM'
join roles r on r.community_id = '$COMM' and r.key = m.role_key
where not exists (select 1 from membership_roles x where x.membership_id = ms.id and x.role_id = r.id);

-- ════════════════ 3) Alcance de las coordinadoras (nivel) ════════════════
update membership_roles mr set scope_type='level', scope_id='22222222-0000-0000-0000-000000000001'
from memberships ms join users u on u.id=ms.user_id join roles r on r.key='coordinator'
where mr.membership_id=ms.id and mr.role_id=r.id and u.email='coordpri@laslomas.demo';

update membership_roles mr set scope_type='level', scope_id='e1000000-0000-0000-0000-000000000001'
from memberships ms join users u on u.id=ms.user_id join roles r on r.key='coordinator'
where mr.membership_id=ms.id and mr.role_id=r.id and u.email='coordsec@laslomas.demo';

-- ════════════════ 4) Alumnos + inscripciones (5 por salón) ═══════════════
create temp table _st(full_name text, gid uuid, fam text);
insert into _st(full_name, gid, fam) values
  -- 4°A (b…07)
  ('Martina Torres','b0000000-0000-0000-0000-000000000007','familia4a@laslomas.demo'),
  ('Lucas Ibáñez','b0000000-0000-0000-0000-000000000007',null),
  ('Emma Rivas','b0000000-0000-0000-0000-000000000007',null),
  ('Benjamín Soto','b0000000-0000-0000-0000-000000000007',null),
  ('Olivia Paredes','b0000000-0000-0000-0000-000000000007',null),
  -- 4°B (b…08)
  ('Bruno Ruiz','b0000000-0000-0000-0000-000000000008','familia4b@laslomas.demo'),
  ('Renata Vidal','b0000000-0000-0000-0000-000000000008',null),
  ('Tomás Aguirre','b0000000-0000-0000-0000-000000000008',null),
  ('Isabella Moya','b0000000-0000-0000-0000-000000000008',null),
  ('Maximiliano Vera','b0000000-0000-0000-0000-000000000008',null),
  -- 5°A (b…09)
  ('Valentina Gómez','b0000000-0000-0000-0000-000000000009','familia5a@laslomas.demo'),
  ('Santiago Rojas','b0000000-0000-0000-0000-000000000009',null),
  ('Catalina Núñez','b0000000-0000-0000-0000-000000000009',null),
  ('Felipe Cabrera','b0000000-0000-0000-0000-000000000009',null),
  ('Josefina Luna','b0000000-0000-0000-0000-000000000009',null),
  -- 5°B (b…0a)
  ('Thiago Castro','b0000000-0000-0000-0000-00000000000a','familia5b@laslomas.demo'),
  ('Antonia Flores','b0000000-0000-0000-0000-00000000000a',null),
  ('Joaquín Herrera','b0000000-0000-0000-0000-00000000000a',null),
  ('Mía Sánchez','b0000000-0000-0000-0000-00000000000a',null),
  ('Gael Domínguez','b0000000-0000-0000-0000-00000000000a',null),
  -- 6°A (b…0b) — ya está Lucía Fernández; sumamos 4
  ('Pedro Salas','b0000000-0000-0000-0000-00000000000b',null),
  ('Florencia Ortiz','b0000000-0000-0000-0000-00000000000b',null),
  ('Nicolás Peña','b0000000-0000-0000-0000-00000000000b',null),
  ('Agustina Ramos','b0000000-0000-0000-0000-00000000000b',null),
  -- 6°B (2222…03) — ya está Tomás Méndez; sumamos familia6b + 3
  ('Mateo Ortiz','22222222-0000-0000-0000-000000000003','familia6b@laslomas.demo'),
  ('Camila Suárez','22222222-0000-0000-0000-000000000003',null),
  ('Lautaro Gil','22222222-0000-0000-0000-000000000003',null),
  ('Victoria Ponce','22222222-0000-0000-0000-000000000003',null),
  -- 1°A Sec (c1…01)
  ('Camila Díaz','c1000000-0000-0000-0000-000000000001','familia1seca@laslomas.demo'),
  ('Ignacio Bravo','c1000000-0000-0000-0000-000000000001',null),
  ('Julieta Campos','c1000000-0000-0000-0000-000000000001',null),
  ('Matías Reyes','c1000000-0000-0000-0000-000000000001',null),
  ('Delfina Acosta','c1000000-0000-0000-0000-000000000001',null),
  -- 1°B Sec (c1…02)
  ('Joaquín Silva','c1000000-0000-0000-0000-000000000002','familia1secb@laslomas.demo'),
  ('Abril Medina','c1000000-0000-0000-0000-000000000002',null),
  ('Bautista León','c1000000-0000-0000-0000-000000000002',null),
  ('Guadalupe Ríos','c1000000-0000-0000-0000-000000000002',null),
  ('Franco Cáceres','c1000000-0000-0000-0000-000000000002',null);

-- Crear alumnos que no existan (por nombre dentro de la comunidad)
insert into students (community_id, full_name)
select '$COMM', s.full_name from _st s
where not exists (select 1 from students x where x.community_id='$COMM' and x.full_name=s.full_name);

-- Inscribir en su salón (año académico actual)
insert into student_enrollments (student_id, group_id, academic_year_id)
select st.id, s.gid, '22222222-0000-0000-0000-000000000004'
from _st s join students st on st.full_name=s.full_name and st.community_id='$COMM'
where not exists (select 1 from student_enrollments e where e.student_id=st.id and e.group_id=s.gid);

-- ════════════════ 5) Guardianship: familia ↔ alumno del salón ════════════
insert into guardianships (guardian_membership_id, student_id, relationship,
                           can_pickup, can_pay, can_report_absence, is_primary_contact, receives_billing)
select ms.id, st.id, 'madre', true, true, true, true, true
from _st s
join students st on st.full_name=s.full_name and st.community_id='$COMM'
join users u on u.email=s.fam
join memberships ms on ms.user_id=u.id and ms.community_id='$COMM'
where s.fam is not null
and not exists (select 1 from guardianships g where g.guardian_membership_id=ms.id and g.student_id=st.id);

-- ════════════════ 6) Asignaciones de salones a docentes ══════════════════
insert into staff_group_assignments (membership_id, group_id, role)
select ms.id, a.gid::uuid, 'tutor'
from (values
  ('docente4@laslomas.demo','b0000000-0000-0000-0000-000000000007'),
  ('docente4@laslomas.demo','b0000000-0000-0000-0000-000000000008'),
  ('docente5@laslomas.demo','b0000000-0000-0000-0000-000000000009'),
  ('docente5@laslomas.demo','b0000000-0000-0000-0000-00000000000b'),
  ('docentesec@laslomas.demo','c1000000-0000-0000-0000-000000000001'),
  ('docentesec@laslomas.demo','c1000000-0000-0000-0000-000000000002')
) as a(email, gid)
join users u on u.email=a.email
join memberships ms on ms.user_id=u.id and ms.community_id='$COMM'
where not exists (select 1 from staff_group_assignments x where x.membership_id=ms.id and x.group_id=a.gid::uuid);
SQL

echo "▸ Resumen alumnos por salón:"
psql "$DBURL" -At -F'  ' -c "
select gr.name, count(se.student_id)
from groups gr left join student_enrollments se on se.group_id=gr.id
where gr.community_id='$COMM' group by gr.name order by gr.name;"
echo "✔ Listo. Contraseña de todos: $PASSWORD"
