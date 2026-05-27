import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRoute } from '@/modules/routes/api/deleteRoute';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteRoute,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Route[]>(['routes'], (old) =>
        old ? old.filter(r => r.id !== id) : old
      );
    },
  });
};
