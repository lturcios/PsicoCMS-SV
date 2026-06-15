-- Tabla registro de tenants (consultorios/profesionales).
-- Es la tabla raíz referenciada por tenant_id desde el resto de tablas de negocio.
create table public.tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  plan        text not null default 'free',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.tenants is 'Registro de tenants (consultorios/profesionales). Referenciada por tenant_id desde las tablas de negocio.';

alter table public.tenants enable row level security;

-- Placeholder deny-all: sin políticas de lectura/escritura hasta Fase 1, cuando
-- existan el Custom Access Token Hook y la RPC transaccional de onboarding
-- (create_tenant_for_user). Ver skill supabase-db-rls.
create policy "tenants_deny_all" on public.tenants
  for all
  using (false)
  with check (false);
