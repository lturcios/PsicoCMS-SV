---
name: testing-calidad
description: >
  Usar al escribir o ejecutar pruebas: unitarias y de componente (Vitest + Testing
  Library) o end-to-end (Playwright). Define qué probar sí o sí (solapamientos de citas,
  aislamiento RLS, zona horaria), cómo armar datos de prueba por tenant, y la estrategia
  general. Disparar ante: test, prueba, Vitest, Playwright, cobertura, E2E, mock, fixture.
---

# Testing y calidad

Filosofía: probar lo que **duele si se rompe**, no perseguir cobertura por la cobertura. En este producto, lo que duele es: doble reserva, fuga de datos entre tenants, y horas mal calculadas.

## Pirámide
- **Unit (Vitest):** lógica pura — generación de slots, validadores Zod, helpers de fecha/TZ, cálculos del dashboard.
- **Componente (Vitest + Testing Library):** formularios, estados de carga/vacío/error, interacciones clave.
- **E2E (Playwright):** flujos críticos completos, sobre todo el de reserva pública.

## Pruebas obligatorias (no se mergea sin ellas)
1. **Anti-solapamiento:** dos reservas al mismo slot → solo una entra (probar también concurrencia simulada contra la Edge Function).
2. **Aislamiento RLS:** con sesión del tenant A, no se pueden leer ni escribir datos del tenant B.
3. **Zona horaria:** un slot creado a una hora SV se guarda en UTC correcto y se muestra de vuelta igual; casos de cruce de medianoche.
4. **Rol asistente:** no accede a notas clínicas ni adjuntos.
5. **Flujo de reserva pública (E2E):** entrar a la página del consultorio → elegir servicio → elegir slot → reservar → ver confirmación.

## Datos de prueba
- Sembrar **dos tenants** distintos en los tests de aislamiento.
- Helpers/fixtures para crear tenant + profile + servicios + disponibilidad.
- En E2E, usar un proyecto Supabase de prueba o entorno local (`supabase start`), nunca producción.

## Convenciones
- Tests junto al código (`*.test.ts(x)`) para unit/componente; E2E en `/e2e`.
- Nombrar tests por comportamiento esperado ("no permite reservar un slot ocupado").
- Evitar mocks frágiles; preferir probar contra la BD local cuando se valida lógica de datos.

## CI
- `pnpm check && pnpm typecheck && pnpm test` corren en cada PR (ver skill git-cicd-deploy).
- Playwright corre en PR cuando hay flujos que tocar; mantener los E2E rápidos y estables.

## Gotchas
- No probar contra producción ni con datos reales de pacientes.
- Tests de TZ: fijar la zona del entorno de test o pasar la zona explícita; no depender de la zona de la máquina de CI.
- Los tests de RLS deben usar JWT con el claim `tenant_id` correspondiente, no la service_role (que salta RLS).
