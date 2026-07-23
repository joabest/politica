-- Arcanum Fase 5 — schema inicial
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('admin','strategist','content','member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180),
  description text not null default '',
  status text not null default 'backlog' check (status in ('backlog','em_andamento','revisao','concluido')),
  priority text not null default 'media' check (priority in ('baixa','media','alta','critica')),
  due_date date,
  assignee text not null default 'Equipe',
  category text not null default 'Planejamento',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_strategies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  candidate text,
  objective text not null default '',
  evidence jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  status text not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  category text not null default 'planejamento',
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  profile text,
  format text not null default 'post',
  objective text not null default '',
  status text not null default 'ideia',
  scheduled_for timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_favorites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  resource_key text not null,
  created_at timestamptz not null default now(),
  unique(owner_id, resource_key)
);

alter table public.profiles enable row level security;
alter table public.work_items enable row level security;
alter table public.saved_strategies enable row level security;
alter table public.calendar_events enable row level security;
alter table public.content_items enable row level security;
alter table public.library_favorites enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "work_items_all_own" on public.work_items for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "saved_strategies_all_own" on public.saved_strategies for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "calendar_events_all_own" on public.calendar_events for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "content_items_all_own" on public.content_items for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "library_favorites_all_own" on public.library_favorites for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
