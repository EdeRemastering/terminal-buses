import { useQuery } from '@tanstack/react-query';
import { getRoutes } from '@/modules/routes/api/getRoutes';

export const useRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes,
  });
};
