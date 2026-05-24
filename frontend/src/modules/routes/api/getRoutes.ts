import apiClient from '@/common/utils/api-client';
import type { Route } from '@/modules/routes/schemas/routeSchema';

export const getRoutes = async (): Promise<Route[]> => {
  const response = await apiClient.get('/routes');
  return response.data.data;
};
