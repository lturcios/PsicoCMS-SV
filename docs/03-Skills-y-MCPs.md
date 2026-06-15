# Skills de Claude Code + MCPs — PsicoCMS SV

Este documento define (1) el set de **skills** que vivirán en `.claude/skills/` para que Claude Code construya el CMS de forma consistente, profesional y segura, y (2) los **MCP servers** que conviene conectar para CI/CD sobre capas gratuitas.

---

## Parte 1 — Skills de Claude Code

> Las skills son archivos `SKILL.md` (con su carpeta) que Claude Code lee automáticamente cuando la tarea coincide con su `description`. Cada una encapsula reglas, convenciones y snippets del proyecto. Aquí va el **set propuesto (11 skills)** con el alcance de cada una. El contenido detallado de cada `SKILL.md` se redacta en la Fase 0.

### Mapa de skills

| # | Skill (carpeta) | Para qué dispara | Contenido clave |
|---|---|---|---|
| 01 | **arquitectura-multitenant** | Cualquier tarea que toque aislamiento de datos, tenants, o decisiones de arquitectura. | Modelo BD compartida + `tenant_id`; cómo crear tablas siempre con `tenant_id`; flujo de alta de tenant; convención de slugs públicos; qué va en cliente vs Edge Function. |
| 02 | **convenciones-react-ts** | Crear/editar componentes, hooks, features. | Estructura feature-based; naming; TypeScript estricto (sin `any`); patrón de hooks de datos con TanStack Query; manejo de errores; cuándo Zustand vs Query; barriles e imports. |
| 03 | **diseño-ui-shadcn** | Maquetar UI, crear componentes visuales, temas. | Reglas de Tailwind v4; design tokens; uso de shadcn/ui; sistema de los 11 temas; modo claro/oscuro; responsive mobile-first; microinteracciones con Motion; accesibilidad. *(Apoyarse en la skill pública `frontend-design`.)* |
| 04 | **supabase-db-rls** | Migraciones, políticas RLS, tipos, queries. | Cómo escribir migraciones SQL versionadas; plantilla de política RLS por `tenant_id`; Auth Hook para el claim; generación de tipos (`supabase gen types`); buckets de Storage (público vs privado); RPC `security definer` para páginas públicas. |
| 05 | **motor-reservas-calendario** | Lógica de citas, slots, disponibilidad, FullCalendar. | Algoritmo de generación de slots; **validación de solapamiento server-side** (constraint + Edge Function); manejo de `America/El_Salvador` (guardar UTC, mostrar local con date-fns-tz); estados de cita; integración FullCalendar (mes/semana/día, drag&drop). |
| 06 | **gestion-clinica** | Pacientes, historias clínicas, adjuntos. | Modelo de ficha de paciente (con DUI/encargado); reglas de privacidad de notas (solo rol Owner); adjuntos SIEMPRE en bucket privado Supabase; visor integrado; relación nota↔cita↔paciente; editor TipTap para notas. |
| 07 | **seguridad-cumplimiento-sv** | Consentimientos, ARCO-POL, auditoría, datos sensibles. | Requisitos de la **Ley 144 / ACE**; plantilla de consentimiento informado; generación de PDF prellenado; bitácora de auditoría; exportación (portabilidad) y borrado/anonimización (olvido); regla "datos clínicos sin terceros". |
| 08 | **integraciones-externas** | Email, WhatsApp, Cloudinary, PDF. | Resend + React Email (confirmaciones/recordatorios); WhatsApp Cloud API y `wa.me`; subida a Cloudinary solo para activos públicos; @react-pdf/renderer / pdf-lib; manejo seguro de secrets (nunca en cliente). |
| 09 | **testing-calidad** | Escribir/ejecutar pruebas. | Vitest + Testing Library (unit/componente); Playwright para E2E del flujo de reserva; qué probar sí o sí (solapamientos, RLS, zona horaria); datos de prueba por tenant. |
| 10 | **git-cicd-deploy** | Commits, ramas, PRs, despliegue. | Conventional Commits; estrategia de ramas; checklist de PR; GitHub Actions (lint+typecheck+test+migraciones); deploy en Vercel; variables de entorno por entorno; previews. |
| 11 | **seo-blog-marketing** | Blog, página pública, posicionamiento. | Estructura SEO (meta, Open Graph, JSON-LD `LocalBusiness`/`Physician`); sitemap; slugs amigables; rendimiento (Core Web Vitals); copys en español SV; FAQ marcada con schema. |

> **Por qué 11 y no menos:** cada skill agrupa un dominio con reglas propias y suficientemente distinto como para que Claude Code la cargue de forma independiente sin "contaminar" el contexto con reglas que no aplican a la tarea actual.

### Archivos de gobierno del proyecto (acompañan a las skills)

- **`.claude/CLAUDE.md`** — Reglas **no negociables** (siempre presentes):
  - Siempre `tenant_id` + RLS en cada tabla nueva.
  - Adjuntos clínicos jamás en Cloudinary/CDN público.
  - Validación de solapamiento siempre server-side.
  - Zona horaria fija `America/El_Salvador`.
  - TypeScript estricto, sin `any`.
  - Secrets solo en Edge Functions / env del servidor, nunca en el bundle del cliente.
  - Terminología SV (DUI, US$, celular, consultorio, Ley 144).
  - pnpm (no npm/yarn).
- **`PROGRESO.md`** — memoria de sesión: estado actual, decisiones tomadas, pendientes, próximos pasos (se actualiza al final de cada sesión de Claude Code).
- **`PROMPT-FASE-0.md`** — prompt de arranque que le da a Claude Code el contexto completo para ejecutar la Fase 0.

---

## Parte 2 — MCP servers para CI/CD y desarrollo

> Los MCP (Model Context Protocol) le dan a Claude Code "manos" sobre servicios externos. Estos son los recomendados. **Verificá el comando/URL de instalación actual de cada uno** al configurarlos, porque cambian seguido.

### MCPs núcleo (CI/CD y plataforma)

| MCP | Para qué sirve en este proyecto | Notas de capa gratuita |
|---|---|---|
| **GitHub MCP** | Crear repo, ramas, PRs, issues, revisar y disparar **GitHub Actions**. Centro del CI/CD. | Gratis para repos; Actions con minutos gratis mensuales. |
| **Supabase MCP** | Crear/aplicar migraciones, ejecutar SQL, **generar tipos**, gestionar políticas RLS, inspeccionar la BD, manejar Storage y Edge Functions sin salir del editor. | Funciona con tu proyecto Free. **Usar token con permisos mínimos**; preferí modo *read-only* salvo cuando apliques migraciones. |
| **Vercel MCP** | Disparar/inspeccionar **deployments**, leer logs, gestionar variables de entorno y dominios. | Hobby para dev; ver nota de licencia comercial. |
| **Context7 MCP** | Documentación **actualizada** de React 19, Supabase, TanStack, FullCalendar, etc., inyectada en contexto. Evita que Claude use APIs viejas. | Gratis. Muy recomendable dado lo nuevo del stack. |
| **Playwright MCP** | E2E y pruebas visuales: que Claude navegue la app, pruebe el flujo de reserva y detecte regresiones. | Gratis (local). |

### MCPs de apoyo (según se necesiten)

| MCP | Para qué |
|---|---|
| **Cloudinary MCP** | Gestionar/optimizar los activos públicos (blog, perfil, temas). |
| **Sentry MCP** | Consultar errores de producción y crear issues a partir de ellos. |
| **Filesystem / built-ins de Claude Code** | Operaciones de archivos, bash, búsqueda — ya vienen integrados. |

### Flujo CI/CD propuesto (cómo encajan)

```
  Dev local (Claude Code)
        │  conventional commit
        ▼
  GitHub (GitHub MCP) ──► GitHub Actions
        │                   ├─ pnpm install
        │                   ├─ biome check (lint/format)
        │                   ├─ tsc --noEmit (typecheck)
        │                   ├─ vitest (unit)
        │                   ├─ playwright (e2e en PR)
        │                   └─ supabase db push (migraciones, en main)
        ▼
  Vercel (Vercel MCP)
        ├─ Preview deploy por cada PR
        └─ Production deploy al hacer merge a main
        │
        ▼
  Supabase (Supabase MCP)  ◄─ migraciones aplicadas
  Sentry (Sentry MCP)      ◄─ monitoreo post-deploy
```

### Reglas de seguridad para MCPs (importante)
- Dar a cada MCP el **token con el mínimo privilegio** necesario.
- Para Supabase MCP, preferir **read-only** en el día a día; habilitar escritura solo en sesiones de migración.
- Nunca poner secrets en `.claude/settings.json` versionado: usar variables de entorno locales.
- Revisar manualmente toda acción destructiva (borrar datos, push a main) antes de confirmar.

---

## Parte 3 — Orden de configuración (resumen accionable)

1. Instalar **Claude Code** (CLI o extensión de VSCode) y autenticar.
2. Crear repo en GitHub → conectar **GitHub MCP**.
3. Crear proyecto en Supabase → conectar **Supabase MCP** (read-only por defecto).
4. Conectar proyecto a Vercel → **Vercel MCP**.
5. Conectar **Context7** y **Playwright** MCP.
6. Crear cuentas Free de **Resend** y **Cloudinary** (sus claves van en env/Edge, no necesitan MCP para funcionar).
7. Poblar `.claude/skills/`, `CLAUDE.md`, `PROGRESO.md` y `PROMPT-FASE-0.md`.
8. Ejecutar Fase 0 (ver doc 04).
