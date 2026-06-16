import { z } from 'zod';

export const profileSchema = z.object({
  professional_name: z.string().max(100, 'Máximo 100 caracteres'),
  title: z.string().max(20),
  credential_number: z.string().max(50),
  bio: z.string().max(1000, 'Máximo 1000 caracteres'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const specialtySchema = z.object({
  name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
});

export type SpecialtyFormValues = z.infer<typeof specialtySchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  modality: z.enum(['presencial', 'online', 'ambas']),
  duration_minutes: z.coerce.number().int().min(1, 'Mínimo 1 minuto'),
  price_usd: z.coerce.number().min(0, 'No puede ser negativo'),
  is_active: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
