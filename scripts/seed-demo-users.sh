#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Crea los usuarios DEMO (uno por rol) para probar la plataforma en la reunión.
# - Crea cada usuario en Supabase Auth (admin API), email ya confirmado.
# - Los conecta a la comunidad demo (0004) con su rol (membership + role).
# Idempotente: se puede correr varias veces sin duplicar.
#
# Lee los secretos del archivo FUERA del repo (no se commitea):
#   SECRETS=../colequium.secrets.env.local  (override con env SECRETS=...)
#
# Uso:  bash scripts/seed-demo-users.sh
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

SECRETS="${SECRETS:-../colequium.secrets.env.local}"
[ -f "$SECRETS" ] || { echo "No encuentro el archivo de secretos: $SECRETS"; exit 1; }

URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' "$SECRETS" | cut -d= -f2- | tr -d '[:space:]')
KEY=$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' "$SECRETS" | cut -d= -f2- | tr -d '[:space:]')
DBURL=$(grep -E '^SUPABASE_DB_URL=' "$SECRETS" | head -1 | cut -d= -f2- | tr -d '[:space:]')
PASSWORD="${DEMO_PASSWORD:-colequium123}"
COMMUNITY="11111111-1111-1111-1111-111111111111"

[ -n "$URL" ] && [ -n "$KEY" ] && [ -n "$DBURL" ] || { echo "Faltan secretos (URL/KEY/DBURL)"; exit 1; }

# email | nombre completo | role_key
USERS=(
  "principal@laslomas.demo|Beatriz Salas|principal"
  "coord@laslomas.demo|Carlos Vega|coordinator"
  "docente@laslomas.demo|Valentina Ríos|teacher"
  "familia@laslomas.demo|Marina López|guardian"
  "alumno@laslomas.demo|Tomás Méndez|student"
  "chofer@laslomas.demo|Raúl Gómez|driver"
  "admin@laslomas.demo|Equipo Administración|support_staff"
  "demo@colequium.com|Docente Demo|teacher"
)

echo "▸ Creando usuarios en Supabase Auth…"
for row in "${USERS[@]}"; do
  IFS='|' read -r email name role <<< "$row"
  resp=$(curl -sS -m 20 -X POST "$URL/auth/v1/admin/users" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"full_name\":\"$name\"}}")
  if echo "$resp" | grep -q '"id"'; then
    echo "  ✓ creado   $email ($role)"
  elif echo "$resp" | grep -qiE 'already|registered|exists'; then
    echo "  • ya existe $email ($role)"
  else
    echo "  ✗ error    $email → $resp"
  fi
done

echo "▸ Conectando membresías + roles en la comunidad demo…"
# Construye el VALUES (email, role_key) para el wiring SQL.
VALUES=""
for row in "${USERS[@]}"; do
  IFS='|' read -r email name role <<< "$row"
  VALUES+="('$email','$role'),"
done
VALUES="${VALUES%,}"

# OJO: dos sentencias separadas. Si se insertan las membresías y los roles en
# un mismo statement (CTE), el join a `memberships` usa el snapshot previo y no
# ve las filas recién creadas → 0 roles.
psql "$DBURL" -v ON_ERROR_STOP=1 <<SQL
-- 1) Membresías
insert into memberships (community_id, user_id, status)
select '$COMMUNITY'::uuid, u.id, 'active'
from (values $VALUES) as m(email, role_key)
join users u on u.email = m.email
on conflict (community_id, user_id) do nothing;

-- 2) Roles de cada membresía
insert into membership_roles (membership_id, role_id)
select ms.id, r.id
from (values $VALUES) as m(email, role_key)
join users u  on u.email = m.email
join memberships ms on ms.user_id = u.id and ms.community_id = '$COMMUNITY'::uuid
join roles r on r.community_id = '$COMMUNITY'::uuid and r.key = m.role_key
where not exists (
  select 1 from membership_roles x where x.membership_id = ms.id and x.role_id = r.id
);
SQL

echo "▸ Resumen:"
psql "$DBURL" -At <<SQL
select u.email || '  →  ' || r.key
from membership_roles mr
join memberships ms on ms.id = mr.membership_id and ms.community_id = '$COMMUNITY'::uuid
join users u on u.id = ms.user_id
join roles r on r.id = mr.role_id
order by u.email;
SQL

echo "✔ Listo. Contraseña de todos: $PASSWORD"
