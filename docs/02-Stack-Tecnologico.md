# Stack Tecnológico — PsicoCMS SV

> Objetivo: un producto **muy atractivo, responsivo y profesional**, multi-tenant, construible y operable sobre **capas gratuitas** (Supabase, Vercel, Cloudinary, Resend), con **pnpm** como gestor de paquetes.

---

## 1. Resumen del stack (de un vistazo)

| Capa | Elección | Por qué |
|---|---|---|
| **Gestor de paquetes** | **pnpm** | Rápido, eficiente en disco, *workspaces* listos si crece a monorepo. |
| **Build/dev** | **Vite 6** | HMR instantáneo, build optimizado, estándar actual. |
| **Lenguaje** | **TypeScript 5 (strict)** | Seguridad de tipos en todo el stack. |
| **UI framework** | **React 19** | Consistencia con tu stack actual; Server Actions / `use` / mejoras de forms. |
| **Routing** | **React Router 7** (data mode) | Rutas tipadas, loaders/actions, soporte SPA y SSR. *(Alt: TanStack Router.)* |
| **Estilos** | **Tailwind CSS v4** | Velocidad de maquetación, theming con CSS variables, motor nuevo más rápido. |
| **Componentes** | **shadcn/ui** (Radix + Tailwind) | Accesibles, copy-paste, 100% personalizables → clave para los "11 temas". |
| **Estado servidor** | **TanStack Query v5** | Caché, sincronización, optimistic updates para la agenda. |
| **Estado cliente** | **Zustand** | Ligero para UI/preferencias/tema. |
| **Formularios** | **React Hook Form + Zod** | Validación robusta y tipada (cliente y servidor). |
| **Calendario** | **FullCalendar** (daygrid/timegrid/interaction) | "Estilo Google Calendar" real: mes/semana/día + drag&drop. *(Alt moderna: Schedule-X.)* |
| **Editor visual** | **TipTap** | Headless, extensible; sirve para blog y notas clínicas. |
| **Gráficas** | **Recharts** (o **Tremor** para dashboard) | Estadísticas del panel, atractivas y simples. |
| **Animación** | **Motion** (ex Framer Motion) | Microinteracciones que elevan la percepción de calidad. |
| **Iconos** | **Lucide** | Limpios, consistentes con shadcn/ui. |
| **Fechas/zona horaria** | **date-fns + date-fns-tz** | Manejo correcto de `America/El_Salvador`. |
| **PDF** | **@react-pdf/renderer** (o **pdf-lib** en Edge) | Consentimiento informado y exportaciones. |
| **Backend / BaaS** | **Supabase** (Postgres + Auth + Storage + Edge Functions + Realtime) | Todo-en-uno con capa gratuita; RLS nativo para multi-tenant. |
| **Multi-tenancy** | **RLS + `tenant_id` + custom JWT claim** | Aislamiento a nivel de BD, barato y seguro. |
| **Email** | **Resend + React Email** | 3k correos/mes gratis; plantillas en React. |
| **WhatsApp** | **WhatsApp Cloud API** (Meta) | Recordatorios automáticos; `wa.me` para el botón simple. |
| **Imágenes públicas** | **Cloudinary** | CDN + transformaciones para blog/perfil/temas. *(NO para adjuntos clínicos.)* |
| **Hosting frontend** | **Vercel** | Deploy automático desde Git; preview por PR. ⚠️ ver nota de licencia. |
| **Monitoreo** | **Sentry** (free) | Errores en producción. |
| **Lint/format** | **Biome** (o ESLint + Prettier) | Rápido, una sola herramienta. |
| **Testing** | **Vitest + Testing Library + Playwright** | Unit/componente + E2E del flujo de reserva. |
| **Git hooks** | **Lefthook** (o Husky + lint-staged) | Calidad antes de commit. |

---

## 2. Justificación de decisiones críticas

### 2.1 ¿Por qué Supabase y no un backend Node propio?
- La consigna pide **sin backend Node** y aprovechar **capa gratuita**. Supabase entrega Postgres + Auth + Storage + Functions + Realtime en un solo plan gratuito.
- El **RLS de PostgreSQL** es la pieza que hace barato y seguro el multi-tenant: el aislamiento vive en la base de datos, no en código de aplicación que se puede olvidar.
- Las **Edge Functions** (Deno) cubren lo que el cliente no debe hacer: enviar emails/WhatsApp, generar PDFs, validar reservas con autoridad, correr recordatorios programados.

### 2.2 Modelo de multi-tenancy elegido
**Base de datos compartida + esquema compartido + discriminador `tenant_id` + RLS.**
- Es el modelo más eficiente para capa gratuita (una sola BD).
- Cada tabla de negocio lleva `tenant_id uuid not null`.
- Un **Auth Hook (Custom Access Token Hook)** inyecta `tenant_id` (y `role`) como *claim* en el JWT al iniciar sesión.
- Las **políticas RLS** filtran `tenant_id = auth.jwt() ->> 'tenant_id'`.
- Las páginas **públicas** (booking, blog) leen por `slug` del tenant mediante una *view*/RPC `security definer` controlada, exponiendo solo datos públicos.

```
┌─────────────────────────────────────────────┐
│              PostgreSQL (Supabase)            │
│  tenants ─┬─ profiles                         │
│           ├─ services / availability          │
│           ├─ patients ── clinical_notes ──┐   │
│           ├─ appointments                 │   │
│           ├─ blog_posts / faqs            │   │
│           └─ consents / audit_log         │   │
│  TODAS con tenant_id + políticas RLS          │
└─────────────────────────────────────────────┘
        ▲                         ▲
   JWT claim                 RPC security definer
   (panel privado)           (páginas públicas)
```

### 2.3 Calendario: FullCalendar vs Schedule-X
- **FullCalendar** es la opción más probada para replicar "estilo Google Calendar" (mes/semana/día, drag&drop, eventos). Los plugins que necesitamos (`daygrid`, `timegrid`, `interaction`) son **gratuitos/MIT**. (Los plugins *premium* tipo timeline de recursos son de pago, pero **no** los necesitamos en MVP.)
- **Schedule-X** es una alternativa moderna, MIT, con estética muy actual. Buena opción si querés un look más fresco. Recomendación: **FullCalendar** en MVP por madurez; reevaluar Schedule-X en la fase de pulido visual.

### 2.4 Almacenamiento: la regla de oro de privacidad
- **Cloudinary** → solo activos **públicos** (imágenes de blog, foto de perfil, assets de temas). Aprovecha CDN y transformaciones.
- **Supabase Storage (buckets privados + RLS)** → **adjuntos clínicos** (fotos, PDFs escaneados). Son datos sensibles de salud: no deben salir a un tercero, en línea con la Ley 144 y con el principio del original ("datos sin terceros").

### 2.5 Theming y "11 temas visuales"
- Tailwind v4 + CSS variables como **design tokens** (`--color-primary`, `--radius`, etc.).
- Cada "tema" es un set de tokens. shadcn/ui consume esos tokens, así que cambiar de tema = cambiar variables, sin tocar componentes.
- Modo claro/oscuro vía clase `dark` + `prefers-color-scheme`, persistido con Zustand.

---

## 3. Nota honesta sobre las "capas gratuitas"

Para que no haya sorpresas al pasar a producción comercial:

- **Vercel Hobby (free)** es para uso **no comercial**. Para un SaaS que cobra, técnicamente corresponde **Vercel Pro (~$20/mes)**. Para desarrollo y MVP, Hobby funciona. Alternativas gratuitas con uso comercial más laxo: **Cloudflare Pages** o **Netlify**.
- **Supabase Free**: 500 MB de BD, 1 GB de storage, pausa por inactividad tras 1 semana sin uso. Suficiente para validar; el plan Pro ($25/mes) llega cuando haya tenants reales.
- **Resend Free**: 3,000 emails/mes, 100/día. Suficiente para arrancar.
- **WhatsApp Cloud API**: tiene conversaciones de servicio gratuitas mensuales; las plantillas de marketing/utilidad se cobran por conversación. Empezar con `wa.me` y subir a Cloud API cuando se justifique.
- **Cloudinary Free**: ~25 créditos/mes (almacenamiento + transformaciones + ancho de banda). Suficiente para imágenes públicas.

> Recomendación: arrancar 100% en capa gratuita; documentar desde ya el "punto de corte" (cuántos tenants/uso disparan el upgrade) para no quedar atrapado.

---

## 4. Estructura de carpetas propuesta (single-repo, feature-based)

```
psicocms-sv/
├── .claude/
│   ├── skills/                 # skills de Claude Code (ver doc 03)
│   ├── CLAUDE.md               # reglas no negociables del proyecto
│   └── settings.json           # permisos/MCPs
├── public/
├── src/
│   ├── app/                    # entrypoint, providers, router
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── features/               # ORGANIZADO POR DOMINIO
│   │   ├── auth/
│   │   ├── tenant/             # onboarding, settings del consultorio
│   │   ├── appointments/       # reservas + calendario
│   │   ├── patients/
│   │   ├── clinical-records/   # historias clínicas (sensible)
│   │   ├── compliance/         # consentimientos, PDF, ARCO-POL
│   │   ├── blog/
│   │   ├── public-site/        # landing pública + booking público
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/           # cliente, tipos generados, helpers RLS
│   │   ├── validators/         # esquemas Zod
│   │   ├── dates/              # helpers America/El_Salvador
│   │   └── utils.ts
│   ├── hooks/
│   ├── stores/                 # Zustand (tema, UI)
│   ├── styles/
│   │   └── themes/             # los 11 temas (tokens)
│   └── types/
├── supabase/
│   ├── migrations/             # SQL versionado
│   ├── functions/              # Edge Functions (Deno)
│   │   ├── send-email/
│   │   ├── book-appointment/   # validación server-side de slots
│   │   ├── generate-consent-pdf/
│   │   ├── whatsapp-reminder/
│   │   └── cron-reminders/
│   └── seed.sql
├── e2e/                        # Playwright
├── .github/workflows/          # CI/CD
├── pnpm-lock.yaml
├── biome.json
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

> **Cuándo pasar a monorepo (pnpm workspaces):** si separás la **landing de marketing** del **app**, o si extraés un paquete `ui`/`shared` reutilizable. Para el MVP, single-repo es más simple.

---

## 5. Versiones de referencia (verificar al iniciar)

> Los números exactos cambian rápido. Antes de arrancar, dejá que Claude Code (con MCP Context7) confirme las versiones estables actuales. Referencia de partida:

- React 19.x · TypeScript 5.x · Vite 6.x · Tailwind 4.x
- React Router 7.x · TanStack Query 5.x · Zustand 5.x
- React Hook Form 7.x · Zod 3.x (o 4.x si ya es estable)
- FullCalendar 6.x · TipTap 2.x · Recharts 2.x · Motion (motion/react)
- Supabase JS 2.x · supabase CLI (última) · Deno (para Edge Functions)
