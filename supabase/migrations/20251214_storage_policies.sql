-- Storage policies for public buckets with constrained paths and ownership
create policy "public read avatars"
on storage.objects for select
using (bucket_id = 'profile-avatars');

create policy "public read post images"
on storage.objects for select
using (bucket_id = 'post-images');

create policy "public read space icons"
on storage.objects for select
using (bucket_id = 'space-icons');

create policy "users upload own avatar png"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and lower(name) = lower(auth.uid()::text || '.png')
);

create policy "users update own avatar png"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-avatars'
  and lower(name) = lower(auth.uid()::text || '.png')
)
with check (
  bucket_id = 'profile-avatars'
  and lower(name) = lower(auth.uid()::text || '.png')
);

create policy "authors upload post jpg"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'post-images'
  and lower(split_part(name, '.', 2)) = 'jpg'
  and exists (
    select 1
    from public.posts p
    where p.id = split_part(name, '.', 1)
      and p.author_id = auth.uid()
  )
);

create policy "authors update post jpg"
on storage.objects for update to authenticated
using (
  bucket_id = 'post-images'
  and lower(split_part(name, '.', 2)) = 'jpg'
  and exists (
    select 1
    from public.posts p
    where p.id = split_part(name, '.', 1)
      and p.author_id = auth.uid()
  )
)
with check (
  bucket_id = 'post-images'
  and lower(split_part(name, '.', 2)) = 'jpg'
  and exists (
    select 1
    from public.posts p
    where p.id = split_part(name, '.', 1)
      and p.author_id = auth.uid()
  )
);

create policy "creators upload space icon png"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'space-icons'
  and lower(split_part(name, '.', 2)) = 'png'
  and exists (
    select 1
    from public.spaces s
    where s.id = split_part(name, '.', 1)
      and s.creator_id = auth.uid()
  )
);

create policy "creators update space icon png"
on storage.objects for update to authenticated
using (
  bucket_id = 'space-icons'
  and lower(split_part(name, '.', 2)) = 'png'
  and exists (
    select 1
    from public.spaces s
    where s.id = split_part(name, '.', 1)
      and s.creator_id = auth.uid()
  )
)
with check (
  bucket_id = 'space-icons'
  and lower(split_part(name, '.', 2)) = 'png'
  and exists (
    select 1
    from public.spaces s
    where s.id = split_part(name, '.', 1)
      and s.creator_id = auth.uid()
  )
);
