import { CheckCircle2, Bus as BusIcon, UserX } from 'lucide-react';

export const driverAvailabilityOptions = [
  { value: 'AVAILABLE' as const, label: 'Marcar Disponible', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'ON_TRIP' as const, label: 'Asignar a Ruta', icon: BusIcon, className: 'text-blue-600 dark:text-blue-400' },
  { value: 'OFF_DUTY' as const, label: 'Poner en Descanso', icon: UserX, className: 'text-slate-600 dark:text-slate-400' },
];

export const availabilityConfig = {
  AVAILABLE: {
    label: 'Disponible',
    color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    icon: CheckCircle2
  },
  ON_TRIP: {
    label: 'En Ruta',
    color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    icon: BusIcon
  },
  OFF_DUTY: {
    label: 'En Descanso',
    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
    icon: UserX
  }
} as const;
