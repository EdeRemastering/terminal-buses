import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBus } from '@/modules/buses/api/createBus';
import type { CreateBusInput } from '@/modules/buses/schemas/busSchema';
import type { Bus } from '@/modules/buses/types';

export const useCreateBus = () => {
  const queryClient = useQueryClient();

  return useMutation<Bus, Error, CreateBusInput>({
    mutationFn: createBus,
    onSuccess: (newBus) => {
      queryClient.setQueryData<Bus[]>(['buses'], (old) =>
        old ? [...old, newBus] : [newBus]
      );
    },
    onError: (err) => {
      console.warn('[useCreateBus] fallo al crear bus:', err.message);
    },
  });
};
