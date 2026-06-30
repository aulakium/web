-- Preferencias de notificación por usuario. JSON: { "push": { "<categoría>": bool } }
-- Categorías: comunicado, invitacion, tarea, mensaje. Lo no seteado usa el default
-- del código (solo tarea + mensaje mandan push por defecto). Email queda para después.
alter table public.users
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;
