-- Arcanum Fase 6 — campanhas e relacionamento inicial
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 180),
  candidate_name text not null default '',
  office text not null default '',
  party text not null default '',
  city text not null default '',
  state text not null default 'SP' check (char_length(state) = 2),
  election_year integer not null default 2028 check (election_year between 2024 and 2100),
  slogan text not null default '',
  status text not null default 'planejamento' check (status in ('planejamento','ativa','pausada','encerrada')),
  primary_color text not null default '#6d5dfc',
  secondary_color text not null default '#13c6b3',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;
drop policy if exists "campaigns_all_own" on public.campaigns;
create policy "campaigns_all_own" on public.campaigns for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

alter table public.work_items add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;
alter table public.saved_strategies add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;
alter table public.calendar_events add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;
alter table public.content_items add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;

create index if not exists campaigns_owner_idx on public.campaigns(owner_id);
create index if not exists work_items_campaign_idx on public.work_items(campaign_id);
create index if not exists strategies_campaign_idx on public.saved_strategies(campaign_id);
create index if not exists events_campaign_idx on public.calendar_events(campaign_id);
create index if not exists content_campaign_idx on public.content_items(campaign_id);
