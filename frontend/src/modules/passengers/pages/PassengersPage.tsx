import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { usePassengers } from '@/modules/passengers/hooks/usePassengers';
import { CreatePassengerDialog } from '@/modules/passengers/components/CreatePassengerDialog';
import { AssignPointsDialog } from '@/modules/passengers/components/AssignPointsDialog';
import { PassengersPageHeader } from '@/modules/passengers/components/PassengersPageHeader';
import { PassengersStatsCards } from '@/modules/passengers/components/PassengersStatsCards';
import { PassengersFilters } from '@/modules/passengers/components/PassengersFilters';
import { PassengerCard } from '@/modules/passengers/components/PassengerCard';
import { PassengerCardSkeleton } from '@/modules/passengers/components/PassengerCardSkeleton';
import { PassengersErrorState } from '@/modules/passengers/components/PassengersErrorState';
import { PassengersEmptyState } from '@/modules/passengers/components/PassengersEmptyState';
import type { Passenger } from '@/modules/passengers/types';

export const PassengersPage = () => {
  const { data: passengers, isLoading, isError, error } = usePassengers();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pointsPassenger, setPointsPassenger] = useState<Passenger | null>(null);

  const stats = !passengers ? { total: 0, active: 0, inactive: 0, premium: 0 } : {
    total: passengers.length,
    active: passengers.filter(p => p.status === 'ACTIVE').length,
    inactive: passengers.filter(p => p.status === 'INACTIVE').length,
    premium: passengers.filter(p => p.frequentTravelerPoints >= 1000).length,
  };

  const filteredPassengers = useMemo(() => {
    if (!passengers) return [];
    return passengers.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.documentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [passengers, searchTerm, statusFilter]);

  const handleToggleStatus = (id: string, newStatus: Passenger['status']) => {
    queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
      old ? old.map(p => p.id === id ? { ...p, status: newStatus } : p) : old
    );
  };

  const handleDelete = (id: string) => {
    queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
      old ? old.filter(p => p.id !== id) : old
    );
  };

  if (isError) {
    return <PassengersErrorState message={(error as Error).message} onRetry={() => window.location.reload()} />;
  }

  return (
    <main className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <PassengersPageHeader onCreateClick={() => setDialogOpen(true)} />

      <PassengersStatsCards stats={stats} isLoading={isLoading} />

      <PassengersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <PassengerCardSkeleton />
            <PassengerCardSkeleton />
            <PassengerCardSkeleton />
            <PassengerCardSkeleton />
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPassengers.map((p, index) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <PassengerCard
                  passenger={p}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onAssignPoints={setPointsPassenger}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isLoading && filteredPassengers.length === 0 && (
        <PassengersEmptyState onResetFilters={() => { setSearchTerm(''); setStatusFilter('ALL'); }} />
      )}

      <CreatePassengerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AssignPointsDialog
        passenger={pointsPassenger}
        open={!!pointsPassenger}
        onOpenChange={(open) => { if (!open) setPointsPassenger(null); }}
      />
    </main>
  );
};
