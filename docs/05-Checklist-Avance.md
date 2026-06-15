# ✅ Checklist de Avance — PsicoCMS SV

> Marcá cada casilla al completar. Convención: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho.
> Mantené este archivo en la raíz del repo y actualizalo en cada sesión junto con `PROGRESO.md`.

---

## 🔧 Preparación del entorno (pre-Fase 0)
- [ ] Instalar Claude Code (CLI o extensión VSCode) y autenticar
- [ ] Crear repo en GitHub → conectar **GitHub MCP**
- [ ] Crear proyecto en **Supabase** → conectar **Supabase MCP** (read-only por defecto)
- [ ] Conectar repo a **Vercel** → **Vercel MCP**
- [ ] Conectar **Context7 MCP** y **Playwright MCP**
- [ ] Crear cuentas Free: **Resend** y **Cloudinary**
- [ ] Crear `.claude/CLAUDE.md` con reglas no negociables
- [ ] Crear las 11 skills en `.claude/skills/`
- [ ] Crear `PROGRESO.md` y `PROMPT-FASE-0.md`

---

## 🏗️ Fase 0 — Cimientos y entorno
- [ ] Inicializar proyecto con **pnpm** + Vite 6 + React 19
- [ ] TypeScript en modo **strict**
- [ ] Tailwind CSS v4 configurado
- [ ] shadcn/ui instalado y funcionando
- [ ] Design tokens base (CSS variables) definidos
- [ ] Modo claro/oscuro con persistencia (Zustand)
- [ ] Biome (lint + format) configurado
- [ ] Lefthook (pre-commit) configurado
- [ ] Vitest configurado con un test de humo
- [ ] Cliente de Supabase conectado + tipos generados
- [ ] React Router 7 con layout base
- [ ] Primer deploy en Vercel (shell vacío)
- [ ] GitHub Actions: lint + typecheck + test en verde
- [ ] **Criterio:** push → CI verde → deploy automático ✔️

---

## 🔐 Fase 1 — Auth + multi-tenant
- [ ] Supabase Auth (email/contraseña + magic link)
- [ ] Tablas `tenants` y `profiles` con `tenant_id`
- [ ] **RLS** habilitado en todas las tablas
- [ ] **Auth Hook** que inyecta `tenant_id` y `role` en el JWT
- [ ] Onboarding: alta de profesional → crea tenant + perfil + slug
- [ ] Rutas protegidas + contexto de tenant
- [ ] Layout del panel (sidebar + topbar)
- [ ] Roles Owner / Asistente (base)
- [ ] **Criterio:** dos cuentas no ven datos entre sí (probado) ✔️

---

## ⚙️ Fase 2 — Configuración del consultorio
- [ ] Datos del profesional (nombre, título, colegiatura/JVPP, bio)
- [ ] Foto de perfil y logo (Cloudinary)
- [ ] Especialidades
- [ ] Servicios con precio US$ (en línea / presencial + duración)
- [ ] Horarios de disponibilidad por día
- [ ] Excepciones/bloqueos + feriados SV
- [ ] Política de cancelación y antelación mínima
- [ ] Contacto: celular +503, departamento/municipio, redes, WhatsApp
- [ ] **Criterio:** datos alimentan booking y página pública ✔️

---

## 👥 Fase 3 — Pacientes
- [ ] CRUD de pacientes (nombre, **DUI**, celular, email, fecha nac., sexo)
- [ ] Datos del encargado (menores)
- [ ] Motivo de consulta + notas internas + estado
- [ ] Validación de formato DUI
- [ ] Buscador + listado paginado
- [ ] **Criterio:** búsqueda rápida + aislamiento por tenant ✔️

---

## 📅 Fase 4 — Calendario + motor de reservas ⭐
- [ ] Integrar FullCalendar (mes/semana/día)
- [ ] Eventos extra (no-citas) y drag&drop
- [ ] Motor de generación de slots (disponibilidad × duración × ocupación × excepciones)
- [ ] Edge Function `book-appointment` con validación de solapamiento
- [ ] Constraint anti-solapamiento en BD
- [ ] Zona horaria `America/El_Salvador` (guardar UTC / mostrar local)
- [ ] Estados de cita + código de color
- [ ] Creación/edición manual de citas
- [ ] Historial de citas del paciente
- [ ] **Criterio:** imposible solapar citas (prueba de concurrencia) ✔️

---

## 🌐 Fase 5 — Reserva pública 24/7
- [ ] Página pública por tenant (slug/subdominio)
- [ ] Flujo de reserva self-service (sin login)
- [ ] Identificación por email/celular
- [ ] Validación server-side reutilizada
- [ ] Confirmación por email (Resend + React Email)
- [ ] Token firmado para reprogramar/cancelar
- [ ] Mobile-first + accesible (WCAG AA)
- [ ] **Criterio:** reserva desde celular + email recibido + sin doble reserva ✔️

---

## 🩺 Fase 6 — Historias clínicas
- [ ] Nota por sesión con TipTap
- [ ] Plantillas de nota (motivo/evolución/plan)
- [ ] Adjuntos en **bucket privado** Supabase (RLS)
- [ ] Visor integrado (imagen + PDF)
- [ ] Vinculación nota ↔ cita ↔ paciente + línea de tiempo
- [ ] Restricción: solo rol Owner ve notas clínicas
- [ ] **Criterio:** Asistente sin acceso a notas; adjuntos no públicos ✔️

---

## 📄 Fase 7 — Cumplimiento + PDF
- [ ] Plantilla de consentimiento informado (versionada)
- [ ] Edge Function `generate-consent-pdf` (prellenado)
- [ ] Registro de consentimiento (fecha/versión/firma)
- [ ] Exportar datos del paciente (portabilidad)
- [ ] Borrado/anonimización (derecho al olvido)
- [ ] Bitácora de auditoría
- [ ] **Criterio:** PDF correcto + borrado efectivo y auditado ✔️
- [ ] ⚠️ Plantilla legal revisada por abogado SV

---

## ✍️ Fase 8 — Blog + SEO
- [ ] CRUD de blog (TipTap) + imagen destacada (Cloudinary)
- [ ] Categorías y etiquetas
- [ ] Borradores + publicación programada
- [ ] Páginas públicas SEO (meta, Open Graph, JSON-LD)
- [ ] Sitemap + slugs amigables
- [ ] FAQ con schema
- [ ] **Criterio:** artículo indexable + buenos Core Web Vitals ✔️

---

## 🔔 Fase 9 — Integraciones + dashboard
- [ ] Botón flotante WhatsApp (`wa.me`)
- [ ] Recordatorios WhatsApp (Cloud API)
- [ ] Recordatorios programados (pg_cron + `cron-reminders`)
- [ ] Dashboard: próximas citas + estadísticas
- [ ] Gráficas (Recharts/Tremor)
- [ ] Buscador global
- [ ] **Criterio:** recordatorio a la hora correcta + dashboard con datos reales ✔️

---

## 🎨 Fase 10 — Temas visuales + pulido
- [ ] Implementar los **11 temas** (sets de tokens) + selector
- [ ] Personalización color/logo/imágenes por tenant
- [ ] Microinteracciones (Motion) + skeletons + estados vacíos
- [ ] QA responsive (celular/tablet/escritorio)
- [ ] Auditoría de accesibilidad
- [ ] **Criterio:** cambiar tema no rompe nada; QA aprobada ✔️

---

## 🚀 Fase 11 — Endurecimiento + lanzamiento
- [ ] Suite E2E completa (Playwright) del flujo crítico
- [ ] Rate limiting en endpoints públicos
- [ ] Revisión integral de RLS + pruebas de seguridad
- [ ] Sentry en producción + alertas
- [ ] Backups verificados
- [ ] Planes/suscripción (Free/Pro)
- [ ] Dominios personalizados
- [ ] Documentación de operación
- [ ] Deploy de producción v1.0
- [ ] **Criterio:** flujo completo pasa E2E sin fallos ✔️

---

## 💵 Fase 12 (opcional) — Facturación DTE
- [ ] Integración DTE (Ministerio de Hacienda)
- [ ] Emisión de factura/CCF al confirmar/atender cita
- [ ] Almacenamiento + envío de DTE al paciente
- [ ] **Criterio:** DTE validado por Hacienda en ambiente de pruebas ✔️

---

### Reglas no negociables (recordatorio permanente)
- [ ] Toda tabla nueva: `tenant_id` + RLS
- [ ] Adjuntos clínicos NUNCA en Cloudinary/CDN público
- [ ] Validación de solapamiento SIEMPRE server-side
- [ ] Zona horaria fija `America/El_Salvador`
- [ ] TypeScript estricto, sin `any`
- [ ] Secrets solo en Edge/env, nunca en el bundle del cliente
- [ ] Terminología SV (DUI, US$, celular, consultorio, Ley 144)
- [ ] pnpm (no npm/yarn)
