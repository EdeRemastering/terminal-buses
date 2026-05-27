import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useDashboardStats } from '@/modules/dashboard/hooks/useDashboardStats';
import { useDriverInfo } from '@/modules/drivers/hooks/useDriverInfo';
import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import { StatsGrid } from '@/modules/dashboard/components/StatsGrid';
import { ActivityChart } from '@/modules/dashboard/components/ActivityChart';
import { ActiveTripsFeed } from '@/modules/dashboard/components/ActiveTripsFeed';
import { QuickActionsSection } from '@/modules/dashboard/components/QuickActionsSection';
import { DriverDashboard } from '@/modules/dashboard/components/DriverDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { data: driverInfo, isLoading: driverLoading } = useDriverInfo({ enabled: user?.role === 'DRIVER' });

  if (user?.role === 'DRIVER') {
    if (driverLoading) {
      return (
        <div className="container mx-auto p-6 space-y-8 pb-12">
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-muted animate-pulse h-32" />
            ))}
          </div>
        </div>
      );
    }

    return <DriverDashboard driverInfo={driverInfo ?? null} />;
  }

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
        <ActivityChart tripsToday={stats?.tripsToday ?? 0} />
        <ActiveTripsFeed trips={stats?.recentTrips ?? []} />
      </div>
      <QuickActionsSection stats={stats} />
    </div>
  );
};
