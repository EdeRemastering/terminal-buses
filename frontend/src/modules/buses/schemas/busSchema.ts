import { z } from 'zod';

export const busStatusEnum = z.enum(['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE']);

export const createBusSchema = z.object({
  plate: z
    .string()
    .min(5, 'La placa debe tener al menos 5 caracteres')
    .max(10, 'La placa no puede exceder 10 caracteres'),
  model: z
    .string()
    .min(3, 'El modelo debe tener al menos 3 caracteres')
    .max(80, 'El modelo no puede exceder 80 caracteres'),
  capacity: z
    .number({ message: 'La capacidad es requerida' })
    .min(10, 'La capacidad mínima es de 10 asientos')
    .max(80, 'La capacidad máxima es de 80 asientos'),
  type: z
    .enum(['LUXURY', 'EXPRESS', 'STANDARD'] as const, {
      message: 'Selecciona un tipo de unidad',
    }),
  year: z
    .number({ message: 'El año es requerido' })
    .min(2018, 'El año debe ser 2018 o posterior')
    .max(2030, 'El año no puede ser mayor a 2030'),
  mileage: z
    .number({ message: 'El kilometraje es requerido' })
    .min(0, 'El kilometraje no puede ser negativo'),
  lastMaintenance: z
    .string()
    .min(1, 'La fecha de último mantenimiento es requerida'),
});

export type CreateBusInput = z.infer<typeof createBusSchema>;

export type UpdateBusInput = Partial<CreateBusInput> & {
  status?: z.infer<typeof busStatusEnum>;
};
