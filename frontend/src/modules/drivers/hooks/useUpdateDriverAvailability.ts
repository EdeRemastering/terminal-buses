import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDriverAvailability } from '@/modules/drivers/api/updateDriverAvailability';
import { getErrorMessage } from '@/common/utils';
import type { Driver } from '@/modules/drivers/types';

export const useUpdateDriverAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation<Driver, Error, { id: string; availability: Driver['availability'] }>({
    mutationFn: ({ id, availability }) => updateDriverAvailability(id, availability),
    onSuccess: (updatedDriver) => {
      queryClient.setQueryData<Driver[]>(['drivers'], (old) =>
        old ? old.map(d => d.id === updatedDriver.id ? updatedDriver : d) : [updatedDriver]
      );
      const label = updatedDriver.availability === 'AVAILABLE' ? 'Disponible' : updatedDriver.availability === 'ON_TRIP' ? 'En Ruta' : 'Fuera de Servicio';
      toast.success(`Disponibilidad cambiada a ${label}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};
