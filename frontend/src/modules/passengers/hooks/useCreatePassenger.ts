import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPassenger } from '@/modules/passengers/api/createPassenger';
import type { CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import type { Passenger } from '@/modules/passengers/types';

export const useCreatePassenger = () => {
  const queryClient = useQueryClient();

  return useMutation<Passenger, Error, CreatePassengerInput>({
    mutationFn: createPassenger,
    onSuccess: (newPassenger) => {
      queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
        old ? [...old, newPassenger] : [newPassenger]
      );
    },
  });
};
