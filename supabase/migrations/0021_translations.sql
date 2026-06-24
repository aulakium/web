-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Caché de traducciones (compartido entre todos los usuarios).
-- La 1ª persona que ve un aviso en otro idioma dispara 1 traducción; se guarda
-- y el resto la lee de acá (gratis). 1 llamada por (contenido + idioma), para
-- siempre. RLS habilitado SIN policies → solo el server (service-role) accede;
-- los clientes no tocan la tabla directo.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,                 -- 'post'
  content_id uuid not null,
  target_lang text not null,                  -- 'pt-BR' | 'en' | ...
  source_lang text default 'es',
  title text,
  body text,
  provider text,                              -- 'gemini' | 'azure' | ...
  created_at timestamptz not null default now(),
  unique (content_type, content_id, target_lang)
);

alter table public.translations enable row level security;
-- Sin policies a propósito: el acceso va por el cliente service-role del server.
