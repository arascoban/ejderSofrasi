insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'wiki-originals',
    'wiki-originals',
    false,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'wiki-published',
    'wiki-published',
    false,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Editors can read original wiki media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'wiki-originals'
    and (select private.is_editor())
  );

create policy "Editors can read published wiki media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'wiki-published'
    and (select private.is_editor())
  );

create policy "Editors can upload immutable original wiki media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'wiki-originals'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (select private.is_editor())
  );

create policy "Editors can upload immutable published wiki media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'wiki-published'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (select private.is_editor())
  );

create policy "Owners can clean up orphaned wiki media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('wiki-originals', 'wiki-published')
    and (select private.is_owner())
  );

comment on policy "Editors can upload immutable original wiki media" on storage.objects is
  'No UPDATE policy exists: replacing an image requires a new object path and media record.';

-- wiki-published stays private. The application route checks active publication access.
