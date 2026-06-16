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

export const dayScheduleSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_active: z.boolean(),
    start_time: z.string(),
    end_time: z.string(),
  })
  .refine((d) => !d.is_active || d.start_time < d.end_time, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['end_time'],
  });

export const weeklyScheduleSchema = z.object({
  days: z.array(dayScheduleSchema),
});

export type WeeklyScheduleFormValues = z.infer<typeof weeklyScheduleSchema>;

export const exceptionSchema = z
  .object({
    date: z.string().min(1, 'Requerido'),
    type: z.enum(['blocked', 'special_hours']),
    reason: z.string().max(200, 'Máximo 200 caracteres').optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
  })
  .refine((d) => d.type !== 'special_hours' || (!!d.start_time && !!d.end_time), {
    message: 'Se requieren hora de inicio y fin para horario especial',
    path: ['start_time'],
  });

export type ExceptionFormValues = z.infer<typeof exceptionSchema>;

const urlField = z
  .string()
  .max(200)
  .refine((v) => !v || v.startsWith('https://'), { message: 'Debe comenzar con https://' })
  .optional();

export const contactSchema = z.object({
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  address: z.string().max(300, 'Máximo 300 caracteres').optional(),
  instagram_url: urlField,
  facebook_url: urlField,
  website_url: urlField,
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const policySchema = z.object({
  cancellation_hours: z.coerce.number().int().min(0, 'Mínimo 0 horas'),
  min_advance_hours: z.coerce.number().int().min(0, 'Mínimo 0 horas'),
});

export type PolicyFormValues = z.infer<typeof policySchema>;
