import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useDrivers } from '@/modules/drivers/hooks/useDrivers';
import { useDeleteDriver } from '@/modules/drivers/hooks/useDeleteDriver';
import { useUpdateDriverAvailability } from '@/modules/drivers/hooks/useUpdateDriverAvailability';
import { CreateDriverDialog } from '@/modules/drivers/components/CreateDriverDialog';
import { EditDriverDialog } from '@/modules/drivers/components/EditDriverDialog';
import { DriversPageHeader } from '@/modules/drivers/components/DriversPageHeader';
import { DriversStatsCards } from '@/modules/drivers/components/DriversStatsCards';
import { DriversFilters } from '@/modules/drivers/components/DriversFilters';
import { DriverCard } from '@/modules/drivers/components/DriverCard';
import { DriverCardSkeleton } from '@/modules/drivers/components/DriverCardSkeleton';
import { DriversErrorState } from '@/modules/drivers/components/DriversErrorState';
import { DriversEmptyState } from '@/modules/drivers/components/DriversEmptyState';
import type { Driver } from '@/modules/drivers/types';

export const DriversPage = () => {
  const { data: drivers, isLoading, isError, error } = useDrivers();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { mutate: deleteDriver } = useDeleteDriver();
  const { mutate: updateDriverAvailability } = useUpdateDriverAvailability();

  const stats = !drivers ? { total: 0, available: 0, onTrip: 0, offDuty: 0 } : {
    total: drivers.length,
    available: drivers.filter(d => d.availability === 'AVAILABLE').length,
    onTrip: drivers.filter(d => d.availability === 'ON_TRIP').length,
    offDuty: drivers.filter(d => d.availability === 'OFF_DUTY').length,
  };

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    return drivers.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || d.availability === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const handleToggleAvailability = (id: string, newAvailability: Driver['availability']) => {
    updateDriverAvailability({ id, availability: newAvailability });
  };

  const handleDelete = (id: string) => {
    deleteDriver(id, {
      onSuccess: () => toast.success('Conductor eliminado'),
      onError: () => {
        toast.error('Error al eliminar el conductor');
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
      },
    });
  };

  if (isError) {
    return <DriversErrorState message={(error as Error).message} onRetry={() => queryClient.refetchQueries({ queryKey: ['drivers'] })} />;
  }

  return (
    <>
      <main className="w-full max-w-7xl mx-auto space-y-8 pb-12">
        <DriversPageHeader onCreateClick={() => setDialogOpen(true)} />

        <DriversStatsCards stats={stats} isLoading={isLoading} />

        <DriversFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <DriverCardSkeleton />
              <DriverCardSkeleton />
              <DriverCardSkeleton />
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredDrivers.map((d, index) => (
                <DriverCard
                  key={d.id}
                  driver={d}
                  index={index}
                  onToggleAvailability={handleToggleAvailability}
                  onDelete={handleDelete}
                  onEdit={setEditingDriver}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && filteredDrivers.length === 0 && (
          <DriversEmptyState onReset={() => { setSearchTerm(''); setStatusFilter('ALL'); }} />
        )}
              </main>

      <CreateDriverDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditDriverDialog
        open={!!editingDriver}
        onOpenChange={(open) => { if (!open) setEditingDriver(null); }}
        driver={editingDriver}
      />
    </>
  );
};
