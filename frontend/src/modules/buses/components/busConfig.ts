import { CheckCircle2, Wrench, Ban, type LucideProps } from 'lucide-react';

export const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<LucideProps> }> = {
  OPERATIONAL: {
    label: 'Operativo',
    color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    icon: CheckCircle2
  },
  MAINTENANCE: {
    label: 'En Mantenimiento',
    color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    icon: Wrench
  },
  OUT_OF_SERVICE: {
    label: 'Fuera de Servicio',
    color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    icon: Ban
  }
} as const;

export const busStatusOptions = [
  { value: 'OPERATIONAL' as const, label: 'Marcar Operativo', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'MAINTENANCE' as const, label: 'Enviar a Taller', icon: Wrench, className: 'text-amber-600 dark:text-amber-400' },
  { value: 'OUT_OF_SERVICE' as const, label: 'Poner Inactivo', icon: Ban, className: 'text-rose-600 dark:text-rose-400' },
];

export const BUS_TYPES = [
  { value: 'LUXURY' as const, label: 'Servicio de Lujo' },
  { value: 'EXPRESS' as const, label: 'Servicio Exprés' },
  { value: 'STANDARD' as const, label: 'Servicio Estándar' },
];

export const typeLabels: Record<string, string> = {
  LUXURY: 'Servicio de Lujo',
  EXPRESS: 'Servicio Exprés',
  STANDARD: 'Servicio Estándar'
} as const;
