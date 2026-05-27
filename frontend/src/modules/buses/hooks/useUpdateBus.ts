import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBus } from '@/modules/buses/api/updateBus';
import { getErrorMessage } from '@/common/utils';
import type { UpdateBusInput } from '@/modules/buses/schemas/busSchema';
import type { Bus } from '@/modules/buses/types';

export const useUpdateBus = () => {
  const queryClient = useQueryClient();

  return useMutation<Bus, Error, { id: string; data: UpdateBusInput }, { previousBuses: Bus[] | undefined }>({
    mutationFn: ({ id, data }) => updateBus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['buses'] });
      const previousBuses = queryClient.getQueryData<Bus[]>(['buses']);
      if (previousBuses) {
        queryClient.setQueryData<Bus[]>(['buses'], 
          previousBuses.map(b => b.id === id ? { ...b, ...data } : b)
        );
      }
      return { previousBuses };
    },
    onSuccess: (updatedBus) => {
      queryClient.setQueryData<Bus[]>(['buses'], (old) =>
        old ? old.map(b => b.id === updatedBus.id ? updatedBus : b) : [updatedBus]
      );
    },
    onError: (err, _, context) => {
      if (context?.previousBuses) {
        queryClient.setQueryData(['buses'], context.previousBuses);
      }
      toast.error(getErrorMessage(err));
    },
  });
};
