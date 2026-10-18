-- Avatar uploads use upsert, which Supabase Storage only allows when the user
-- can also read the object. Without this, uploads failed with "new row
-- violates row-level security policy". Photos are still public via their URLs
-- because the bucket is public; this only covers reading through the API.
create policy "Users read their own avatar files"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
