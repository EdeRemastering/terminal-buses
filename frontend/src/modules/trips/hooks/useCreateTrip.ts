import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrip } from '@/modules/trips/api/createTrip';
import { getErrorMessage } from '@/common/utils';
import type { TripFormData } from '@/modules/trips/schemas/tripSchema';
import type { Trip } from '@/modules/trips/types';

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, TripFormData>({
    mutationFn: createTrip,
    onSuccess: (newTrip) => {
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? [...old, newTrip] : [newTrip]
      );
      toast.success('Viaje creado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
