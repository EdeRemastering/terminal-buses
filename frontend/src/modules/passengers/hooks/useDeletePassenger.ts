import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePassenger } from '@/modules/passengers/api/deletePassenger';
import type { Passenger } from '@/modules/passengers/types';

export const useDeletePassenger = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePassenger,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Passenger[]>(['passengers'], (old) =>
        old ? old.filter(p => p.id !== id) : old
      );
    },
  });
};
