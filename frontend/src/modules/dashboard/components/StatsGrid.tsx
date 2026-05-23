import { Bus, TrendingUp, Users, Calendar as CalendarIcon } from 'lucide-react';
import { StatCard } from '@/modules/dashboard/components/StatCard';
import type { DashboardStats } from '@/modules/dashboard/types';

interface StatsGridProps {
  stats: DashboardStats | undefined;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const items = [
    {
      label: 'Buses Operativos',
      value: String(stats?.totalBuses ?? 0),
      icon: Bus,
      trend: `${stats?.activeTrips ?? 0} en ruta`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Viajes Hoy',
      value: String(stats?.tripsToday ?? 0),
      icon: CalendarIcon,
      trend: `${stats?.activeTrips ?? 0} activos`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pasajeros Activos',
      value: String(stats?.totalPassengers ?? 0),
      icon: Users,
      trend: `${stats?.availableDrivers ?? 0} conductores`,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Ocupación Prom.',
      value: `${stats?.avgOccupancy ?? 0}%`,
      icon: TrendingUp,
      trend: `${stats?.totalBuses ?? 0} buses`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  );
};
