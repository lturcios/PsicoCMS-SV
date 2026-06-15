# CLAUDE.md — PsicoCMS SV

> Este archivo es la **fuente de verdad** para Claude Code en este repositorio.
> Leelo completo antes de cualquier tarea. Las reglas marcadas como **NO NEGOCIABLE** no se rompen bajo ninguna circunstancia, ni siquiera "temporalmente".

---

## 1. Qué estamos construyendo

**PsicoCMS SV**: un SaaS **multi-tenant** para psicólogos/as independientes en **El Salvador**. Cada profesional tiene su panel de gestión clínica, su agenda con reservas en línea 24/7 y su página web pública, sin saber programar. Una sola aplicación sirve a muchos profesionales con datos completamente aislados.

Mercado: El Salvador (luego Centroamérica). Idioma: español. Moneda: US$. Zona horaria: `America/El_Salvador` (UTC−6, sin horario de verano).

Documentación de referencia (leer cuando aplique a la tarea):
- `docs/01-PRD-PsicoCMS-SV.md` — qué se construye y por qué.
- `docs/02-Stack-Tecnologico.md` — decisiones técnicas.
- `docs/04-Plan-de-Fases.md` — orden de trabajo.
- `CHECKLIST-AVANCE.md` y `PROGRESO.md` — estado del avance.

---

## 2. Reglas NO NEGOCIABLES

1. **Aislamiento multi-tenant.** Toda tabla de negocio lleva `tenant_id uuid not null` y tiene **políticas RLS activas** que filtran por el `tenant_id` del JWT. Nunca crear una tabla sin RLS. Nunca confiar el aislamiento al código de aplicación.
2. **Datos clínicos sin terceros.** Los adjuntos clínicos (fotos, PDFs escaneados, notas) van **exclusivamente** a buckets **privados** de Supabase Storage con RLS. **Jamás** a Cloudinary, CDNs públicos ni URLs accesibles sin autenticación. Cloudinary es **solo** para activos públicos (blog, foto de perfil, assets de temas).
3. **Validación de solapamiento server-side.** Nunca permitir que la única validación de doble reserva esté en el cliente. Siempre: constraint en la base de datos **+** verificación en Edge Function. Asumí condiciones de carrera.
4. **Zona horaria fija.** Toda fecha/hora se calcula en `America/El_Salvador`. Se **guarda en UTC** (`timestamptz`) y se **muestra** convertida con `date-fns-tz`. Nunca usar `new Date()` para lógica de agenda sin zona explícita.
5. **TypeScript estricto.** `strict: true`. **Prohibido `any`** (usar `unknown` + narrowing o tipos correctos). Prohibido `@ts-ignore` sin comentario justificando y ticket asociado.
6. **Secrets solo del lado servidor.** Claves de Resend, WhatsApp, service_role de Supabase, etc., viven en variables de entorno de Edge Functions / CI. **Nunca** en el bundle del cliente, nunca commiteadas. En el cliente solo va la `anon key` y la URL pública de Supabase.
7. **Terminología El Salvador.** DUI (no DNI), US$ (no €), celular (no móvil), computadora (no ordenador), consultorio (no gabinete), "reservar/agendar" (no "coger cita"), Ley 144 / ACE (no RGPD/LOPD). Prefijo telefónico +503.
8. **pnpm.** Único gestor de paquetes. Nunca `npm`/`yarn`. Si ves `package-lock.json` o `yarn.lock`, es un error.
9. **Validación con Zod en los bordes.** Toda entrada externa (formularios, params públicos de booking, payloads de Edge Functions) se valida con Zod antes de usarse.
10. **No avanzar de fase** sin cumplir el criterio de aceptación de la fase actual y sin actualizar `PROGRESO.md`.

---

## 3. Stack (resumido — detalle en docs/02)

- **Gestor:** pnpm · **Build:** Vite 6 · **Lenguaje:** TypeScript 5 strict · **UI:** React 19
- **Routing:** React Router 7 (data mode) · **Estilos:** Tailwind v4 · **Componentes:** shadcn/ui (Radix)
- **Estado servidor:** TanStack Query v5 · **Estado cliente:** Zustand
- **Formularios:** React Hook Form + Zod
- **Calendario:** FullCalendar (daygrid/timegrid/interaction) · **Editor:** TipTap · **Gráficas:** Recharts/Tremor
- **Animación:** Motion · **Iconos:** Lucide · **Fechas:** date-fns + date-fns-tz · **PDF:** @react-pdf/renderer
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime), RLS para multi-tenant
- **Email:** Resend + React Email · **WhatsApp:** Cloud API / wa.me · **Imágenes públicas:** Cloudinary
- **Hosting:** Vercel · **Monitoreo:** Sentry · **Lint/format:** Biome · **Tests:** Vitest + Testing Library + Playwright · **Git hooks:** Lefthook

> Antes de fijar versiones exactas, confirmá las estables actuales con el MCP Context7. No asumas APIs viejas.

---

## 4. Arquitectura y convenciones

### Organización: feature-based
```
src/features/<dominio>/   # auth, tenant, appointments, patients,
                          # clinical-records, compliance, blog,
                          # public-site, dashboard
  components/  hooks/  api/  schemas/  types/  index.ts
src/components/ui/        # shadcn/ui
src/components/shared/    # reutilizables entre features
src/lib/                  # supabase/, validators/, dates/, utils
src/stores/               # Zustand (tema, UI)
src/styles/themes/        # los 11 temas (tokens)
supabase/migrations/      # SQL versionado
supabase/functions/       # Edge Functions (Deno)
```

### Datos
- Acceso a datos siempre vía hooks de **TanStack Query** dentro de `features/*/api/`. Los componentes no llaman a Supabase directo.
- **Zustand** solo para estado de UI/preferencias (tema, sidebar, filtros locales). El estado de servidor vive en Query.
- Tipos de BD: generados con `supabase gen types typescript` → `src/lib/supabase/database.types.ts`. No editar a mano.

### UI / diseño
- Mobile-first siempre. Probar en 360px.
- Theming con **CSS variables** (design tokens). Un tema = un set de tokens. Los componentes consumen tokens, no colores hardcodeados.
- Modo claro/oscuro vía clase `dark`, persistido en Zustand.
- Estados obligatorios en cada vista de datos: cargando (skeleton), vacío (empty state diseñado), error.
- Accesibilidad: foco visible, navegación por teclado, contraste AA — obligatorio en el flujo de reserva público.

### Errores y bordes
- Validar entradas con Zod en el borde; tipar el resto hacia adentro.
- Edge Functions devuelven errores estructurados; el cliente los muestra de forma amable (nunca volcar stack traces al usuario).

---

## 5. Comandos del proyecto

```bash
pnpm install            # instalar dependencias
pnpm dev                # entorno de desarrollo (Vite)
pnpm build              # build de producción
pnpm preview            # previsualizar build
pnpm check              # biome (lint + format check)
pnpm format             # biome (autoformatear)
pnpm typecheck          # tsc --noEmit
pnpm test               # vitest (unit/componente)
pnpm test:e2e           # playwright (E2E)

# Supabase
pnpm supabase start         # entorno local
pnpm supabase db push       # aplicar migraciones
pnpm supabase gen types     # regenerar tipos a database.types.ts
pnpm supabase functions deploy <nombre>
```

> Si un script aún no existe en `package.json`, créalo en vez de inventar variantes.

---

## 6. Git y flujo de trabajo

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `style:`, `perf:`.
- Una rama por tarea/feature: `feat/fase4-motor-reservas`.
- Antes de commitear: `pnpm check && pnpm typecheck && pnpm test` (Lefthook lo refuerza).
- PR con descripción + criterio de aceptación de la fase que toca; preview en Vercel.
- Migraciones de BD: una migración por cambio, nombrada con fecha y propósito. Nunca editar una migración ya aplicada en main.

---

## 7. Cumplimiento legal (El Salvador)

- Rige la **Ley para la Protección de Datos Personales (D.L. 144/2024)**, supervisada por la **ACE**.
- Datos de salud = **datos sensibles**: requieren consentimiento expreso e informado.
- Implementar derechos **ARCO-POL** (Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Olvido, Limitación): exportar datos del paciente y borrar/anonimizar.
- Toda lectura/edición de historia clínica se registra en **bitácora de auditoría**.
- Las plantillas de consentimiento las revisa un abogado antes de ofrecerlas como definitivas: marcalas como "borrador legal" hasta entonces.

---

## 8. Qué hacer cuando hay dudas

1. Si la tarea toca un dominio con skill (`.claude/skills/`), leé esa skill primero.
2. Si una decisión no está cubierta aquí ni en `docs/`, **preguntá** antes de improvisar; proponé la opción y esperá confirmación.
3. Ante una acción destructiva (borrar datos, push a main, cambiar RLS), pará y pedí confirmación explícita.
4. Al terminar una sesión, actualizá `PROGRESO.md` (qué se hizo, decisiones, pendientes, próximo paso) y marcá el `CHECKLIST-AVANCE.md`.
