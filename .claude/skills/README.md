# Skills de Claude Code — PsicoCMS SV

Estas son las 11 skills que gobiernan el desarrollo. Cada carpeta tiene un `SKILL.md` con frontmatter (`name`, `description`) que hace que Claude Code la cargue automáticamente cuando la tarea coincide.

## Instalación
Copiá la carpeta `.claude/skills/` completa en la **raíz de tu repositorio**. Claude Code las detecta solo.

```
tu-repo/
├── .claude/
│   ├── CLAUDE.md
│   └── skills/
│       ├── arquitectura-multitenant/SKILL.md
│       ├── convenciones-react-ts/SKILL.md
│       ├── diseno-ui-shadcn/SKILL.md
│       ├── supabase-db-rls/SKILL.md
│       ├── motor-reservas-calendario/SKILL.md
│       ├── gestion-clinica/SKILL.md
│       ├── seguridad-cumplimiento-sv/SKILL.md
│       ├── integraciones-externas/SKILL.md
│       ├── testing-calidad/SKILL.md
│       ├── git-cicd-deploy/SKILL.md
│       └── seo-blog-marketing/SKILL.md
└── ...
```

## Qué skill se usa en cada fase
| Fase | Skills principales |
|---|---|
| 0 — Cimientos | convenciones-react-ts, diseno-ui-shadcn, supabase-db-rls, git-cicd-deploy |
| 1 — Auth + multi-tenant | arquitectura-multitenant, supabase-db-rls, convenciones-react-ts |
| 2 — Configuración consultorio | convenciones-react-ts, diseno-ui-shadcn, integraciones-externas |
| 3 — Pacientes | gestion-clinica, convenciones-react-ts, supabase-db-rls |
| 4 — Calendario + reservas | motor-reservas-calendario, supabase-db-rls |
| 5 — Reserva pública | motor-reservas-calendario, integraciones-externas, diseno-ui-shadcn, testing-calidad |
| 6 — Historias clínicas | gestion-clinica, seguridad-cumplimiento-sv, supabase-db-rls |
| 7 — Cumplimiento + PDF | seguridad-cumplimiento-sv, integraciones-externas |
| 8 — Blog + SEO | seo-blog-marketing, diseno-ui-shadcn, integraciones-externas |
| 9 — Integraciones + dashboard | integraciones-externas, motor-reservas-calendario |
| 10 — Temas + pulido | diseno-ui-shadcn, seo-blog-marketing |
| 11 — Endurecimiento | testing-calidad, seguridad-cumplimiento-sv, arquitectura-multitenant |

## Notas
- Son **gobernanza viva**: si una decisión cambia durante el desarrollo, actualizá la skill correspondiente para que Claude Code siga la regla nueva.
- `CLAUDE.md` (en `.claude/`) tiene las reglas no negociables que aplican siempre; las skills profundizan por dominio.
- Las skills referencian la skill pública `frontend-design` para dirección estética; si la tenés disponible, mejor.
