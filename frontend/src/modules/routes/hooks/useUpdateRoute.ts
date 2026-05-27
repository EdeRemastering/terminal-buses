import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRoute } from '@/modules/routes/api/updateRoute';
import { getErrorMessage } from '@/common/utils';
import type { CreateRouteInput } from '@/modules/routes/schemas/routeSchema';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation<Route, Error, { id: string; data: CreateRouteInput }>({
    mutationFn: ({ id, data }) => updateRoute(id, data),
    onSuccess: (updatedRoute) => {
      queryClient.setQueryData<Route[]>(['routes'], (old) =>
        old ? old.map(r => r.id === updatedRoute.id ? updatedRoute : r) : [updatedRoute]
      );
      toast.success('Ruta actualizada exitosamente');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
