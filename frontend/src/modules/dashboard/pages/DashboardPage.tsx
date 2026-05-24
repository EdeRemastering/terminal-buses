import { useDashboardStats } from '@/modules/dashboard/hooks/useDashboardStats';
import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import { StatsGrid } from '@/modules/dashboard/components/StatsGrid';
import { ActivityChart } from '@/modules/dashboard/components/ActivityChart';
import { ActiveTripsFeed } from '@/modules/dashboard/components/ActiveTripsFeed';
import { QuickActionsSection } from '@/modules/dashboard/components/QuickActionsSection';

export const DashboardPage = () => {
  const { data: stats, isLoading, isError } = useDashboardStats();

  // TODO: reemplazar esqueleto generico con Skeleton dedicado con shimmer
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 pb-12">
        <DashboardHeader stats={null} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl bg-muted animate-pulse h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 rounded-xl bg-muted animate-pulse h-[400px]" />
          <div className="p-6 rounded-xl bg-muted animate-pulse h-[400px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <p className="font-bold">Error al cargar datos del dashboard</p>
          {/* FIXME: implementar reintento automatico con exponential backoff */}
          {/* v2: agregar boton de reintentar manual */}
          <p className="text-sm">Verifica la conexión con el servidor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 pb-12">
      <DashboardHeader stats={stats} />
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ActivityChart tripsToday={stats!.tripsToday} />
        <ActiveTripsFeed trips={stats!.recentTrips} />
      </div>
      <QuickActionsSection stats={stats} />
    </div>
  );
};
