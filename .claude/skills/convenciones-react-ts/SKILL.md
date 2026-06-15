---
name: convenciones-react-ts
description: >
  Usar al crear o editar componentes React, hooks, features, o cualquier código
  TypeScript del frontend. Define la estructura feature-based, el patrón de acceso a
  datos con TanStack Query, cuándo usar Zustand, reglas de TypeScript estricto, y
  convenciones de nombres e imports. Disparar ante: componente, hook, feature, query,
  store, tipo, refactor de frontend.
---

# Convenciones React 19 + TypeScript

## TypeScript
- `strict: true`. **Prohibido `any`** → usar `unknown` + narrowing, o tipos correctos.
- Sin `@ts-ignore`/`@ts-expect-error` salvo comentario justificando + razón.
- Tipar props con `type` (no `interface` salvo extensión). Evitar `React.FC`.
- Inferir tipos de Zod con `z.infer<typeof Schema>`; no duplicar tipos a mano.
- Tipos de BD desde `database.types.ts` (generados); no reescribirlos.

## Estructura feature-based
```
src/features/<dominio>/
  components/      # UI propia de la feature
  hooks/           # hooks de datos (TanStack Query) y de UI
  api/             # funciones que hablan con Supabase
  schemas/         # esquemas Zod
  types/           # tipos locales de la feature
  index.ts         # API pública de la feature (lo que otros importan)
```
- Los componentes **no** llaman a Supabase directo: lo hacen los hooks de `api/`.
- Lo que una feature expone a otras pasa por su `index.ts`. Evitar imports profundos cruzados.
- Componentes compartidos genéricos → `src/components/shared`. Primitivos shadcn → `src/components/ui`.

## Datos: TanStack Query
```ts
// features/patients/api/patients.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export const patientKeys = {
  all: ['patients'] as const,
  list: (q: string) => [...patientKeys.all, 'list', q] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
};

export function usePatients(q = '') {
  return useQuery({
    queryKey: patientKeys.list(q),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients').select('*').ilike('full_name', `%${q}%`);
      if (error) throw error;
      return data;
    },
  });
}
```
- Una **factory de query keys** por feature (como arriba) para invalidaciones consistentes.
- Mutaciones invalidan las keys afectadas. Usar **optimistic updates** en la agenda (UX fluida).
- El error se `throw`-ea en `queryFn`; el componente muestra estado de error.

## Estado cliente: Zustand
- Solo UI/preferencias: tema, estado del sidebar, filtros locales no persistentes en URL.
- El estado de servidor **vive en Query**, no se duplica en Zustand.
- Lo navegable/compartible (filtros de listado, fecha del calendario) va en la **URL** (search params), no en Zustand.

## Formularios
- React Hook Form + `zodResolver`. Un esquema Zod por formulario en `schemas/`.
- Mostrar errores por campo; deshabilitar submit mientras está pendiente.

## Nombres
- Componentes y tipos: `PascalCase`. Hooks: `useCamelCase`. Funciones/vars: `camelCase`.
- Archivos de componente: `PascalCase.tsx`. Otros: `kebab-case.ts`.
- Booleans con prefijo (`isLoading`, `hasError`, `canEdit`).

## Imports
- Alias `@/` a `src/`. Orden: externos → `@/` → relativos.
- Evitar barriles gigantes que rompan el tree-shaking; barril por feature está bien.

## Componentes
- Pequeños y enfocados; extraer lógica a hooks.
- Estados obligatorios en vistas de datos: **cargando** (skeleton), **vacío** (empty state), **error**.
- Accesibilidad: labels, roles, foco; nada de `div` clickeable sin semántica.
- React 19: aprovechar `use`, acciones y `useActionState` donde aporten; no forzarlos.

## Gotchas
- No poner `tenant_id` en queries del cliente: lo aplica RLS. Filtrar por `tenant_id` en el cliente es redundante y engañoso.
- No guardar datos sensibles en Zustand persistido (localStorage) — solo preferencias de UI.
- Cuidado con efectos: preferir derivar estado y Query sobre `useEffect` para datos.
