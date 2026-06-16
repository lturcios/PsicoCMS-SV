-- ============================================================
-- Fase 2: configuración del consultorio
-- Tablas: clinic_settings, specialties, services,
--         availability_schedules, availability_exceptions
-- ============================================================

-- ------------------------------------------------------------
-- Helpers de trigger
-- ------------------------------------------------------------

-- Fuerza tenant_id desde el JWT en INSERT (el cliente no necesita enviarlo)
create or replace function public.set_tenant_id()
returns trigger
language plpgsql
as $$
begin
  new.tenant_id := public.current_tenant_id();
  return new;
end;
$$;

-- Actualiza updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 1. clinic_settings (1:1 con tenant)
-- ------------------------------------------------------------
create table public.clinic_settings (
  id                 uuid        primary key default gen_random_uuid(),
  tenant_id          uuid        not null unique references public.tenants(id) on delete cascade,
  -- Datos del profesional
  professional_name  text,
  title              text,                    -- Lic., Dr., Dra.
  credential_number  text,                    -- colegiatura JVPP
  bio                text,
  photo_url          text,                    -- Cloudinary (activo público)
  logo_url           text,                    -- Cloudinary (activo público)
  -- Política de reservas
  cancellation_hours int         not null default 24,  -- mínimo de horas para cancelar
  min_advance_hours  int         not null default 24,  -- anticipación mínima para reservar
  -- Contacto
  phone              text,                    -- celular +503XXXXXXXX
  whatsapp           text,                    -- WhatsApp +503XXXXXXXX
  department         text,                    -- departamento SV
  municipality       text,
  address            text,
  instagram_url      text,
  facebook_url       text,
  website_url        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index on public.clinic_settings (tenant_id);

alter table public.clinic_settings enable row level security;

-- Solo el owner del tenant puede ver y editar su configuración
create policy "clinic_settings_select" on public.clinic_settings
  for select using (tenant_id = public.current_tenant_id());

create policy "clinic_settings_update" on public.clinic_settings
  for update using  (tenant_id = public.current_tenant_id())
             with check (tenant_id = public.current_tenant_id());

-- INSERT solo desde la RPC (security definer) → no se necesita policy de insert

create trigger handle_updated_at
  before update on public.clinic_settings
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 2. specialties
-- ------------------------------------------------------------
create table public.specialties (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null references public.tenants(id) on delete cascade,
  name        text        not null,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);

create index on public.specialties (tenant_id);

alter table public.specialties enable row level security;

create policy "specialties_select" on public.specialties
  for select using (tenant_id = public.current_tenant_id());

create policy "specialties_insert" on public.specialties
  for insert with check (tenant_id = public.current_tenant_id());

create policy "specialties_update" on public.specialties
  for update using  (tenant_id = public.current_tenant_id())
             with check (tenant_id = public.current_tenant_id());

create policy "specialties_delete" on public.specialties
  for delete using (tenant_id = public.current_tenant_id());

create trigger set_tenant_id
  before insert on public.specialties
  for each row execute function public.set_tenant_id();

-- ------------------------------------------------------------
-- 3. services
-- ------------------------------------------------------------
create table public.services (
  id               uuid           primary key default gen_random_uuid(),
  tenant_id        uuid           not null references public.tenants(id) on delete cascade,
  name             text           not null,
  description      text,
  modality         text           not null default 'presencial'
                                    check (modality in ('online', 'presencial', 'ambas')),
  duration_minutes int            not null default 50
                                    check (duration_minutes > 0),
  price_usd        numeric(10, 2) check (price_usd >= 0),
  is_active        bool           not null default true,
  sort_order       int            not null default 0,
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now()
);

create index on public.services (tenant_id);
create index on public.services (tenant_id, is_active);

alter table public.services enable row level security;

create policy "services_select" on public.services
  for select using (tenant_id = public.current_tenant_id());

create policy "services_insert" on public.services
  for insert with check (tenant_id = public.current_tenant_id());

create policy "services_update" on public.services
  for update using  (tenant_id = public.current_tenant_id())
             with check (tenant_id = public.current_tenant_id());

create policy "services_delete" on public.services
  for delete using (tenant_id = public.current_tenant_id());

create trigger set_tenant_id
  before insert on public.services
  for each row execute function public.set_tenant_id();

create trigger handle_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 4. availability_schedules (horario semanal recurrente)
-- ------------------------------------------------------------
create table public.availability_schedules (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  day_of_week int  not null check (day_of_week between 0 and 6),  -- 0=domingo
  start_time  time not null,
  end_time    time not null,
  is_active   bool not null default true,
  constraint availability_schedules_time_check check (end_time > start_time),
  unique (tenant_id, day_of_week)
);

create index on public.availability_schedules (tenant_id);

alter table public.availability_schedules enable row level security;

create policy "availability_schedules_select" on public.availability_schedules
  for select using (tenant_id = public.current_tenant_id());

create policy "availability_schedules_insert" on public.availability_schedules
  for insert with check (tenant_id = public.current_tenant_id());

create policy "availability_schedules_update" on public.availability_schedules
  for update using  (tenant_id = public.current_tenant_id())
             with check (tenant_id = public.current_tenant_id());

create policy "availability_schedules_delete" on public.availability_schedules
  for delete using (tenant_id = public.current_tenant_id());

create trigger set_tenant_id
  before insert on public.availability_schedules
  for each row execute function public.set_tenant_id();

-- ------------------------------------------------------------
-- 5. availability_exceptions (fechas bloqueadas o con horario especial)
-- ------------------------------------------------------------
create table public.availability_exceptions (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null references public.tenants(id) on delete cascade,
  date        date        not null,
  start_time  time,                    -- null = día completo bloqueado
  end_time    time,
  reason      text,
  type        text        not null default 'blocked'
                            check (type in ('blocked', 'special_hours')),
  created_at  timestamptz not null default now()
);

create index on public.availability_exceptions (tenant_id);
create index on public.availability_exceptions (tenant_id, date);

alter table public.availability_exceptions enable row level security;

create policy "availability_exceptions_select" on public.availability_exceptions
  for select using (tenant_id = public.current_tenant_id());

create policy "availability_exceptions_insert" on public.availability_exceptions
  for insert with check (tenant_id = public.current_tenant_id());

create policy "availability_exceptions_update" on public.availability_exceptions
  for update using  (tenant_id = public.current_tenant_id())
             with check (tenant_id = public.current_tenant_id());

create policy "availability_exceptions_delete" on public.availability_exceptions
  for delete using (tenant_id = public.current_tenant_id());

create trigger set_tenant_id
  before insert on public.availability_exceptions
  for each row execute function public.set_tenant_id();

-- ------------------------------------------------------------
-- 6. Actualizar RPC: create_tenant_for_user crea clinic_settings vacío
-- ------------------------------------------------------------
create or replace function public.create_tenant_for_user(
  p_user_id      uuid,
  p_display_name text,
  p_slug         text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant uuid;
begin
  insert into public.tenants (slug)
    values (p_slug)
    returning id into v_tenant;

  insert into public.profiles (id, tenant_id, display_name, role)
    values (p_user_id, v_tenant, p_display_name, 'owner');

  insert into public.clinic_settings (tenant_id)
    values (v_tenant);

  return v_tenant;
end;
$$;

-- ------------------------------------------------------------
-- 7. Backfill: clinic_settings para tenants creados antes de esta migración
-- ------------------------------------------------------------
insert into public.clinic_settings (tenant_id)
select id from public.tenants
where id not in (select tenant_id from public.clinic_settings);
