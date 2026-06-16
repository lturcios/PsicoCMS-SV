import { z } from 'zod';

export const profileSchema = z.object({
  professional_name: z.string().max(100, 'Máximo 100 caracteres'),
  title: z.string().max(20),
  credential_number: z.string().max(50),
  bio: z.string().max(1000, 'Máximo 1000 caracteres'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
