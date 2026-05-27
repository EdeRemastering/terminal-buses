import { z } from 'zod';

export const createTripSchema = z.object({
  origin: z
    .string()
    .min(3, 'El origen debe tener al menos 3 caracteres')
    .max(80, 'El origen no puede exceder 80 caracteres'),
  destination: z
    .string()
    .min(3, 'El destino debe tener al menos 3 caracteres')
    .max(80, 'El destino no puede exceder 80 caracteres'),
  routeId: z
    .string()
    .min(1, 'La ruta es requerida'),
  departureDate: z
    .string()
    .min(1, 'La fecha de salida es requerida'),
  departureTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
  arrivalDate: z
    .string()
    .min(1, 'La fecha de llegada es requerida'),
  arrivalTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
  busId: z
    .string()
    .min(3, 'El ID del bus debe tener al menos 3 caracteres')
    .max(20, 'El ID del bus no puede exceder 20 caracteres'),
  driverId: z.string().optional(),
  price: z
    .number()
    .min(1, 'El precio debe ser al menos 1')
    .max(1_000_000, 'El precio no puede exceder 1,000,000'),
});

export type TripFormData = z.infer<typeof createTripSchema>;
