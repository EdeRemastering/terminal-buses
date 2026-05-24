import { useState, useMemo } from 'react';
import { useTrips } from '@/modules/trips/hooks/useTrips';
import { CreateTripDialog } from '@/modules/trips/components/CreateTripDialog';
import { EditTripDialog } from '@/modules/trips/components/EditTripDialog';
import { TripManageDialog } from '@/modules/trips/components/TripManageDialog';
import { TripPassengersDialog } from '@/modules/trips/components/TripPassengersDialog';
import { ConfirmCancelDialog } from '@/modules/trips/components/ConfirmCancelDialog';
import { TripsPageHeader } from '@/modules/trips/components/TripsPageHeader';
import { TripsSearchFilters } from '@/modules/trips/components/TripsSearchFilters';
import { TripCard } from '@/modules/trips/components/TripCard';
import { TripCardSkeleton } from '@/modules/trips/components/TripCardSkeleton';
import { TripsErrorState } from '@/modules/trips/components/TripsErrorState';
import { TripsEmptyState } from '@/modules/trips/components/TripsEmptyState';
import type { Trip, TripStatus } from '@/modules/trips/types';

export const TripsPage = () => {
  const { data: trips, isLoading, isError, error } = useTrips();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [managingTrip, setManagingTrip] = useState<Trip | null>(null);
  const [passengersTrip, setPassengersTrip] = useState<Trip | null>(null);
  const [cancellingTrip, setCancellingTrip] = useState<Trip | null>(null);
  // TODO: considerar useReducer en lugar de 5 useState para los dialogos
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    let filtered = trips;

    if (searchValue) {
      const q = searchValue.toLowerCase();
      filtered = filtered.filter(t =>
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.busId.toLowerCase().includes(q) ||
        (t.driverName ?? '').toLowerCase().includes(q) ||
        (t.routeName ?? '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filtro por fecha: hoy o esta semana (desde el inicio del dia actual)
    if (dateFilter !== 'ALL') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (dateFilter === 'TODAY') {
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => {
          const d = new Date(t.departureTime);
          return d >= startOfDay && d < endOfDay;
        });
      } else if (dateFilter === 'WEEK') {
        const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => {
          const d = new Date(t.departureTime);
          return d >= startOfDay && d < endOfWeek;
        });
      }
    }

    return filtered;
  }, [trips, searchValue, statusFilter, dateFilter]);

  if (isError) return <TripsErrorState message={(error as Error).message} onRetry={() => window.location.reload()} />;

  return (
    <>
      <main className="w-full max-w-7xl mx-auto space-y-8 pb-12">
        <TripsPageHeader onCreateClick={() => setDialogOpen(true)} />
        <TripsSearchFilters
          placeholder="Buscar por ruta, bus o conductor..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)
          ) : (
            filteredTrips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={index}
                onManage={setManagingTrip}
                onEdit={setEditingTrip}
                onViewPassengers={setPassengersTrip}
                onCancel={setCancellingTrip}
              />
            ))
          )}
        </div>

        {!isLoading && filteredTrips.length === 0 && <TripsEmptyState onCreateClick={() => setDialogOpen(true)} />}
      </main>
      <CreateTripDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditTripDialog open={!!editingTrip} onOpenChange={(open) => { if (!open) setEditingTrip(null); }} trip={editingTrip} />
      {/* HACK: retraso para que el dialogo anterior se cierre antes de abrir el siguiente */}
      <TripManageDialog
        open={!!managingTrip}
        onOpenChange={(open) => { if (!open) setManagingTrip(null); }}
        trip={managingTrip}
        onEdit={(t) => { setManagingTrip(null); setTimeout(() => setEditingTrip(t), 100); }}
        onViewPassengers={(t) => { setManagingTrip(null); setTimeout(() => setPassengersTrip(t), 100); }}
        onCancel={(t) => { setManagingTrip(null); setTimeout(() => setCancellingTrip(t), 100); }}
      />
      <TripPassengersDialog open={!!passengersTrip} onOpenChange={(open) => { if (!open) setPassengersTrip(null); }} trip={passengersTrip} />
      <ConfirmCancelDialog open={!!cancellingTrip} onOpenChange={(open) => { if (!open) setCancellingTrip(null); }} trip={cancellingTrip} />
    </>
  );
};
