# Plan de Desarrollo por Fases — PsicoCMS SV

> Metodología: **fases incrementales y desplegables**. Al final de cada fase hay algo funcional en producción (Vercel) que se puede mostrar. Cada fase tiene objetivo, entregable, criterio de aceptación y skills/MCPs implicados.

**Principio rector:** *nunca avanzar a la siguiente fase sin que la anterior esté desplegada y con su criterio de aceptación cumplido.* Actualizar `PROGRESO.md` al cerrar cada fase.

---

## Fase 0 — Cimientos y entorno
**Objetivo:** dejar el esqueleto desplegable y el "andamiaje" de calidad listo.

- Repo + pnpm + Vite 6 + React 19 + TS estricto.
- Tailwind v4 + shadcn/ui + sistema de design tokens (base para los 11 temas).
- Modo claro/oscuro funcionando.
- Biome (lint/format) + Lefthook (hooks) + Vitest configurado.
- Proyecto Supabase creado; cliente conectado; generación de tipos.
- Conexión a Vercel + primer deploy (shell vacío).
- GitHub Actions base (lint + typecheck + test).
- Poblar `.claude/skills/`, `CLAUDE.md`, `PROGRESO.md`.

**Entregable:** app vacía pero pulida, desplegada en Vercel, con CI verde.
**Criterio de aceptación:** un `git push` dispara CI y deploy automático; cambiar de tema claro/oscuro funciona.
**Skills:** 02, 03, 04, 10 · **MCPs:** GitHub, Supabase, Vercel, Context7.

---

## Fase 1 — Autenticación + núcleo multi-tenant
**Objetivo:** que un profesional pueda registrarse y entrar a un panel aislado.

- Supabase Auth (email/contraseña + magic link).
- Tablas `tenants`, `profiles`; cada tabla con `tenant_id`.
- **RLS** en todas las tablas; **Auth Hook** que inyecta `tenant_id` y `role` en el JWT.
- Onboarding: alta de profesional → crea tenant + perfil + slug público.
- Rutas protegidas, contexto de tenant, layout del panel (sidebar, topbar).
- Roles: Owner / Asistente (base).

**Entregable:** registro → login → dashboard vacío scoped al tenant.
**Criterio de aceptación:** dos cuentas distintas NO ven datos de la otra (probado); el JWT trae `tenant_id`.
**Skills:** 01, 04, 02 · **MCPs:** Supabase, GitHub.

---

## Fase 2 — Configuración del consultorio
**Objetivo:** que el profesional configure su consulta.

- Datos del profesional (nombre, título, colegiatura/JVPP, bio, foto vía Cloudinary).
- Especialidades.
- Servicios con precio en US$ (modalidad en línea y presencial, duración).
- Horarios de disponibilidad por día + excepciones/bloqueos (incluye feriados SV).
- Política de cancelación y antelación mínima.
- Contacto: celular +503, dirección (departamento/municipio), redes, WhatsApp.

**Entregable:** módulo de Ajustes completo y persistente.
**Criterio de aceptación:** los datos guardados alimentan correctamente la futura página pública y el motor de reservas.
**Skills:** 02, 03, 08 · **MCPs:** Supabase, Cloudinary.

---

## Fase 3 — Pacientes
**Objetivo:** gestión de pacientes (sin lo clínico aún).

- CRUD de pacientes: nombre, **DUI**, celular, email, fecha nac., sexo.
- Datos del encargado si es menor.
- Motivo de consulta, notas internas, estado (activo/alta/inactivo).
- Buscador y listado paginado; historial de citas (placeholder hasta Fase 4).

**Entregable:** módulo de Pacientes funcional.
**Criterio de aceptación:** validación de DUI; búsqueda rápida; aislamiento por tenant verificado.
**Skills:** 06, 02, 04 · **MCPs:** Supabase.

---

## Fase 4 — Calendario + motor de reservas (núcleo) ⭐
**Objetivo:** el corazón del producto, en uso interno (citas manuales).

- Integración **FullCalendar** (vistas mes/semana/día, eventos extra, drag&drop).
- Motor de **generación de slots** (disponibilidad × duración × ocupación × excepciones).
- **Validación de solapamiento server-side** (constraint en BD + Edge Function `book-appointment`).
- Manejo de zona horaria `America/El_Salvador` (guardar UTC, mostrar local).
- Estados de cita; creación/edición manual desde el panel; código de color.
- Historial de citas del paciente (cierra el placeholder de Fase 3).

**Entregable:** agenda interna usable por el profesional.
**Criterio de aceptación:** imposible crear dos citas solapadas (probado con prueba de concurrencia); horarios correctos en zona SV.
**Skills:** 05, 04, 02 · **MCPs:** Supabase, Playwright.

---

## Fase 5 — Reserva pública en línea 24/7
**Objetivo:** que el paciente reserve solo, sin cuenta.

- Página pública por tenant (slug/subdominio): servicios, disponibilidad, reserva.
- Flujo de reserva self-service (sin login), identificación por email/celular.
- Reutiliza el motor de Fase 4 con validación server-side.
- Confirmación por **email (Resend + React Email)**.
- Enlace con **token firmado** para reprogramar/cancelar.

**Entregable:** booking público funcional, mobile-first.
**Criterio de aceptación:** un paciente reserva desde el celular y recibe email; no hay doble reserva; flujo accesible (WCAG AA).
**Skills:** 05, 08, 03, 09 · **MCPs:** Supabase, Vercel, Playwright.

---

## Fase 6 — Historias clínicas (datos sensibles)
**Objetivo:** expediente clínico seguro.

- Nota por sesión con editor **TipTap**; plantillas (motivo, evolución, plan).
- Adjuntar fotos/PDFs escaneados en **bucket privado de Supabase** (RLS).
- Visor integrado (imagen + PDF).
- Vinculación nota ↔ cita ↔ paciente; línea de tiempo de evolución.
- Restricción de acceso: solo rol **Owner** ve notas clínicas.

**Entregable:** expediente clínico completo y privado.
**Criterio de aceptación:** el rol Asistente NO accede a notas; los adjuntos no son accesibles por URL pública.
**Skills:** 06, 07, 04 · **MCPs:** Supabase.

---

## Fase 7 — Cumplimiento legal + PDF
**Objetivo:** cumplir la Ley 144 y dar herramientas ARCO-POL.

- Plantilla de **consentimiento informado / aviso de privacidad** (versionada).
- **Generador de PDF** prellenado con datos del paciente (`generate-consent-pdf`).
- Registro de consentimiento (fecha, versión, firma).
- Exportar datos del paciente (**portabilidad**) y borrar/anonimizar (**olvido**).
- **Bitácora de auditoría** (quién vio/cambió qué).

**Entregable:** módulo de cumplimiento + PDF.
**Criterio de aceptación:** se genera el PDF correcto por paciente; el borrado/anonimización es efectivo y queda auditado.
**Skills:** 07, 08, 04 · **MCPs:** Supabase.
> Recordatorio: la plantilla legal debe revisarla un abogado salvadoreño antes de ofrecerla como "lista".

---

## Fase 8 — Blog profesional + SEO
**Objetivo:** marketing de contenidos y posicionamiento.

- CRUD de blog con **TipTap**, imagen destacada (**Cloudinary**), categorías/etiquetas.
- Borradores y publicación programada.
- Páginas públicas de artículos optimizadas (meta, Open Graph, JSON-LD).
- Sitemap y slugs amigables; FAQ con schema.

**Entregable:** blog público + SEO técnico.
**Criterio de aceptación:** un artículo publicado es indexable, con buenas métricas Core Web Vitals.
**Skills:** 11, 03, 08 · **MCPs:** Cloudinary, Vercel.

---

## Fase 9 — Integraciones y dashboard
**Objetivo:** recordatorios y panel de control con datos.

- **WhatsApp**: botón flotante (`wa.me`) + recordatorios automáticos (Cloud API).
- Recordatorios programados (pg_cron + Edge Function `cron-reminders`).
- Dashboard: próximas citas, estadísticas (citas/mes, no-shows, ingresos estimados), gráficas (Recharts/Tremor).
- **Buscador global** (pacientes, citas, notas).

**Entregable:** panel de inicio "vivo" + recordatorios.
**Criterio de aceptación:** un recordatorio se envía a la hora correcta; el dashboard refleja datos reales del tenant.
**Skills:** 08, 05, 02 · **MCPs:** Supabase, Sentry.

---

## Fase 10 — Temas visuales y pulido
**Objetivo:** el "wow" visual del original (11 temas) y refinamiento.

- Implementar los **11 temas** como sets de tokens; selector de tema.
- Personalización de color/logo/imágenes por tenant.
- Microinteracciones (Motion), estados de carga/skeletons, vacíos bien diseñados.
- QA responsive (celular/tablet/escritorio) y de accesibilidad.

**Entregable:** producto visualmente atractivo y consistente.
**Criterio de aceptación:** cambiar de tema no rompe ningún componente; auditoría de accesibilidad/responsive aprobada.
**Skills:** 03, 11 · **MCPs:** Playwright.

---

## Fase 11 — Endurecimiento y lanzamiento
**Objetivo:** listo para clientes reales.

- Suite E2E completa (Playwright) del flujo crítico.
- Rate limiting en endpoints públicos; revisión de RLS; pruebas de seguridad.
- Sentry en producción; alertas; backups verificados.
- Planes/suscripción (Free/Pro) — cobro local o pasarela.
- Dominios personalizados; documentación de operación; deploy de producción definitivo.

**Entregable:** v1.0 en producción.
**Criterio de aceptación:** todo el flujo (registro → configurar → reservar → atender → notas → cumplimiento) pasa E2E sin fallos.
**Skills:** 09, 10, 07, 01 · **MCPs:** Vercel, Supabase, Sentry, Playwright.

---

## Fase 12 (opcional, valor SV) — Facturación DTE
**Objetivo:** emitir comprobantes electrónicos del Ministerio de Hacienda.

- Integración DTE (aprovechando experiencia de LTSOFT / Facturador SV).
- Emisión de factura/CCF al confirmar/atender una cita.
- Almacenamiento de DTE y envío al paciente.

**Entregable:** facturación electrónica integrada.
**Criterio de aceptación:** DTE emitido y validado por Hacienda en ambiente de pruebas.

---

## Cómo trabajar cada fase con Claude Code
1. Abrir la fase, leer su objetivo y criterio de aceptación.
2. Pedirle a Claude Code que lea las skills indicadas + `CLAUDE.md` + `PROGRESO.md`.
3. Ejecutar en sub-tareas pequeñas (cada ítem del checklist).
4. Probar localmente → commit (Conventional Commits) → PR → preview en Vercel.
5. Verificar criterio de aceptación → merge → actualizar `PROGRESO.md`.
6. Solo entonces, pasar a la siguiente fase.
