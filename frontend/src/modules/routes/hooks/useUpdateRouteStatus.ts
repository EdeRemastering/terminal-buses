import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRouteStatus } from '@/modules/routes/api/updateRouteStatus';
import { getErrorMessage } from '@/common/utils';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const useUpdateRouteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Route, Error, { id: string; status: Route['status'] }>({
    mutationFn: ({ id, status }) => updateRouteStatus(id, status),
    onSuccess: (updatedRoute) => {
      queryClient.setQueryData<Route[]>(['routes'], (old) =>
        old ? old.map(r => r.id === updatedRoute.id ? updatedRoute : r) : [updatedRoute]
      );
      const label = updatedRoute.status === 'ACTIVE' ? 'Activa' : 'Inactiva';
      toast.success(`Ruta marcada como ${label}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};
