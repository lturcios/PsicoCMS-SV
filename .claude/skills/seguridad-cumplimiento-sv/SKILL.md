---
name: seguridad-cumplimiento-sv
description: >
  Usar al trabajar con consentimiento informado, aviso de privacidad, generación de PDF
  legal, derechos ARCO-POL (exportar/portabilidad, borrar/anonimizar/olvido), bitácora de
  auditoría, manejo de secrets, o cualquier requisito de la Ley salvadoreña de Protección
  de Datos Personales (Decreto 144 / ACE). Disparar ante: consentimiento, privacidad, Ley
  144, ACE, ARCO, portabilidad, olvido, anonimizar, auditoría, cifrado, secret, seguridad.
---

# Seguridad y cumplimiento (El Salvador)

Marco: **Ley para la Protección de Datos Personales (Decreto Legislativo N.° 144/2024)**, vigente desde nov. 2024, supervisada por la **Agencia de Ciberseguridad del Estado (ACE)**. Aplica a quien trate datos personales en El Salvador. Los datos de salud son **datos sensibles**.

> Esto facilita el cumplimiento, no lo garantiza: las plantillas legales las revisa un abogado salvadoreño antes de ofrecerse como definitivas. Marcar como "borrador legal" hasta entonces. Sanciones de la ley: $408.80 a $16,352.00.

## Consentimiento informado / aviso de privacidad
- Documento que el paciente acepta para autorizar el tratamiento de sus datos sensibles.
- **Versionado**: guardar qué versión del texto firmó cada paciente y cuándo. Si el texto cambia, las firmas viejas quedan ligadas a su versión.
- Registrar: `patient_id`, `template_version`, `accepted_at`, método (firma digital/física escaneada).

## Generación de PDF (`generate-consent-pdf`)
- Edge Function que rellena la plantilla con los datos del paciente y la fecha, devuelve el PDF.
- El PDF generado, si se almacena, va al bucket **privado** (es dato del paciente).
- Herramienta: `@react-pdf/renderer` o `pdf-lib` en Deno.

## Derechos ARCO-POL (implementar como features)
- **Acceso / Portabilidad:** exportar todos los datos de un paciente (ficha + citas + notas + adjuntos) en JSON y/o PDF.
- **Rectificación:** edición normal de la ficha (ya cubierta).
- **Cancelación / Olvido:** borrar o **anonimizar** el expediente — eliminar filas Y adjuntos del Storage. Anonimizar = reemplazar identificadores por valores irreversibles cuando hay que conservar estadísticas.
- **Oposición / Limitación:** marcar al paciente como "tratamiento limitado" (no recordatorios, no marketing).

## Bitácora de auditoría (`audit_log`)
```sql
create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  actor_id    uuid,            -- quién
  action      text not null,   -- 'view'|'create'|'update'|'delete'|'export'
  entity      text not null,   -- 'clinical_note'|'patient'|'attachment'...
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
```
- Registrar **lectura y edición** de historias clínicas y adjuntos, y las exportaciones/borrados ARCO-POL.
- Solo lectura para el owner; nunca editable desde la app.

## Manejo de secrets
- `service_role`, claves de Resend/WhatsApp/Cloudinary: **solo** en variables de entorno de Edge Functions / CI. Nunca en el bundle del cliente, nunca commiteadas.
- En el cliente, solo `anon key` + URL pública.
- `.env.local` en `.gitignore`; `.env.example` sin valores reales.

## Medidas de seguridad transversales
- **RLS** en todas las tablas (aislamiento por tenant + rol).
- **Cifrado** en reposo (Supabase) y en tránsito (TLS) — verificar, no asumir.
- **Rate limiting** en endpoints públicos (booking, contacto) para evitar abuso.
- **Validación Zod** en todo borde de entrada.
- **Datos clínicos sin terceros** (no Cloudinary/CDN para adjuntos clínicos).
- Mensajes de error sin filtrar detalles internos.

## Gotchas
- Anonimizar ≠ borrar: si hay que conservar métricas, anonimizar; si el titular pide olvido total, borrar incluyendo Storage.
- Exportar para portabilidad debe incluir adjuntos (o enlaces firmados temporales), no solo texto.
- Toda transferencia a terceros requiere consentimiento y garantías equivalentes → por eso evitamos terceros para lo clínico.

## Checklist
- [ ] Consentimiento versionado y registrado por paciente
- [ ] PDF de consentimiento generado en Edge Function
- [ ] Export (portabilidad) + borrado/anonimización (olvido) implementados
- [ ] audit_log registrando accesos clínicos y acciones ARCO-POL
- [ ] Secrets solo en servidor; .env.local ignorado
- [ ] Rate limiting en endpoints públicos
