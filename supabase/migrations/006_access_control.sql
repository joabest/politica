-- Arcanum — controle de acesso e auditoria
create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  active boolean not null default true,
  permissions text[] not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text not null default '',
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.user_access enable row level security;
alter table public.audit_logs enable row level security;

-- O administrador principal é validado pelo e-mail do JWT.
create or replace function public.is_arcanum_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select lower(coalesce(auth.jwt()->>'email',''))='joab@admin.com'
$$;

drop policy if exists "admin_manage_user_access" on public.user_access;
create policy "admin_manage_user_access" on public.user_access for all to authenticated
using (public.is_arcanum_admin()) with check (public.is_arcanum_admin());

drop policy if exists "user_read_own_access" on public.user_access;
create policy "user_read_own_access" on public.user_access for select to authenticated
using (user_id=auth.uid() or public.is_arcanum_admin());

drop policy if exists "admin_read_audit_logs" on public.audit_logs;
create policy "admin_read_audit_logs" on public.audit_logs for select to authenticated
using (public.is_arcanum_admin());

drop policy if exists "authenticated_insert_audit_logs" on public.audit_logs;
create policy "authenticated_insert_audit_logs" on public.audit_logs for insert to authenticated
with check (actor_id=auth.uid());

create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);

-- Importante: senhas do Supabase Auth são hashes e não podem ser visualizadas.
-- Para suporte, use o fluxo oficial de redefinição de senha.
