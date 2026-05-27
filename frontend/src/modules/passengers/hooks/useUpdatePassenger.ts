import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePassenger } from '@/modules/passengers/api/updatePassenger';
import { getErrorMessage } from '@/common/utils';
import type { CreatePassengerInput } from '@/modules/passengers/schemas/passengerSchema';
import type { Passenger } from '@/modules/passengers/types';

export const useUpdatePassenger = () => {
  const queryClient = useQueryClient();

  return useMutation<Passenger, Error, { id: string; data: CreatePassengerInput }>({
    mutationFn: ({ id, data }) => updatePassenger(id, data),
    onSuccess: (updatedPassenger) => {
      queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
        old ? old.map(p => p.id === updatedPassenger.id ? updatedPassenger : p) : [updatedPassenger]
      );
      toast.success('Pasajero actualizado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
