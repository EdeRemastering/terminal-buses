import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelTrip } from '@/modules/trips/api/cancelTrip';
import type { Trip } from '@/modules/trips/types';

export const useCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, string>({
    mutationFn: cancelTrip,
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.map(t => t.id === updatedTrip.id ? updatedTrip : t) : [updatedTrip]
      );
    },
  });
};
