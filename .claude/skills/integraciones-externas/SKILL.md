---
name: integraciones-externas
description: >
  Usar al integrar servicios externos: envío de email (Resend + React Email),
  WhatsApp (Cloud API o wa.me), subida de imágenes públicas a Cloudinary, generación de
  PDF, o recordatorios/jobs programados. Disparar ante: email, correo, Resend, WhatsApp,
  recordatorio, notificación, Cloudinary, imagen, PDF, cron, job programado, webhook.
---

# Integraciones externas

Todas las integraciones que usan secrets corren en **Edge Functions**, nunca en el cliente.

## Email transaccional (Resend + React Email)
- Confirmación de reserva, recordatorios, reprogramación/cancelación.
- Plantillas con **React Email**; envío con **Resend** desde una Edge Function (`send-email`).
- Free: 3,000/mes, 100/día — suficiente para arrancar.
- Verificar dominio en Resend para mejor entregabilidad (SPF/DKIM).

```ts
// supabase/functions/send-email/index.ts (Deno) — esqueleto
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!; // secret del servidor
// POST https://api.resend.com/emails con { from, to, subject, html }
// el html se renderiza desde la plantilla React Email
```

## WhatsApp
- **MVP:** botón flotante con enlace `wa.me/503XXXXXXXX?text=...` (sin costo, sin API).
- **Avanzado:** **WhatsApp Cloud API** (Meta) para recordatorios automáticos con plantillas aprobadas.
  - Requiere número, plantillas de mensaje aprobadas, y token. Las conversaciones de utilidad pueden tener costo.
  - Enviar desde Edge Function (`whatsapp-reminder`), token como secret.
- Respetar la marca "tratamiento limitado": no enviar recordatorios a quien se opuso.

## Recordatorios programados
- Usar **pg_cron** + una Edge Function (`cron-reminders`) que corre cada X minutos:
  1. busca citas dentro de la ventana de recordatorio (ej. 24h y 2h antes),
  2. que no tengan recordatorio ya enviado,
  3. envía email/WhatsApp y marca `reminder_sent_at`.
- Idempotencia: marcar lo enviado para no duplicar si el job se reejecuta.

## Cloudinary (solo activos PÚBLICOS)
- Imágenes de blog, foto de perfil, logos, assets de temas. **Nunca** adjuntos clínicos.
- Subida firmada desde el servidor (no exponer el API secret en el cliente).
- Aprovechar transformaciones (`f_auto,q_auto`, resize) y CDN.
- Free: ~25 créditos/mes.

## PDF
- Consentimiento informado y exportaciones: `@react-pdf/renderer` (cliente/servidor) o `pdf-lib` en Deno.
- Los PDFs con datos del paciente se tratan como datos sensibles (bucket privado si se almacenan).

## Reglas comunes
- **Secrets solo en Edge/env.** El cliente nunca ve API keys de terceros.
- Validar payloads con Zod antes de llamar a cualquier API externa.
- Manejar fallos de terceros con reintentos acotados y degradación elegante (si falla el email, la cita igual se crea; registrar el fallo).
- Loggear errores a Sentry, sin datos sensibles.

## Gotchas
- WhatsApp Cloud API requiere plantillas aprobadas para mensajes iniciados por el negocio: planificar con tiempo.
- Cloudinary: jamás subir nada clínico "por comodidad" — es una violación de la regla de privacidad.
- Resend en free tiene límite diario; espaciar envíos masivos de recordatorios.
- Zona horaria SV en los textos de recordatorio (ver skill motor-reservas-calendario).
