-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Documentos: acceso al bucket de Storage + visibilidad de filas.
-- v1: el repositorio de documentos del colegio es visible para los miembros de
-- la comunidad (circulares, reglamentos, etc.). El alcance fino por carpeta/
-- audiencia se agrega más adelante (la tabla `audiences` ya soporta 'document').
-- ════════════════════════════════════════════════════════════════════════

-- Bucket privado 'documents' (creado aparte). Lectura para autenticados.
drop policy if exists "documents_read" on storage.objects;
create policy "documents_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents');

-- document_folders / documents ya tienen aislamiento por comunidad (0002).
-- Nada más que hacer acá por ahora.
