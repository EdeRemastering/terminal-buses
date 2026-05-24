import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRoutes } from '@/modules/routes/hooks/useRoutes';
import { AnimatePresence } from 'framer-motion';
import type { Route } from '@/modules/routes/schemas/routeSchema';
import { CreateRouteDialog } from '@/modules/routes/components/CreateRouteDialog';
import { RoutesPageHeader } from '@/modules/routes/components/RoutesPageHeader';
import { RoutesStatsCards } from '@/modules/routes/components/RoutesStatsCards';
import { RoutesFilters } from '@/modules/routes/components/RoutesFilters';
import { RoutesErrorState } from '@/modules/routes/components/RoutesErrorState';
import { RoutesEmptyState } from '@/modules/routes/components/RoutesEmptyState';
import { RouteCard } from '@/modules/routes/components/RouteCard';
import { RouteCardSkeleton } from '@/modules/routes/components/RouteCardSkeleton';

export const RoutesPage = () => {
  const { data: routes, isLoading, isError, error } = useRoutes();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const stats = !routes ? { total: 0, active: 0, inactive: 0, totalDistance: 0 } : {
    total: routes.length,
    active: routes.filter(r => r.status === 'ACTIVE').length,
    inactive: routes.filter(r => r.status === 'INACTIVE').length,
    totalDistance: routes.reduce((acc, r) => acc + r.distanceKm, 0)
  };

  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    return routes.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchTerm, statusFilter]);

  const handleToggleStatus = (id: string, newStatus: Route['status']) => {
    queryClient.setQueryData<Route[]>(['routes'], (old) =>
      old ? old.map(r => r.id === id ? { ...r, status: newStatus } : r) : old
    );
  };

  const handleDelete = (id: string) => {
    queryClient.setQueryData<Route[]>(['routes'], (old) =>
      old ? old.filter(r => r.id !== id) : old
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  if (isError) return <RoutesErrorState message={(error as Error).message} onRetry={() => window.location.reload()} />;

  return (
    <>
      <main className="w-full max-w-7xl mx-auto space-y-8 pb-12">
        <RoutesPageHeader onCreateClick={() => setDialogOpen(true)} />

        <RoutesStatsCards
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
          totalDistance={stats.totalDistance}
          isLoading={isLoading}
        />

        <RoutesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <RouteCardSkeleton key={i} />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredRoutes.map((r, index) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  index={index}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && filteredRoutes.length === 0 && (
          <RoutesEmptyState onReset={handleResetFilters} />
        )}
      </main>

      <CreateRouteDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
