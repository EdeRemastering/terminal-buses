import { z } from 'zod';

export const createDriverSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  email: z
    .string()
    .email('Correo electrónico inválido'),
  phone: z
    .string()
    .regex(/^\+?\d{7,15}$/, 'Teléfono inválido. Ejemplo: +57 300 123 4567'),
  licenseNumber: z
    .string()
    .min(5, 'Número de licencia demasiado corto')
    .max(20, 'Número de licencia demasiado largo'),
  licenseType: z
    .string()
    .min(1, 'Selecciona un tipo de licencia'),
  licenseExpiration: z
    .string()
    .min(1, 'La fecha de vencimiento es requerida'),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
