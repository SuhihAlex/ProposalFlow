begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'company-assets',
  'company-assets',
  true,
  2097152,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can list their own company assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] =
    (select auth.uid()::text)
);

create policy "Users can upload their own company assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] =
    (select auth.uid()::text)
  and lower(storage.extension(name)) in (
    'png',
    'jpg',
    'jpeg',
    'webp'
  )
);

create policy "Users can update their own company assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] =
    (select auth.uid()::text)
)
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] =
    (select auth.uid()::text)
  and lower(storage.extension(name)) in (
    'png',
    'jpg',
    'jpeg',
    'webp'
  )
);

create policy "Users can delete their own company assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] =
    (select auth.uid()::text)
);

commit;