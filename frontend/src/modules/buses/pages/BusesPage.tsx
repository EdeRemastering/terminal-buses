import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useBuses } from '@/modules/buses/hooks/useBuses';
import { useDeleteBus } from '@/modules/buses/hooks/useDeleteBus';
import { useUpdateBusStatus } from '@/modules/buses/hooks/useUpdateBusStatus';
import type { Bus } from '@/modules/buses/types';
import { CreateBusDialog } from '@/modules/buses/components/CreateBusDialog';
import { EditBusDialog } from '@/modules/buses/components/EditBusDialog';
import { BusesHistoryDialog } from '@/modules/buses/components/BusesHistoryDialog';
import { BusesPageHeader } from '@/modules/buses/components/BusesPageHeader';
import { BusesStatsCards } from '@/modules/buses/components/BusesStatsCards';
import { BusesFiltersPanel } from '@/modules/buses/components/BusesFiltersPanel';
import { BusCard } from '@/modules/buses/components/BusCard';
import { BusCardSkeleton } from '@/modules/buses/components/BusCardSkeleton';
import { BusesErrorState } from '@/modules/buses/components/BusesErrorState';
import { BusesEmptyState } from '@/modules/buses/components/BusesEmptyState';

export const BusesPage = () => {
  const { data: buses, isLoading, isError, error } = useBuses();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [historyBus, setHistoryBus] = useState<Bus | null>(null);
  const { mutate: deleteBus } = useDeleteBus();
  const { mutate: updateBusStatus } = useUpdateBusStatus();

  const stats = !buses ? { total: 0, operational: 0, maintenance: 0, outOfService: 0 } : {
    total: buses.length,
    operational: buses.filter(b => b.status === 'OPERATIONAL').length,
    maintenance: buses.filter(b => b.status === 'MAINTENANCE').length,
    outOfService: buses.filter(b => b.status === 'OUT_OF_SERVICE').length
  };

  const filteredBuses = useMemo(() => {
    if (!buses) return [];
    return buses.filter(bus => {
      const matchesSearch =
        bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || bus.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [buses, searchTerm, statusFilter, typeFilter]);

  const handleToggleStatus = (id: string, newStatus: Bus['status']) => {
    updateBusStatus({ id, status: newStatus });
  };

  const handleDeleteBus = (id: string) => {
    deleteBus(id, {
      onSuccess: () => toast.success('Bus eliminado'),
      onError: () => {
        toast.error('Error al eliminar el bus');
        queryClient.invalidateQueries({ queryKey: ['buses'] });
      },
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  if (isError) return <BusesErrorState message={(error as Error).message} onRetry={() => queryClient.refetchQueries({ queryKey: ['buses'] })} />;

  return (
    <><main className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <BusesPageHeader onCreateClick={() => setDialogOpen(true)} />
      <BusesStatsCards stats={stats} isLoading={isLoading} />
      <BusesFiltersPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <BusCardSkeleton key={i} />)
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteBus}
                onEdit={setEditingBus}
                onViewHistory={setHistoryBus}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
      {!isLoading && filteredBuses.length === 0 && <BusesEmptyState onResetFilters={handleResetFilters} />}
    </main>
      <CreateBusDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditBusDialog
        open={!!editingBus}
        onOpenChange={(open) => { if (!open) setEditingBus(null); }}
        bus={editingBus}
      />
      <BusesHistoryDialog
        open={!!historyBus}
        onOpenChange={(open) => { if (!open) setHistoryBus(null); }}
        bus={historyBus}
      />
    </>
  );
};
