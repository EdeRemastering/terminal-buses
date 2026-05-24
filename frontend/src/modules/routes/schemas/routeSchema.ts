import { z } from 'zod';

// Puse los types junto con los schemas porque son pocos y aca tienen sentido
export interface Route {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationHours: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  stops: string[];
}

export const createRouteSchema = z.object({
  name: z
    .string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  origin: z
    .string()
    .min(3, 'El origen debe tener al menos 3 caracteres')
    .max(80, 'El origen no puede exceder 80 caracteres'),
  destination: z
    .string()
    .min(3, 'El destino debe tener al menos 3 caracteres')
    .max(80, 'El destino no puede exceder 80 caracteres'),
  distanceKm: z
    .number({ invalid_type_error: 'La distancia es requerida' })
    .min(1, 'La distancia debe ser al menos 1 km')
    .max(5000, 'La distancia no puede exceder 5000 km'),
  durationHours: z
    .number({ invalid_type_error: 'La duración es requerida' })
    .min(0.5, 'La duración debe ser al menos 0.5 horas')
    .max(48, 'La duración no puede exceder 48 horas'),
  basePrice: z
    .number({ invalid_type_error: 'El precio es requerido' })
    .min(1, 'El precio debe ser al menos 1')
    .max(10000, 'El precio no puede exceder 10000'),
  stops: z
    .string()
    .min(1, 'Ingresa al menos una escala'),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
