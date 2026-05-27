import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBusStatus } from '@/modules/buses/api/updateBusStatus';
import { getErrorMessage } from '@/common/utils';
import type { Bus } from '@/modules/buses/types';

export const useUpdateBusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Bus, Error, { id: string; status: Bus['status'] }>({
    mutationFn: ({ id, status }) => updateBusStatus(id, status),
    onSuccess: (updatedBus) => {
      queryClient.setQueryData<Bus[]>(['buses'], (old) =>
        old ? old.map(b => b.id === updatedBus.id ? updatedBus : b) : [updatedBus]
      );
      const label = updatedBus.status === 'OPERATIONAL' ? 'Operativo' : updatedBus.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Fuera de Servicio';
      toast.success(`Estado del bus cambiado a ${label}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
};
