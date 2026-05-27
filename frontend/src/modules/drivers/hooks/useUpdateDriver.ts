import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDriver } from '@/modules/drivers/api/updateDriver';
import { getErrorMessage } from '@/common/utils';
import type { CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import type { Driver } from '@/modules/drivers/types';

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<Driver, Error, { id: string; data: CreateDriverInput }>({
    mutationFn: ({ id, data }) => updateDriver(id, data),
    onSuccess: (updatedDriver) => {
      queryClient.setQueryData<Driver[]>(['drivers'], (old) =>
        old ? old.map(d => d.id === updatedDriver.id ? updatedDriver : d) : [updatedDriver]
      );
      toast.success('Conductor actualizado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
