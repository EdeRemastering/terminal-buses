import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDriver } from '@/modules/drivers/api/createDriver';
import type { CreateDriverInput } from '@/modules/drivers/schemas/driverSchema';
import type { Driver } from '@/modules/drivers/types';

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<Driver, Error, CreateDriverInput>({
    mutationFn: createDriver,
    onSuccess: (newDriver) => {
      queryClient.setQueryData<Driver[]>(['drivers'], (old) =>
        old ? [...old, newDriver] : [newDriver]
      );
    },
  });
};
