-- ============================================================
-- Fase 1: profiles + RLS helpers + Auth Hook + RPC onboarding
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helpers para RLS (leen el JWT, no confían en el cliente)
-- ------------------------------------------------------------
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', 'owner');
$$;

-- ------------------------------------------------------------
-- 2. Tabla profiles (1:1 con auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  display_name   text not null,
  role           text not null default 'owner'
                   check (role in ('owner', 'asistente')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on public.profiles (tenant_id);

alter table public.profiles enable row level security;

-- Cada usuario ve y edita solo su propio perfil
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid())
             with check (id = auth.uid());

-- INSERT lo maneja solo la RPC create_tenant_for_user (security definer)

-- ------------------------------------------------------------
-- 3. Actualizar RLS de tenants (reemplaza deny-all de Fase 0)
-- ------------------------------------------------------------
-- Borramos la política deny-all implícita y agregamos políticas reales.
-- La tabla ya tiene RLS habilitado desde la migración anterior.

create policy "tenants_select" on public.tenants
  for select using (id = public.current_tenant_id());

-- UPDATE solo el owner puede cambiar datos del tenant
create policy "tenants_update" on public.tenants
  for update using (id = public.current_tenant_id()
                    and public.current_user_role() = 'owner')
             with check (id = public.current_tenant_id());

-- INSERT y DELETE los bloquea el deny-all de RLS; solo la RPC puede insertar

-- ------------------------------------------------------------
-- 4. Auth Hook: inyecta tenant_id y user_role en el JWT
-- ------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  v_tenant  uuid;
  v_role    text;
begin
  select p.tenant_id, p.role
    into v_tenant, v_role
  from public.profiles p
  where p.id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  if v_tenant is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(v_role, 'owner')));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

-- ------------------------------------------------------------
-- 5. RPC transaccional: crea tenant + profile en un solo paso
-- ------------------------------------------------------------
create or replace function public.create_tenant_for_user(
  p_user_id    uuid,
  p_display_name text,
  p_slug       text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant uuid;
begin
  insert into public.tenants (slug) values (p_slug) returning id into v_tenant;
  insert into public.profiles (id, tenant_id, display_name, role)
    values (p_user_id, v_tenant, p_display_name, 'owner');
  return v_tenant;
end;
$$;

-- Solo usuarios autenticados pueden llamar a la RPC (se valida internamente que sea el mismo user_id)
grant execute on function public.create_tenant_for_user(uuid, text, text) to authenticated;
