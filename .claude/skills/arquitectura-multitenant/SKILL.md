---
name: arquitectura-multitenant
description: >
  Usar para decisiones de arquitectura, aislamiento de datos entre tenants, alta/onboarding
  de profesionales, modelo de tenants y roles, slugs/subdominios públicos, y para decidir
  qué lógica va en el cliente, en una RPC de Postgres o en una Edge Function. Disparar ante:
  tenant, multi-tenant, aislamiento, onboarding, slug, subdominio, rol, owner, asistente,
  arquitectura, "dónde poner esta lógica".
---

# Arquitectura multi-tenant

Modelo elegido: **una sola base de datos, esquema compartido, discriminador `tenant_id`, aislamiento por RLS.** Es el más eficiente para capa gratuita y el más seguro si las políticas RLS se aplican bien (ver skill `supabase-db-rls`).

## Conceptos
- **Tenant** = un consultorio/profesional. Tabla `tenants` (id, slug único, plan, is_active, created_at).
- **Profile** = el usuario dueño del tenant (1:1 con `auth.users`), con `tenant_id` y `role`.
- **Roles**: `owner` (acceso total, incluido lo clínico) y `asistente` (agenda y pacientes, **sin** notas clínicas). El super-admin de la plataforma es un concepto aparte (fuera del flujo de tenant).
- **Slug público**: identifica la página pública del consultorio, ej. `mariaperez` → `mariaperez.psicocms.sv` o `/c/mariaperez`. Único, inmutable tras crearse (o con redirección si cambia).

## Alta de tenant (onboarding)
El registro de un profesional debe crear, de forma atómica, el tenant + el profile + el slug. Hacerlo en una **RPC transaccional** o una Edge Function, nunca en pasos sueltos desde el cliente:

```sql
create or replace function public.create_tenant_for_user(
  p_user_id uuid, p_display_name text, p_slug text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_tenant uuid;
begin
  insert into public.tenants (slug) values (p_slug) returning id into v_tenant;
  insert into public.profiles (id, tenant_id, display_name, role)
    values (p_user_id, v_tenant, p_display_name, 'owner');
  return v_tenant;
end;
$$;
```
> Tras el alta, el usuario debe **refrescar la sesión** para que el `tenant_id` entre al JWT (lo inyecta el Auth Hook).

## ¿Dónde va cada lógica? (regla de decisión)
- **Cliente (React):** UI, validación de formularios (Zod), llamadas vía TanStack Query. Nunca lógica de seguridad ni secrets.
- **RPC de Postgres (`security definer`):** operaciones que cruzan RLS de forma controlada (datos públicos por slug, altas transaccionales). Exponer solo lo mínimo.
- **Edge Function (Deno):** todo lo que necesita secrets o autoridad: reservas públicas validadas, envío de email/WhatsApp, generación de PDF, jobs programados, llamadas a APIs externas.

## Páginas públicas vs panel privado
- **Panel privado**: requiere sesión; RLS filtra por `current_tenant_id()`.
- **Páginas públicas** (landing, booking, blog): sin sesión; leen vía RPC `security definer` por slug, exponiendo solo datos públicos. Jamás datos clínicos.

## Enrutamiento multi-tenant
- Opción simple (MVP): rutas por path `/c/:slug/...` para lo público y `/panel/...` para lo privado.
- Opción avanzada: subdominio por tenant con wildcard domain en Vercel (`*.psicocms.sv`).
- En ambos casos, resolver el tenant por slug del lado servidor/RPC, no confiar en un id que venga del cliente.

## Planes (Free / Pro)
- Guardar `plan` en `tenants`. Las restricciones de plan (límite de pacientes, temas, etc.) se aplican en el servidor (RPC/Edge), no solo ocultando botones en la UI.

## Gotchas
- El `tenant_id` del JWT es la única fuente de verdad para aislamiento; no aceptarlo como input del cliente.
- Cambiar de plan o de rol requiere refrescar sesión para reflejarse en el claim.
- Cascada de borrado: `on delete cascade` desde `tenants` borra todo lo del tenant — útil para el derecho al olvido a nivel cuenta, peligroso por accidente. Confirmar siempre borrados de tenant.

## Checklist al diseñar una feature
- [ ] ¿Toda tabla nueva tiene `tenant_id` + RLS? (ver skill supabase-db-rls)
- [ ] ¿La lógica sensible está en RPC/Edge, no en el cliente?
- [ ] ¿Las páginas públicas exponen solo lo público vía RPC?
- [ ] ¿Las restricciones de plan/rol se validan en el servidor?
