---
name: supabase-db-rls
description: >
  Usar SIEMPRE que la tarea toque la base de datos de Supabase: crear o modificar
  tablas, escribir migraciones SQL, definir o cambiar políticas RLS, configurar el
  Auth Hook, generar tipos, crear buckets de Storage, o escribir RPC/funciones de
  Postgres. Es la skill que garantiza el aislamiento multi-tenant. Disparar ante
  cualquier mención de migración, RLS, policy, tenant_id, Storage, Edge Function de
  base de datos, o "tabla nueva".
---

# Supabase + RLS multi-tenant

Esta skill define el patrón **obligatorio** para todo lo que toque la base de datos. El aislamiento entre tenants vive aquí, no en el código de aplicación.

## Reglas absolutas
1. **Toda tabla de negocio** lleva `tenant_id uuid not null references public.tenants(id) on delete cascade`.
2. **Toda tabla** tiene `alter table ... enable row level security;` y políticas explícitas. Sin RLS = error.
3. Las políticas filtran por `public.current_tenant_id()` (helper que lee el JWT). Nunca por un valor pasado desde el cliente.
4. El cliente usa **solo** la `anon key`. La `service_role` solo vive en Edge Functions / CI.
5. Adjuntos clínicos → bucket **privado**. Activos públicos → puede ser público.
6. Migraciones versionadas, una por cambio. Nunca editar una migración ya mergeada a main.
7. Tipos generados a `src/lib/supabase/database.types.ts` con `pnpm supabase gen types`. No editar a mano.

## El claim `tenant_id` en el JWT (Auth Hook)

El aislamiento depende de que el JWT traiga `tenant_id`. Se inyecta con un **Custom Access Token Hook**:

```sql
-- migration: custom_access_token_hook
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

-- Permisos: solo el rol de auth puede ejecutarlo
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
```

> Después de crear el hook, **hay que habilitarlo** en la config de Auth del proyecto (Dashboard → Authentication → Hooks, o en `config.toml` local). El claim no aparece hasta que el usuario **renueva** su sesión.

## Helper para RLS

```sql
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
```

## Plantilla de tabla + RLS (copiar para cada tabla nueva)

```sql
create table public.patients (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  full_name     text not null,
  dui           text,                       -- formato ########-#
  phone         text,                       -- celular +503
  email         text,
  birth_date    date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.patients (tenant_id);

alter table public.patients enable row level security;

create policy "patients_select" on public.patients
  for select using (tenant_id = public.current_tenant_id());

create policy "patients_insert" on public.patients
  for insert with check (tenant_id = public.current_tenant_id());

create policy "patients_update" on public.patients
  for update using (tenant_id = public.current_tenant_id())
            with check (tenant_id = public.current_tenant_id());

create policy "patients_delete" on public.patients
  for delete using (tenant_id = public.current_tenant_id());
```

> En `insert`, **no** confíes en que el cliente mande el `tenant_id` correcto: ponelo desde el servidor o usá un trigger `before insert` que haga `new.tenant_id := public.current_tenant_id()`.

### Restricción de rol (ej: notas clínicas solo para owner)
```sql
create policy "clinical_notes_owner_only" on public.clinical_notes
  for all using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() = 'owner'
  );
```

## Páginas públicas (booking/blog) sin exponer RLS

Las páginas públicas no tienen sesión, así que `current_tenant_id()` es null. Para leer datos públicos por `slug`, usar una **RPC `security definer`** que expone solo lo público:

```sql
create or replace function public.get_public_profile(p_slug text)
returns table (display_name text, bio text, photo_url text, services jsonb)
language sql
security definer
set search_path = public
as $$
  select pr.display_name, pr.bio, pr.photo_url,
         (select jsonb_agg(s) from public.services s
          where s.tenant_id = t.id and s.is_active) as services
  from public.tenants t
  join public.profiles pr on pr.tenant_id = t.id
  where t.slug = p_slug and t.is_active;
$$;

grant execute on function public.get_public_profile(text) to anon;
```

> `security definer` salta RLS, así que la función debe seleccionar **solo** columnas públicas y filtrar bien. Nunca exponer datos clínicos por esta vía.

## Storage

```sql
-- bucket privado para adjuntos clínicos (NUNCA público)
insert into storage.buckets (id, name, public) values ('clinical', 'clinical', false);

create policy "clinical_read" on storage.objects
  for select using (
    bucket_id = 'clinical'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and public.current_user_role() = 'owner'
  );
-- política análoga para insert/update/delete
```
> Convención de rutas en Storage clínico: `clinical/{tenant_id}/{patient_id}/{archivo}`. El primer segmento (`tenant_id`) se usa en la policy.

## Gotchas
- El claim no existe hasta refrescar sesión tras configurar el hook → en local, cerrá y abrí sesión.
- `gen_random_uuid()` requiere `pgcrypto` (suele venir activo en Supabase).
- No olvidar índice en `tenant_id` (todas las queries filtran por él).
- `updated_at`: usar trigger `moddatetime` o setearlo en el update.
- Probar el aislamiento con DOS tenants reales antes de dar por buena cualquier tabla.

## Checklist al tocar la BD
- [ ] La tabla tiene `tenant_id not null` + FK + índice
- [ ] RLS habilitado + políticas select/insert/update/delete
- [ ] `insert` no confía en el `tenant_id` del cliente
- [ ] Tipos regenerados
- [ ] Migración nombrada y versionada
- [ ] Aislamiento probado con 2 tenants
