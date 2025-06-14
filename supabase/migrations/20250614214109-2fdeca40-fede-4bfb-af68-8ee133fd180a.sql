
-- Add avatar_url to profiles table
alter table public.profiles
add column avatar_url text;

-- Create a new bucket for avatars in Supabase Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']);

-- Set up RLS policies for the avatars bucket

-- Allow public read access to everyone
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload an avatar
create policy "Authenticated users can upload an avatar."
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' );

-- Allow users to update their own avatar
create policy "Users can update their own avatars."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

-- Allow users to delete their own avatar
create policy "Users can delete their own avatars."
  on storage.objects for delete
  using ( auth.uid() = owner );
