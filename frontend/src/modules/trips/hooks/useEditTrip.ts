import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editTrip } from '@/modules/trips/api/editTrip';
import { getErrorMessage } from '@/common/utils';
import type { TripFormData } from '@/modules/trips/schemas/tripSchema';
import type { Trip } from '@/modules/trips/types';

export const useEditTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, { id: string; data: Partial<TripFormData> }>({
    mutationFn: ({ id, data }) => editTrip(id, data),
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.map(t => t.id === updatedTrip.id ? updatedTrip : t) : [updatedTrip]
      );
      toast.success('Viaje actualizado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
