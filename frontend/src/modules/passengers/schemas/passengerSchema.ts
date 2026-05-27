import { z } from 'zod';

export const createPassengerSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  email: z
    .string()
    .email('Correo electrónico inválido'),
  phone: z
    .string()
    .transform(val => val.trim().replace(/\s+/g, ''))
    .pipe(z.string().regex(/^\+?\d{7,10}$/, 'El teléfono debe tener entre 7 y 10 dígitos')),
  documentId: z
    .string()
    .min(5, 'La identificación debe tener al menos 5 caracteres')
    .max(20, 'La identificación no puede exceder 20 caracteres'),
});

export type CreatePassengerInput = z.infer<typeof createPassengerSchema>;
