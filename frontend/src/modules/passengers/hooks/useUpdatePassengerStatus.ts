import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePassengerStatus } from '@/modules/passengers/api/updatePassengerStatus';
import { getErrorMessage } from '@/common/utils';
import type { Passenger } from '@/modules/passengers/types';

export const useUpdatePassengerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Passenger, Error, { id: string; status: Passenger['status'] }>({
    mutationFn: ({ id, status }) => updatePassengerStatus(id, status),
    onSuccess: (updatedPassenger) => {
      queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
        old ? old.map(p => p.id === updatedPassenger.id ? updatedPassenger : p) : [updatedPassenger]
      );
      const label = updatedPassenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
      toast.success(`Estado del pasajero cambiado a ${label}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
    },
  });
};
