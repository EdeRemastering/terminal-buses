import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDriver } from '@/modules/drivers/api/deleteDriver';
import { getErrorMessage } from '@/common/utils';
import type { Driver } from '@/modules/drivers/types';

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteDriver,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Driver[]>(['drivers'], (old) =>
        old ? old.filter(d => d.id !== id) : old
      );
      toast.success('Conductor eliminado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
