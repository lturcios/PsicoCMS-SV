---
name: gestion-clinica
description: >
  Usar al trabajar con pacientes, fichas, historias clínicas, notas de sesión, adjuntos
  (fotos/PDF escaneados), visor de archivos, o la relación entre nota, cita y paciente.
  Maneja datos sensibles de salud: prioriza privacidad y restricción por rol. Disparar
  ante: paciente, ficha, expediente, historia clínica, nota de sesión, adjunto, TipTap,
  visor, DUI, encargado.
---

# Gestión clínica (datos sensibles)

Aquí viven los datos más sensibles del sistema: salud mental de personas reales. Privacidad y control de acceso por encima de la comodidad.

## Modelo de paciente
- Ficha: nombre, **DUI** (`########-#`, validar formato), celular (+503), email, fecha de nacimiento, sexo, motivo de consulta, notas internas, estado (activo/alta/inactivo).
- **Menores de edad:** además, datos del **encargado/responsable** (nombre, DUI, parentesco, contacto). Validar consentimiento del responsable.
- Minimización (Ley 144): marcar claramente qué campos son opcionales; no pedir datos que no se usan.

## Historia clínica
- **Nota por sesión** con editor **TipTap**; vincular cada nota a `patient_id` y, cuando aplique, a `appointment_id`.
- Plantillas de nota (motivo, evolución, plan) como puntos de partida editables.
- **Línea de tiempo** de evolución del paciente (ordenar notas por fecha de sesión).

## Adjuntos clínicos — REGLA CRÍTICA
- Fotos y PDFs escaneados van **solo** a bucket **privado** de Supabase Storage (`clinical/{tenant_id}/{patient_id}/...`).
- **Nunca** a Cloudinary, nunca a un bucket público, nunca una URL accesible sin autenticación.
- Servir adjuntos vía **signed URLs** de corta duración generadas del lado servidor, no enlaces permanentes.
- Visor integrado: imágenes inline y PDF con visor embebido, usando la signed URL.

## Control de acceso por rol
- **Solo `owner`** ve y edita notas clínicas y adjuntos. El `asistente` gestiona agenda y datos básicos del paciente, pero **no** la historia clínica.
- Esto se hace cumplir en **RLS** (ver skill `supabase-db-rls`), no solo ocultando UI.

## Auditoría
- Toda **lectura** o **edición** de una historia clínica o adjunto se registra en la bitácora (`audit_log`): quién, qué, cuándo (ver skill `seguridad-cumplimiento-sv`).

## Patrón de subida de adjunto
```ts
// 1. (cliente) pedir al servidor una signed upload URL para clinical/{tenant}/{patient}/{file}
// 2. subir el archivo a esa URL
// 3. registrar el adjunto en tabla clinical_attachments (tenant_id, patient_id, note_id, path, mime)
// 4. para mostrar: pedir signed URL de lectura (TTL corto) — nunca guardar URLs públicas
```

## Validaciones
- DUI con regex y dígito verificador si se decide validarlo; aceptar pacientes sin DUI (menores/extranjeros) usando documento alternativo.
- Email/celular con Zod; celular salvadoreño: 8 dígitos.

## Gotchas
- No cachear adjuntos clínicos en CDNs ni en el estado persistido del cliente.
- No exponer el `path` del Storage en logs ni en respuestas públicas.
- Al borrar/anonimizar un paciente (derecho al olvido), borrar también sus adjuntos del Storage, no solo las filas.
- Las notas internas del paciente (en la ficha) también son sensibles: mismo trato que la historia clínica para el rol asistente.

## Checklist
- [ ] Adjuntos en bucket privado con ruta por tenant/paciente
- [ ] Acceso a notas/adjuntos restringido a `owner` vía RLS
- [ ] Signed URLs de corta duración, nunca enlaces públicos
- [ ] Lectura/edición registrada en audit_log
- [ ] Borrado de paciente elimina también sus archivos en Storage
