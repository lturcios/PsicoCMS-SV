---
name: diseno-ui-shadcn
description: >
  Usar al maquetar UI, crear componentes visuales, trabajar estilos con Tailwind v4 o
  shadcn/ui, definir o aplicar temas (los 11 temas visuales), modo claro/oscuro,
  responsive, animaciones o accesibilidad. Disparar ante: estilo, diseño, tema, color,
  Tailwind, shadcn, dark mode, responsive, layout, animación, accesibilidad, UI.
---

# Diseño UI: Tailwind v4 + shadcn/ui + theming

Objetivo: un producto que se vea **profesional, cálido y confiable** (es salud mental), atractivo en celular primero. Apoyarse también en la skill pública `frontend-design` para dirección estética.

## Principios
- **Mobile-first.** Diseñar a 360px y escalar hacia arriba. Probar siempre en celular.
- **Tokens, no colores hardcodeados.** Todo color/espacio/radio sale de CSS variables.
- **Consistencia > creatividad puntual.** Un sistema, no pantallas sueltas con estilos propios.
- **Calma visual.** Espaciado generoso, jerarquía clara, sin saturar. Tono profesional pero humano.

## Design tokens (base del theming)
Definir tokens como CSS variables. Un **tema = un set de tokens**. shadcn/ui los consume, así que cambiar de tema no toca componentes.

```css
/* src/styles/themes/base.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 200 80% 45%;        /* cada tema redefine esto */
  --primary-foreground: 0 0% 100%;
  --muted: 210 40% 96%;
  --border: 214 32% 91%;
  --radius: 0.75rem;
  /* ...resto de tokens shadcn... */
}
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  /* ...overrides oscuros... */
}
```
- Los 11 temas (Fase 10) se definen como clases/atributos `[data-theme="..."]` que sobreescriben `--primary` y compañía. En Fase 0 basta `base` + 1 alternativo para validar el mecanismo.

## Modo claro/oscuro
- Clase `dark` en `<html>`, controlada por un store Zustand persistido + `prefers-color-scheme` como default.
- Toggle visible en el panel. Transición suave pero sin parpadeo al cargar (aplicar el tema antes del primer render).

## Tailwind v4
- Usar las utilidades sobre los tokens (`bg-background`, `text-foreground`, `border-border`).
- Evitar valores mágicos (`mt-[13px]`); usar la escala. Si falta un valor, agregarlo a la escala, no improvisar inline.
- Composición de clases con `cn()` (clsx + tailwind-merge).

## shadcn/ui
- Traer componentes según se necesiten (no instalar todo de golpe).
- Personalizar vía tokens y variantes (`cva`), no editando a mano cada uso.
- Base recomendada: button, card, input, label, select, dialog, dropdown-menu, tabs, table, sonner (toast), skeleton, badge, avatar, calendar/popover.

## Estados de UI (obligatorios en vistas de datos)
- **Cargando:** skeletons que respetan el layout final (no spinners genéricos en todo).
- **Vacío:** empty state diseñado, con acción sugerida (ej. "Agregá tu primer paciente").
- **Error:** mensaje claro y amable, opción de reintentar. Nunca volcar el error técnico.

## Animación (Motion)
- Microinteracciones sutiles: entrada de listas, transiciones de tabs, feedback de acciones.
- Respetar `prefers-reduced-motion`. Nada de animaciones que mareen en un producto de salud.

## Responsive
- Breakpoints estándar; navegación que colapsa a drawer en celular.
- El **flujo de reserva público** debe ser impecable en celular (es donde más se usará).
- Tablas → en celular, convertir a tarjetas o scroll horizontal controlado.

## Accesibilidad (WCAG 2.1 AA, obligatorio en booking público)
- Contraste AA en texto y controles.
- Foco visible; orden de tabulación lógico; todo operable por teclado.
- Labels reales en inputs; `aria-*` donde haga falta; imágenes con `alt`.
- Verificar combinaciones de tema/oscuro para que ningún tema baje el contraste.

## Gotchas
- Persistir el tema antes del primer paint para evitar el "flash" de tema incorrecto.
- No mezclar colores literales con tokens: si un tema cambia `--primary`, los literales no lo siguen.
- Probar cada tema nuevo en claro Y oscuro antes de darlo por bueno.
