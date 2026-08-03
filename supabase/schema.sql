-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- (Project → SQL Editor → New query → pega y ejecuta).

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word text not null,
  language text not null check (language in ('es', 'en')),
  created_at timestamptz not null default now(),
  unique (user_id, word, language)
);

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word text not null,
  language text not null check (language in ('es', 'en')),
  searched_at timestamptz not null default now()
);

alter table public.favorites enable row level security;
alter table public.search_history enable row level security;

create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own history" on public.search_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
