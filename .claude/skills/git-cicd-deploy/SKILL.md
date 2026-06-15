---
name: git-cicd-deploy
description: >
  Usar al hacer commits, crear ramas, abrir PRs, configurar GitHub Actions, manejar
  variables de entorno, aplicar migraciones en CI, o desplegar en Vercel. Define
  Conventional Commits, estrategia de ramas, checklist de PR y el pipeline. Disparar
  ante: commit, branch, rama, PR, merge, CI, GitHub Actions, deploy, Vercel, env,
  variables de entorno, migración en producción.
---

# Git, CI/CD y despliegue

## Conventional Commits
`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `style:`, `perf:`, `build:`, `ci:`.
- Mensajes en español, claros y en imperativo. Ej: `feat(reservas): valida solapamiento en book-appointment`.
- Scope opcional con el dominio/feature.

## Ramas
- `main` siempre desplegable.
- Una rama por tarea: `feat/fase4-motor-reservas`, `fix/tz-cruce-medianoche`.
- PR pequeños y enfocados; nada de PRs gigantes que mezclan fases.

## Antes de commitear (lo refuerza Lefthook)
```bash
pnpm check && pnpm typecheck && pnpm test
```
Si algo falla, no se commitea.

## Checklist de PR
- [ ] Cumple el criterio de aceptación de la fase que toca
- [ ] CI en verde (lint, typecheck, test)
- [ ] Migraciones incluidas y nombradas (si tocó BD)
- [ ] Tipos regenerados (si cambió el esquema)
- [ ] Sin secrets ni `.env` commiteados
- [ ] Preview de Vercel revisado
- [ ] `PROGRESO.md` / `CHECKLIST-AVANCE.md` actualizados al cerrar fase

## Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 'lts/*', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm check          # biome lint + format
      - run: pnpm typecheck      # tsc --noEmit
      - run: pnpm test           # vitest
      # - run: pnpm test:e2e     # playwright (cuando haya flujos)
```

## Migraciones de BD en CI/CD
- Las migraciones viven en `supabase/migrations/` y se versionan con el código.
- Al mergear a `main`, un job (o el flujo de Supabase) aplica `supabase db push` al proyecto.
- **Nunca** editar una migración ya aplicada en main: crear una nueva que corrija.
- Acciones destructivas (drop, alter peligroso) se revisan a mano antes de mergear.

## Vercel
- Conectar el repo: deploy automático: **preview por cada PR**, **producción al mergear a main**.
- Build con pnpm. Configurar variables de entorno en Vercel (las públicas `VITE_*`; las privadas viven en Edge Functions de Supabase, no en Vercel).
- ⚠️ Hobby es uso no comercial: para producción comercial, Pro o alternativa (Cloudflare Pages/Netlify). Documentar la decisión.

## Variables de entorno
- `.env.local` (ignorado) para desarrollo; `.env.example` (commiteado, sin valores) como referencia.
- Cliente: solo `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Servidor (Edge/CI): `service_role`, `RESEND_API_KEY`, tokens de WhatsApp/Cloudinary.

## Gotchas
- `--frozen-lockfile` en CI para builds reproducibles.
- No exponer claves privadas como `VITE_*` (todo `VITE_*` termina en el bundle del cliente).
- Mantener CI rápido: E2E solo cuando aporta; cachear dependencias.
