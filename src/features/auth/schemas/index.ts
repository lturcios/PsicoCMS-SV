import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const signUpSchema = z
  .object({
    email: z.string().email('Ingresá un correo válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const magicLinkSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre puede tener hasta 80 caracteres'),
  slug: z
    .string()
    .min(3, 'El identificador debe tener al menos 3 caracteres')
    .max(30, 'El identificador puede tener hasta 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones (-)'),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
