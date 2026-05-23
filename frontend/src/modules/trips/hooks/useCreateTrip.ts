import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrip } from '@/modules/trips/api/createTrip';
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
    },
  });
};
