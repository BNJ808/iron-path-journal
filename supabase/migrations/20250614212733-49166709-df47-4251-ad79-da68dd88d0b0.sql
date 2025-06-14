
-- Create a table for public profiles
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  username text unique,
  updated_at timestamp with time zone default now()
);

-- Add a constraint to the username
alter table public.profiles 
add constraint username_length check (char_length(username) >= 3);

-- Set up Row Level Security (RLS)
alter table public.profiles
  enable row level security;

create policy "Profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
