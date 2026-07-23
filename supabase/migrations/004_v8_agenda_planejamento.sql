-- Arcanum V8 — agenda e planejamento vinculados à campanha

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  description text not null default '',
  event_type text not null default 'agenda' check (event_type in ('agenda','prazo','conteudo','reuniao','evento')),
  status text not null default 'planejado' check (status in ('planejado','confirmado','concluido','cancelado')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null default '',
  responsible text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaign_events enable row level security;
drop policy if exists "campaign_events_all_own" on public.campaign_events;
create policy "campaign_events_all_own" on public.campaign_events
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists campaign_events_campaign_idx on public.campaign_events(campaign_id);
create index if not exists campaign_events_starts_at_idx on public.campaign_events(starts_at);

-- Preserva tarefas existentes e passa a vincular novas tarefas à campanha ativa.
alter table public.work_items
  add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;

create index if not exists work_items_campaign_idx on public.work_items(campaign_id);
