/**
 * Re-exports zodResolver with a type cast to work around a type incompatibility
 * between @hookform/resolvers@5.4.0 and zod@4.4.3.
 *
 * @hookform/resolvers was compiled against zod/v4/core when version.minor was 0,
 * but zod@4.4.3 has version.minor = 4. The runtime behavior is correct; only
 * the TypeScript structural check fails. This wrapper performs a single safe
 * cast so callers don't need to repeat it.
 *
 * Remove when @hookform/resolvers is updated to match zod@4.4.x typings.
 */
import { zodResolver as _zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { $ZodType } from 'zod/v4/core';

export function zodResolver<T extends FieldValues>(schema: $ZodType): Resolver<T> {
  // Cast needed: @hookform/resolvers types were compiled against zod/v4/core@4.0.x
  // but zod@4.4.3 exposes version.minor=4 — structural mismatch in types only.
  return _zodResolver(schema as unknown as Parameters<typeof _zodResolver>[0]) as Resolver<T>;
}
