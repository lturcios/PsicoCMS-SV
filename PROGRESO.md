# PROGRESO — PsicoCMS SV

> Registro de avance por fase. Se actualiza al cerrar cada bloque/fase (CLAUDE.md, regla NO NEGOCIABLE 10).
> Convención: ✅ hecho · 🔲 pendiente.

---

## Estado actual

- **Fase actual:** Fase 1 — Auth + multi-tenant → **COMPLETA** ✅ (6/6 bloques)
- **Próxima fase:** Fase 2 — Configuración del consultorio
- **Última actualización:** 2026-06-15

---

## Fase 0 — Cimientos y entorno (✅ completa)

### Bloque 1 — Scaffolding base
- Proyecto creado con `pnpm create vite@latest` (template `react-ts`).
- Versiones resueltas: Vite 8.0.16 (Rolldown), React 19.2.7, TypeScript 6.0.3 (`strict: true`).
- `package.json` renombrado a `psicocms-sv`; agregado script `typecheck` (`tsc -b --noEmit`).

### Bloque 2 — Biome, Lefthook, Vitest
- Biome 2.5.0 reemplaza ESLint/Prettier del scaffold (`pnpm check` / `pnpm format`).
- Lefthook 2.1.9: pre-commit corre `check`, `typecheck`, `test` (secuencial).
- Vitest 4.1.8 + Testing Library configurados, con test de humo.
- `git init` (requerido para los hooks de Lefthook).

### Bloque 3 — UI base, theming, dark mode
- Tailwind CSS v4.3.1 (`@tailwindcss/vite`) + shadcn/ui CLI v4.11.0 (estilo `base-nova` sobre `@base-ui/react`).
- Sistema de design tokens en `oklch` con 2 temas iniciales (base + salvia) — base para los 11 temas de Fase 10.
- Dark mode + variante de tema persistidos con Zustand (sin middleware `persist`) + script pre-paint para evitar flash.
- Layout base de la app.

### Bloque 4 — Supabase: cliente, env, migración, tipos
- Instalado `@supabase/supabase-js` `^2.108.1`, CLI `supabase` `^2.106.0`, `zod` `4.4.3`.
- `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- `src/vite-env.d.ts` con `ViteTypeOptions.strictImportMetaEnv` + validación Zod de las env vars del cliente.
- Migración `supabase/migrations/20260614092315_create_tenants.sql`: tabla `tenants` con RLS **deny-all** activado desde el día 1 (regla NO NEGOCIABLE 1).
- `supabase start` (Docker) + `supabase gen types typescript` → `src/lib/supabase/database.types.ts`.

### Bloque 5 — React Router 7 (data mode), layouts público/privado
- `src/app/router.tsx`: exporta `routes: RouteObject[]` + `router` (`createBrowserRouter`).
- `PublicLayout` y `PanelLayout` (reemplazan el `AppLayout` genérico), `DashboardPage`, `NotFoundPage`.
- `src/app/router.test.tsx` con `createMemoryRouter`.
- **Fix de aislamiento de tests**: faltaba `afterEach(() => cleanup())` en `src/test/setup.ts` — sin `test.globals: true`, el auto-cleanup de Testing Library nunca se registraba y el DOM de un test contaminaba el siguiente. Es un fix a nivel de suite completa, no solo de esta ruta.
- **Convención de títulos de página**: `CardTitle` de shadcn/ui renderiza un `<div>` sin `role="heading"` — los títulos de página deben ser `<h1>` reales (igual que `HomePage`/`NotFoundPage`). `DashboardPage` se reescribió para seguir esta convención.

### Bloque 6 — CI (GitHub Actions) + deploy Vercel
- `.github/workflows/ci.yml`: en cada push/PR corre `actions/checkout@v6`, `pnpm/action-setup@v6`, `actions/setup-node@v6` (Node 22), `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- `vercel.json` con rewrite SPA (`/(.*) -> /index.html`) para que React Router maneje las rutas client-side sin 404 de Vercel.
- `package.json`: pin de `"packageManager": "pnpm@10.33.0"` para que `pnpm/action-setup@v6` detecte la versión automáticamente.
- `.gitignore`: excluye archivos locales de Claude Code (`.claude/settings.local.json`, `.claude/scheduled_tasks.lock`, `.atl/.skill-registry.cache.json`).
- **Primer commit del repo** (`60d26e1`, 76 archivos) en rama `main` (renombrada desde `master`, remoto estaba vacío), pusheado a `https://github.com/lturcios/PsicoCMS-SV.git`.
- CI verde en el primer push: run [27519555401](https://github.com/lturcios/PsicoCMS-SV/actions/runs/27519555401) — `conclusion: success`.
- Vercel: repo importado por el usuario, deploy en `https://psico-cms-sv.vercel.app/`.
- Verificación final (curl): `/`, `/panel`, `/ruta-rara` → todos `200`, `<title>PsicoCMS SV</title>` correcto. Confirma rewrite SPA funcionando.

**Criterio de aceptación Fase 0 cumplido:** un `git push` dispara CI y deploy automático; cambiar de tema claro/oscuro funciona. ✔️

---

## Fase 1 — Auth + multi-tenant (✅ completa)

### Bloque 1 — BD: tabla profiles + Auth Hook
- Migración `20260616002911_fase1_profiles_auth.sql`: tabla `profiles` (1:1 con `auth.users`, `tenant_id not null`, `role check owner/asistente`), RLS activado.
- Helpers `current_tenant_id()` y `current_user_role()` leen el JWT (nunca confían en el cliente).
- `custom_access_token_hook`: inyecta `tenant_id` y `user_role` en el JWT. Requiere ser habilitado en Supabase Dashboard → Auth → Hooks.
- RPC `create_tenant_for_user` (`security definer`): crea tenant + perfil en una sola transacción atómica.
- **Fix:** migración `20260616003000_fix_auth_hook_grants.sql` agrega `GRANT SELECT ON profiles TO supabase_auth_admin` — sin esto el hook lanza `unexpected_failure` porque `supabase_auth_admin` no tenía acceso a la tabla.

### Bloque 2 — Auth client
- `AuthProvider` + `AuthContext`: sesión reactiva vía `onAuthStateChange`; `isLoading` true hasta primer `getSession`.
- `useAuth` hook; `AuthState` tipado.
- `LoginPage`, `RegisterPage`, `MagicLinkPage` con React Hook Form v7 + Zod v4.
- `src/lib/zod-resolver.ts`: wrapper sobre `@hookform/resolvers/zod` para resolver incompatibilidad de tipos entre `@hookform/resolvers@5.x` y `zod@4.x` (runtime OK, solo tipos).
- `useSignUp` incluye `emailRedirectTo: ${origin}/onboarding` para que el flujo con email confirmation funcione correctamente.

### Bloque 3 — Onboarding
- `OnboardingPage`: formulario displayName + slug con transformación automática (mayúsculas→minúsculas, espacios→guiones, caracteres inválidos eliminados).
- Campo slug usa `useController` (RHF) para campo controlado real — patrón `register` + `setValue` descartado por ser frágil.
- `RegisterPage.onSuccess` verifica `data.session`: navega a `/onboarding` si hay sesión (email confirmation OFF) o muestra toast "revisá tu correo" si no la hay.
- **Bug corregido:** `if (!session?.user.id) return` salía silenciosamente. Ahora muestra toast.error y redirige a `/login`.

### Bloque 4 — Rutas protegidas (AuthGuard)
- `AuthGuard` (pathless layout): `isLoading` → spinner, `!session` → `/login`, `!profile.data` → `/onboarding`, ambos → `<Outlet />`.
- `useProfile` usa `.maybeSingle()` (no lanza error si no hay fila) → devuelve `Profile | null`.
- `/onboarding` permanece en `PublicLayout` (accesible sin sesión para el flujo de confirmación de email).

### Bloque 5 — Layout del panel
- `PanelLayout`: backdrop + `AppSidebar` + `AppTopbar` + `<Outlet />`.
- `AppSidebar`: 4 NavLinks + botón Sign Out; responsive (mobile: overlay, desktop: estático).
- `AppTopbar`: hamburger (md:hidden), `ThemeVariantToggle`, `ThemeToggle`, avatar con iniciales, `DropdownMenu`.
- `useSidebarStore` (Zustand, sin persist): `{ isOpen, toggle, close }`.
- `useIsOwner`: lee `profile.data.role === 'owner'` para control de acceso por rol.

### Bloque 6 — Criterio de aceptación ✅
- Verificado manualmente: dos cuentas distintas con sus propios tenants. Cada usuario ve solo sus propios datos (RLS + JWT con `tenant_id`). Sin fuga de datos entre tenants.

**Criterio de aceptación Fase 1 cumplido:** dos cuentas no ven datos entre sí; el JWT trae `tenant_id` y `user_role` (verificado en Supabase Dashboard → Auth → Users → JWT). ✔️

---

## Decisiones técnicas relevantes (transversales)

- Aislamiento de tests Vitest requiere `afterEach(() => cleanup())` manual en `src/test/setup.ts` (no alcanza con `@testing-library/react` solo).
- Títulos de página = `<h1>` real, nunca `CardTitle` de shadcn/ui (no es un heading semántico).
- Rama principal del repo: `main` (no `master`).
- `database.types.ts` es generado (`supabase gen types`), nunca editado a mano.

---

## Pendientes / deuda técnica

- 🔲 Ítems de "Preparación del entorno" relacionados a MCPs (Context7, Playwright) y cuenta Resend: revisar cuando se usen.
- 🔲 Tests de integración para `AuthGuard` (actualmente solo test de redirección a `/login`).

---

## Próximo paso

**Fase 2 — Configuración del consultorio** (`docs/04-Plan-de-Fases.md`):
- Datos del profesional (nombre, título, colegiatura JVPP, bio).
- Foto de perfil y logo (Cloudinary — activos públicos).
- Especialidades, servicios con precio US$ y duración.
- Horarios de disponibilidad + excepciones + feriados SV.
- Política de cancelación y antelación mínima.
- Contacto: celular +503, departamento/municipio.
- **Criterio de aceptación:** datos configurados alimentan booking y página pública.
- Skills: 02, 04 · MCPs: Supabase, Cloudinary.
