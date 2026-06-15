---
name: motor-reservas-calendario
description: >
  Usar al trabajar en citas, reservas, disponibilidad, generación de horarios (slots),
  validación de solapamientos, calendario, o cualquier cosa con fechas y horas de la
  agenda. Cubre la integración de FullCalendar, el algoritmo de slots, la validación
  server-side anti-doble-reserva, y el manejo correcto de la zona horaria
  America/El_Salvador. Disparar ante: cita, appointment, slot, disponibilidad,
  calendario, FullCalendar, reserva, agenda, horario, reprogramar, cancelar.
---

# Motor de reservas y calendario

El módulo más delicado del producto. Dos cosas no se negocian: **nunca dos citas solapadas** y **toda la lógica de tiempo en `America/El_Salvador`**.

## Zona horaria (regla de oro)
- Guardar en BD en **UTC** con `timestamptz`.
- Calcular y mostrar en `America/El_Salvador` (UTC−6, **sin** horario de verano).
- En el cliente usar `date-fns-tz`; **nunca** `new Date(...)` crudo para lógica de agenda (depende de la zona del navegador).

```ts
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';

export const TZ = 'America/El_Salvador';

// hora local SV -> instante UTC para guardar
export const svToUtc = (local: Date) => fromZonedTime(local, TZ);
// instante UTC -> hora local SV para mostrar
export const utcToSv = (utc: string | Date) => toZonedTime(utc, TZ);
export const fmtSv = (utc: string | Date, pattern = "dd/MM/yyyy hh:mm a") =>
  format(toZonedTime(utc, TZ), pattern, { timeZone: TZ });
```

## Generación de slots
Combinar: disponibilidad semanal del profesional × duración del servicio × citas existentes × excepciones/bloqueos × antelación mínima.

Algoritmo (resumen):
1. Para la fecha pedida, obtener los rangos de disponibilidad de ese día de la semana.
2. Trocear cada rango en intervalos del tamaño de la duración del servicio (+ buffer si aplica).
3. Descartar slots que: caen en una excepción/bloqueo, chocan con una cita existente, o están por debajo de la antelación mínima respecto a "ahora" (en hora SV).
4. Devolver los slots libres en UTC + su representación local.

> La generación para mostrar opciones puede vivir en el cliente, pero **la confirmación de la reserva SIEMPRE se valida en el servidor** (ver abajo).

## Anti-solapamiento a nivel de base de datos (no negociable)
Usar una **exclusion constraint** con `btree_gist`. Es la única forma confiable de evitar doble reserva bajo concurrencia:

```sql
create extension if not exists btree_gist;

create table public.appointments (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  patient_id      uuid references public.patients(id) on delete set null,
  service_id      uuid references public.services(id),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  modality        text not null default 'presencial', -- 'presencial' | 'en_linea'
  status          text not null default 'pendiente',  -- pendiente|confirmada|atendida|cancelada|no_show
  created_at      timestamptz not null default now(),
  constraint ends_after_start check (ends_at > starts_at)
);

-- impide dos citas que se solapen en el mismo tenant (ignorando canceladas)
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    tenant_id  with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelada');

create index on public.appointments (tenant_id, starts_at);
```
(+ RLS por `tenant_id` según la skill `supabase-db-rls`.)

## Validación server-side: Edge Function `book-appointment`
La reserva (sobre todo la **pública**, sin sesión) pasa por una Edge Function que:
1. Valida el payload con Zod.
2. Recalcula la disponibilidad del lado servidor (no confía en el slot que mandó el cliente).
3. Inserta la cita; si la exclusion constraint la rechaza (slot tomado entre medias), responde "ese horario ya no está disponible" sin filtrar detalles.
4. Dispara confirmación por email (ver skill `integraciones-externas`).

```ts
// supabase/functions/book-appointment/index.ts (Deno) — esqueleto
import { z } from 'npm:zod';
const Body = z.object({
  tenantSlug: z.string(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),      // ISO en UTC
  patient: z.object({ fullName: z.string().min(2), phone: z.string(), email: z.string().email() }),
});
// 1. parse -> 2. resolver tenant por slug -> 3. recomputar fin = inicio + duración del servicio
// 4. insert con service_role; catch del error '23P01' (exclusion_violation) -> 409 "slot tomado"
// 5. enviar email de confirmación + generar token firmado para reprogramar/cancelar
```

> El error de PostgreSQL por exclusion constraint es `23P01`. Capturarlo y traducirlo a un 409 amable.

## Reprogramar / cancelar por el paciente
- El email de confirmación incluye un enlace con un **token firmado** (JWT/HMAC con expiración) que identifica la cita sin requerir login.
- Reprogramar = cancelar lógicamente (status `cancelada`) + crear nueva, o mover dentro de una transacción validando de nuevo.

## FullCalendar (panel del profesional)
- Plugins gratuitos: `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`, `@fullcalendar/react`.
- Vistas: `dayGridMonth`, `timeGridWeek`, `timeGridDay`.
- `timeZone="America/El_Salvador"`, `locale="es"`, semana iniciando lunes.
- Drag&drop para reprogramar → al soltar, llamar al endpoint que revalida solapamiento; si falla, revertir (`info.revert()`).
- Color por estado/servicio vía `eventClassNames` o `eventColor`.
- Eventos "extra" (bloqueos personales) son citas con un tipo especial o eventos sin paciente.

## Gotchas
- No generes `ends_at` en el cliente para la inserción final: derivalo de la duración del servicio en el servidor.
- Cuidado con el cambio de día: un slot 23:30 con duración 60min cruza medianoche; manejar rangos correctamente.
- Antelación mínima y política de cancelación se evalúan contra "ahora" en hora SV, no del navegador.
- Probar concurrencia: dos reservas al mismo slot casi simultáneas → solo una debe entrar.

## Checklist
- [ ] `btree_gist` + exclusion constraint activos
- [ ] Reserva validada en Edge Function (no solo cliente)
- [ ] Todo en UTC en BD, mostrado en TZ SV
- [ ] Error 23P01 traducido a 409 amable
- [ ] Drag&drop revierte si el server rechaza
- [ ] Test de concurrencia pasa
