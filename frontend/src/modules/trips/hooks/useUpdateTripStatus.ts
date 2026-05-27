import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripStatus } from '@/modules/trips/api/updateTripStatus';
import { getErrorMessage } from '@/common/utils';
import type { Trip, TripStatus } from '@/modules/trips/types';

const statusLabels: Record<TripStatus, string> = {
  PENDING: 'Programado',
  BOARDING: 'Abordando',
  IN_PROGRESS: 'En Ruta',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, { id: string; status: TripStatus }>({
    mutationFn: ({ id, status }) => updateTripStatus(id, status),
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.map(t => t.id === updatedTrip.id ? updatedTrip : t) : [updatedTrip]
      );
      toast.success(`Viaje marcado como "${statusLabels[updatedTrip.status]}"`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
