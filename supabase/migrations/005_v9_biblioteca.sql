-- Arcanum V9 — Biblioteca Inteligente

create table if not exists public.library_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'Outros',
  tags text[] not null default '{}',
  file_path text not null,
  file_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.library_documents enable row level security;
drop policy if exists "library_documents_all_own" on public.library_documents;
create policy "library_documents_all_own" on public.library_documents
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists library_documents_campaign_idx on public.library_documents(campaign_id);
create index if not exists library_documents_created_idx on public.library_documents(created_at desc);

insert into storage.buckets (id,name,public,file_size_limit)
values ('campaign-documents','campaign-documents',false,20971520)
on conflict (id) do update set public=false,file_size_limit=20971520;

drop policy if exists "campaign_documents_select_own" on storage.objects;
create policy "campaign_documents_select_own" on storage.objects for select
to authenticated using (bucket_id='campaign-documents' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "campaign_documents_insert_own" on storage.objects;
create policy "campaign_documents_insert_own" on storage.objects for insert
to authenticated with check (bucket_id='campaign-documents' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "campaign_documents_delete_own" on storage.objects;
create policy "campaign_documents_delete_own" on storage.objects for delete
to authenticated using (bucket_id='campaign-documents' and (storage.foldername(name))[1]=auth.uid()::text);
