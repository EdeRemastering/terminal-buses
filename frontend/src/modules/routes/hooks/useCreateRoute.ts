import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoute } from '@/modules/routes/api/createRoute';
import type { CreateRouteInput } from '@/modules/routes/schemas/routeSchema';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation<Route, Error, CreateRouteInput>({
    mutationFn: createRoute,
    onSuccess: (newRoute) => {
      queryClient.setQueryData<Route[]>(['routes'], (old) =>
        old ? [...old, newRoute] : [newRoute]
      );
    },
  });
};
