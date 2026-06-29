-- ════════════════════════════════════════════════════════════════════════
-- Colequium — habilitar Realtime en posts: el muro se actualiza solo cuando
-- alguien publica (el cliente recibe el INSERT y refresca el feed con RLS).
-- ════════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.posts;
