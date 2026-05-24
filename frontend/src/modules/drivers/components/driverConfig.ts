import { CheckCircle2, Bus as BusIcon, UserX } from 'lucide-react';

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
