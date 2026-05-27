import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBus } from '@/modules/buses/api/deleteBus';
import { getErrorMessage } from '@/common/utils';
import type { Bus } from '@/modules/buses/types';

export const useDeleteBus = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteBus,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Bus[]>(['buses'], (old) =>
        old ? old.filter(b => b.id !== id) : old
      );
      toast.success('Bus eliminado exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
